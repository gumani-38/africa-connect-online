import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Entypo, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "../utils/supabase";
import { err } from "react-native-svg";
import ProgressBar from "../components/ProgressBar";
import SuccessAlert from "../components/SuccessAlert";

const AddGroupScreen = () => {
  const navigation = useNavigation();
  const [banner, setBanner] = useState(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState(null);
  const [errMessage, setErrMessage] = useState(null);
  const [description, setDescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const [userId, setUserId] = useState("");
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };
  useEffect(() => {
    getUser();
  }, []);

  const pickBanner = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setBanner(result.assets[0].uri);
    }
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  const deleteBanner = async (uri) => {
    try {
      setBanner(null);
    } catch (err) {
      console.log("Error deleting image", err.message);
    }
  };
  const deleteImage = async (uri) => {
    try {
      setImage(null);
    } catch (err) {
      console.log("Error deleting image", err.message);
    }
  };

  const uploadBanner = async () => {
    try {
      const base64 = await FileSystem.readAsStringAsync(banner, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const filePath = `cover_photos/${userId}_${Date.now()}.png`;
      const contentType = "image/png";

      const { data, error } = await supabase.storage
        .from("profiles")
        .upload(filePath, decode(base64), { contentType });

      if (error) {
        console.error("Error uploading image:", error.message);
      } else {
        return await getUploadedImageUri(filePath);
      }
    } catch (error) {
      console.log("Error uploading banner", err.message);
    }
  };
  const uploadProfilePhoto = async () => {
    try {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const filePath = `profile_photos/${userId}_${Date.now()}.png`;
      const contentType = "image/png";

      const { data, error } = await supabase.storage
        .from("profiles")
        .upload(filePath, decode(base64), { contentType });

      if (error) {
        console.error("Error uploading image:", error.message);
      } else {
        return await getUploadedImageUri(filePath);
      }
    } catch (error) {
      console.log("Error uploading banner", err.message);
    }
  };

  const getUploadedImageUri = async (filePath) => {
    try {
      const { data, error } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);
      if (error) {
        throw error;
      }
      return data.publicUrl;
    } catch (err) {
      console.error("Error retrieving the image URL:", err.message);
    }
  };
  const addUserToGroup = async (groupId) => {
    try {
      const { error } = await supabase.from("group_members").insert({
        member: userId,
        group: groupId,
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.log("Error adding user to group : " + error.message);
    }
  };
  const handleCreateGroupClick = async () => {
    try {
      if (!banner) {
        setErrMessage("banner image is required");
        return;
      }
      if (!image) {
        setErrMessage("profile image is required");
        return;
      }
      if (!name) {
        setErrMessage("group name is required");
        return;
      }
      if (!description) {
        setErrMessage("group description or overview is required");
        return;
      }
      setLoading(true);

      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 1) {
            clearInterval(progressInterval);
            return 1;
          }
          return prevProgress + 0.1;
        });
      }, 100);
      let bannerUrl = await uploadBanner();
      let imageUrl = await uploadProfilePhoto();
      const { data, error } = await supabase
        .from("groups")
        .insert({
          admin: userId,
          banner: bannerUrl,
          photo: imageUrl,
          name: name,
          description: description,
        })
        .select("*")
        .single();

      if (error) {
        setLoading(false);
        setProgress(0);
        throw error;
      }
      addUserToGroup(data.id);
      sendMessage();

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setShowSuccess(true);
        setTimeout(() => {
          navigation.goBack();
          setShowSuccess(false);
        }, 300);
      }, 2000);
    } catch (err) {
      console.log("Error creating group", err.message);
    }
  };
  const sendMessage = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        throw error;
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i].expo_push_token) {
          await sendPushNotification(
            data[i].expo_push_token,
            `${name}. its mission or purpose is : ${description}`
          );
        }
      }
    } catch (error) {
      console.log("Error sending push notification", error.message);
    }
  };
  async function sendPushNotification(expoPushToken, text) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Group Added",
      body: text,
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 7,
            marginBottom: 15,
          }}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <View
              style={{
                backgroundColor: "#9B0E10",
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Entypo name="chevron-left" size={24} color="white" />
            </View>
          </Pressable>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Add new Group
          </Text>
          <Image
            source={require("../assets/aco-logo.png")}
            style={{
              width: 50,
              height: 50,
              resizeMode: "contain",
              borderRadius: 25,
            }}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginHorizontal: 10 }}
        >
          {banner ? (
            <View
              style={{
                borderWidth: 2,
                borderRadius: 4,
                marginBottom: 20,
                borderColor: "#9F9F9F",
              }}
            >
              <Image
                source={{ uri: banner }}
                style={{
                  borderRadius: 4,
                  height: 100,
                  width: "100%",
                }}
              />
              <Pressable
                onPress={() => deleteBanner(banner)}
                style={{
                  backgroundColor: "#9B0E10",
                  position: "absolute",
                  top: 0,
                  borderTopRightRadius: 4,
                  padding: 4,
                  right: -2,
                }}
              >
                <Feather name="trash-2" size={21} color="white" />
              </Pressable>
            </View>
          ) : (
            <View>
              <Pressable
                onPress={pickBanner}
                style={{
                  backgroundColor: "#9F9F9F",
                  borderRadius: 5,
                  width: 90,
                  height: 90,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Entypo name="camera" size={30} color="#9B0E10" />
                <Text
                  style={{ fontSize: 14, color: "#001138", fontWeight: "500" }}
                >
                  Banner
                </Text>
              </Pressable>
              {!banner && errMessage && (
                <Text style={{ color: "red", fontSize: 12, marginBottom: 15 }}>
                  {errMessage}
                </Text>
              )}
            </View>
          )}

          <View
            style={{
              backgroundColor: "white",
              padding: 4,
              borderRadius: 4,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#9F9F9F",
            }}
          >
            <TextInput
              placeholder="enter group name"
              value={name}
              onChangeText={(text) => setName(text)}
            />
            {!name && errMessage && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 15 }}>
                {errMessage}
              </Text>
            )}
          </View>

          {image ? (
            <View
              style={{
                position: "relative",
                width: 92,
                height: 90,
                marginBottom: 10,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: "#9F9F9F",
              }}
            >
              <Image
                source={{ uri: image }}
                style={{
                  borderRadius: 5,
                  width: 90,
                  height: 90,
                  resizeMode: "cover",
                }}
              />
              <Pressable
                onPress={() => deleteImage(image)}
                style={{
                  backgroundColor: "#9B0E10",
                  position: "absolute",
                  top: 0,
                  borderTopRightRadius: 4,
                  padding: 4,
                  right: -1,
                }}
              >
                <Feather name="trash-2" size={21} color="white" />
              </Pressable>
            </View>
          ) : (
            <View>
              <Pressable
                onPress={pickImage}
                style={{
                  backgroundColor: "#9F9F9F",
                  borderRadius: 5,
                  width: 90,
                  height: 90,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Entypo name="camera" size={30} color="#9B0E10" />
                <Text
                  style={{ fontSize: 14, color: "#001138", fontWeight: "500" }}
                >
                  Profile
                </Text>
              </Pressable>
              {!image && errMessage && (
                <Text style={{ color: "red", fontSize: 12, marginBottom: 15 }}>
                  {errMessage}
                </Text>
              )}
            </View>
          )}

          <View
            style={{
              backgroundColor: "white",
              padding: 4,
              borderRadius: 4,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#9F9F9F",
            }}
          >
            <TextInput
              placeholder="enter group description"
              style={{
                minHeight: 100,
                color: "#001138",
                textAlignVertical: "top",
                borderColor: "#9F9F9F",
                marginBottom: 20,
              }}
              value={description}
              onChangeText={(text) => setDescription(text)}
              multiline
            />
            {!description && errMessage && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 15 }}>
                {errMessage}
              </Text>
            )}
          </View>
          <Pressable
            onPress={handleCreateGroupClick}
            style={{
              backgroundColor: "#9B0E10",
              padding: 10,
              borderRadius: 4,
              marginTop: 10,
              marginBottom: 30,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
              }}
            >
              Create Group
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      {loading && <ProgressBar process={progress} />}
      {showSuccess && <SuccessAlert />}
    </>
  );
};

export default AddGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
