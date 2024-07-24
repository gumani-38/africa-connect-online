import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FontAwesome,
  Feather,
  FontAwesome5,
  MaterialIcons,
  Foundation,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { supabase } from "../utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import UpdateBottomSheet from "../components/UpdateBottomSheet";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const bottomSheetModalRef = useRef(null);
  const [type, setType] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  useEffect(() => {
    getUser();
    if (userId) {
      getUserProfile();
      getFollowers();
      getFollowings();
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      const allChangesSubscription = supabase
        .channel("public:*")
        .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
          getUserProfile();
          getFollowers();
          getFollowings();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(allChangesSubscription);
      };
    }, [])
  );
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user.user_metadata);
    setUserId(user.id);
  };
  const getFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select(`*`)
        .eq("user", userId);
      if (error) {
        throw error;
      }
      setFollowers(data.length);
    } catch (error) {
      console.log("error message getting followers count : ", error.message);
    }
  };
  const getFollowings = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select(`*`)
        .eq("following", userId);
      if (error) {
        throw error;
      }
      setFollowing(data.length);
    } catch (error) {
      console.log("error getting the followings count : ", error.message);
    }
  };

  const getUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*, countries(name)`)
        .eq("id", userId);
      if (error) {
        throw error;
      }
      setUserProfile(data[0]);
      setImage(data[0].photo);
    } catch (error) {
      console.log("error message getting the profile : ", error.message);
    }
  };
  const uploadImage = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
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
        console.log("Image uploaded successfully:", data);
        await getUploadedImageUri(filePath);
      }
    } catch (err) {
      console.error("Error reading file or uploading image:", err.message);
    }
  };
  const getUploadedImageUri = async (filePath) => {
    try {
      const { data, error } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      if (error) {
        console.error("Error retrieving the image URL:", error.message);
      } else {
        setImage(data.publicUrl);
        const { error } = await supabase
          .from("profiles")
          .update({ photo: data.publicUrl })
          .eq("id", userId);
        console.log("Uploaded image URL:", data);
      }
    } catch (err) {
      console.error("Error retrieving the image URL:", err.message);
    }
  };
  const deleteImage = async (filePath, newImageUri) => {
    try {
      const { error } = await supabase.storage
        .from("profiles")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting old image:", error.message);
      } else {
        await uploadImage(newImageUri);
      }
    } catch (err) {
      console.error("Error deleting the image:", err.message);
    }
  };

  function handlePresentModal(type) {
    setType(type);
    bottomSheetModalRef.current?.present();
  }
  function handleCloseModal() {
    bottomSheetModalRef.current?.close();
  }
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", userId);

      if (error) {
        console.error("Error fetching user profile:", error.message);
        return;
      }
      if (!data[0].photo) {
        await uploadImage(result.assets[0].uri);
      } else {
        await deleteImage(data.photo, result.assets[0].uri);
      }
    }
  };
  const handleLogOutClick = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.navigate("Login");
    } catch (error) {
      console.log(`logging out the user`, error);
    }
  };
  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ padding: 7 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                marginVertical: 10,
                alignItems: "flex-end",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Pressable onPress={() => navigation.navigate("MyPost")}>
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "#9B0E10",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                  }}
                >
                  <Foundation name="page-multiple" size={19} color="white" />
                </View>
              </Pressable>
              {userProfile?.isAdmin && (
                <Pressable onPress={() => navigation.navigate("AddGroup")}>
                  <View
                    style={{
                      backgroundColor: "#9B0E10",
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="group-add" size={22} color="white" />
                  </View>
                </Pressable>
              )}
            </View>

            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <View style={{ position: "relative" }}>
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{
                      position: "relative",
                      padding: 10,
                      width: 90,
                      height: 90,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      resizeMode: "cover",
                      borderRadius: 45,
                      borderColor: "#9F9F9F",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      position: "relative",
                      padding: 10,
                      width: 140,
                      height: 140,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 3,
                      borderRadius: 70,
                      borderColor: "#9F9F9F",
                    }}
                  >
                    <FontAwesome5 name="user" size={85} color="black" />
                  </View>
                )}
                <Pressable
                  onPress={pickImage}
                  style={{
                    position: "absolute",
                    backgroundColor: "#9B0E10",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    bottom: 12,
                    right: -6,
                  }}
                >
                  <View>
                    <FontAwesome name="camera" size={15} color="white" />
                  </View>
                </Pressable>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginVertical: 3,
                    textTransform: "capitalize",
                  }}
                >
                  {user?.first_name + "  " + user?.last_name}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#41DDFF",
                    textAlign: "center",

                    textTransform: "capitalize",
                  }}
                >
                  {userProfile?.username}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#9F9F9F",
                    textAlign: "center",
                  }}
                >
                  Gender: {userProfile?.gender}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{ marginHorizontal: 4, flexDirection: "row", gap: 3 }}
              >
                <Text
                  style={{
                    backgroundColor: "#9B0E10",
                    borderRadius: 20,
                    paddingHorizontal: 8,
                    textAlign: "center",
                    paddingVertical: 1,
                    color: "white",
                    fontSize: 11,
                  }}
                >
                  {followers}
                </Text>
                <Text
                  style={{
                    textTransform: "capitalize",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  connecting
                </Text>
              </View>
              <View
                style={{ height: 19, backgroundColor: "#888", width: 1 }}
              ></View>
              <View
                style={{ marginHorizontal: 4, flexDirection: "row", gap: 3 }}
              >
                <Text
                  style={{
                    backgroundColor: "#9B0E10",
                    borderRadius: 20,
                    paddingHorizontal: 8,
                    textAlign: "center",
                    paddingVertical: 1,
                    color: "white",
                    fontSize: 11,
                  }}
                >
                  {following}
                </Text>
                <Text
                  style={{
                    textTransform: "capitalize",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  connected
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 15,
              }}
            >
              <Pressable onPress={() => handlePresentModal("")}>
                <View
                  style={{
                    padding: 14,
                    borderRadius: 5,
                    backgroundColor: "white",
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>Bio</Text>
                </View>
              </Pressable>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  padding: 14,
                  borderRadius: 5,
                  marginTop: 10,
                  marginBottom: 7,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    Date of Birth -
                  </Text>
                  <Text style={{ fontSize: 13, color: "#9F9F9F" }}>
                    {userProfile?.date_of_birth}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  padding: 14,
                  borderRadius: 5,
                  marginBottom: 7,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    Email -
                  </Text>
                  <Text style={{ fontSize: 13, color: "#9F9F9F" }}>
                    {user?.email}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  padding: 14,
                  borderRadius: 5,
                  marginBottom: 7,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    Location -
                  </Text>
                  <Text style={{ fontSize: 13, color: "#9F9F9F" }}>
                    {userProfile?.countries?.name}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  padding: 14,
                  borderRadius: 5,
                  marginBottom: 7,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 7,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    Password -
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 9,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#9F9F9F" }}>
                      **********
                    </Text>
                    <Pressable onPress={() => handlePresentModal("password")}>
                      <Feather
                        style={{ top: -3 }}
                        name="edit"
                        size={15}
                        color="#9B0E10"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
              <Pressable onPress={handleLogOutClick}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#9B0E10",
                    padding: 10,
                    borderRadius: 5,
                    marginTop: 12,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: "bold",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      Sign Out
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <UpdateBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        type={type}
        userId={userId}
        handleCloseModal={handleCloseModal}
      />
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
