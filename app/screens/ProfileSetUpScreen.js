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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesome, Feather, FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import ProgressBar from "../components/ProgressBar";
import SuccessAlert from "../components/SuccessAlert";

const ProfileSetUpScreen = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [usernameErr, setUsernameErr] = useState(false);
  const [genderErr, setGenderErr] = useState(false);
  const [dateOfBirthErr, setDateOfBirthErr] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileType, setProfileType] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    getUser();
    if (userId) {
      getUserProfile();
    }
  }, [userId]);
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };
  const getUserProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId);

    if (data[0].username) {
      navigation.replace("Main");
      return;
    } else {
      setImage(data[0].photo);
      setProfileType(data[0].profile_type);
    }
  };
  const [image, setImage] = useState(null);
  const confirmIOSDate = () => {
    setDateOfBirth(date.toDateString());
    toggleDatePicker();
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
      }
    } catch (err) {
      console.error("Error retrieving the image URL:", err.message);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    console.log(userId);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
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
        //delete the image from storage and upload a new one and update the profile photo
        await deleteImage(data.photo, result.assets[0].uri);
      }
    }
  };
  const deleteImage = async (filePath, newImageUri) => {
    try {
      // Delete the old image from storage
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
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  const onChange = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setDate(currentDate);
      if (Platform.OS === "android") {
        toggleDatePicker();
        setDateOfBirth(currentDate.toDateString());
      }
    } else {
      toggleDatePicker();
    }
  };
  const handleUsernameText = async (value) => {
    try {
      const username = value.startsWith("@") ? value.slice(1) : value;
      const profileUsername = "@" + username;
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .ilike("username", profileUsername);

      if (error) {
        throw error;
      }
      if (data.length > 0) {
        setUsernameErr(true);
      } else {
        setUsername(profileUsername);
        setUsernameErr(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSaveClick = async () => {
    try {
      if (profileType != 2) {
        if (!gender) {
          setGenderErr(true);
          return;
        }
        if (!dateOfBirth) {
          setDateOfBirthErr(true);
          return;
        }
      }
      setGenderErr(false);
      setDateOfBirthErr(false);
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
      const { data, error } = await supabase
        .from("profiles")
        .update({
          username: username,
          bio: bio ? bio : null,
          gender: gender ? gender : null,
          date_of_birth: dateOfBirth ? dateOfBirth : null,
        })
        .eq("id", userId);
      if (error) {
        throw error;
      }
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setShowSuccess(true);
        setTimeout(() => {
          navigation.navigate("Main");
          setShowSuccess(false);
        }, 300);
      }, 2000);
    } catch (err) {
      console.log("error updating profile", err);
    }
  };
  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView style={{ padding: 8 }}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20,
                marginBottom: 40,
              }}
            >
              <View>
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{
                      position: "relative",
                      padding: 10,
                      width: 140,
                      height: 140,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      resizeMode: "cover",
                      borderRadius: 70,
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
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    bottom: 12,
                    right: 2,
                  }}
                >
                  <View>
                    <FontAwesome name="camera" size={20} color="white" />
                  </View>
                </Pressable>
              </View>
            </View>

            <TextInput
              style={{
                paddingVertical: 7,
                paddingHorizontal: 8,
                backgroundColor: "white",
                borderWidth: 3,
                borderRadius: 4,
                minHeight: 160,
                color: "#001138",
                textAlignVertical: "top",
                borderColor: "#9F9F9F",
                marginBottom: 10,
              }}
              placeholder="enter  your bio ( optional )"
              value={bio}
              onChangeText={(text) => setBio(text)}
              multiline={true}
            />
            {usernameErr && (
              <View>
                <Text style={{ color: "red", fontSize: 12, marginBottom: 2 }}>
                  Username is already taken
                </Text>
              </View>
            )}
            <TextInput
              style={{
                paddingVertical: 7,
                paddingHorizontal: 8,
                backgroundColor: "white",
                borderWidth: 3,
                borderRadius: 4,
                marginBottom: 20,
                color: "#001138",
                borderColor: "#9F9F9F",
                marginBottom: 10,
              }}
              onChangeText={handleUsernameText}
              placeholder="enter your username"
              placeholderTextColor={"#9F9F9F"}
            />
            {profileType != 2 && genderErr && (
              <View>
                <Text style={{ color: "red", fontSize: 12, marginBottom: 2 }}>
                  gender is required
                </Text>
              </View>
            )}

            {profileType != 2 && (
              <TextInput
                style={{
                  paddingVertical: 7,
                  paddingHorizontal: 8,
                  backgroundColor: "white",
                  borderWidth: 3,
                  borderRadius: 4,
                  marginBottom: 20,
                  color: "#001138",
                  borderColor: "#9F9F9F",
                  marginBottom: 25,
                }}
                value={gender}
                onChangeText={(text) => setGender(text)}
                placeholder="enter your gender"
                placeholderTextColor={"#9F9F9F"}
              />
            )}

            {profileType != 2 && dateOfBirthErr && (
              <View>
                <Text style={{ color: "red", fontSize: 12, marginBottom: 2 }}>
                  dateOfBirth is required
                </Text>
              </View>
            )}
            <View>
              {profileType != 2 && showDatePicker && (
                <DateTimePicker
                  mode="date"
                  display="spinner"
                  value={date}
                  onChange={onChange}
                  style={{ height: 120, marginTop: -10 }}
                />
              )}
              {profileType != 2 && showDatePicker && Platform.OS === "ios" && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <TouchableOpacity
                    onPress={toggleDatePicker}
                    style={{
                      backgroundColor: "#9F9F9F",
                      borderRadius: 4,
                      padding: 4,
                    }}
                  >
                    <Text style={{ color: "#075985", textAlign: "center" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmIOSDate}
                    style={{ backgroundColor: "#9B0E10", borderRadius: 4 }}
                  >
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        padding: 4,
                      }}
                    >
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {profileType != 2 && !showDatePicker && (
                <Pressable onPress={toggleDatePicker}>
                  <TextInput
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 8,
                      backgroundColor: "white",
                      borderWidth: 3,
                      borderRadius: 4,
                      color: "#001138",
                      marginBottom: 20,
                      borderColor: "#9F9F9F",
                      marginBottom: 25,
                    }}
                    value={dateOfBirth}
                    editable={false}
                    onChangeText={setDateOfBirth}
                    placeholder="enter your date of birth"
                    placeholderTextColor={"#9F9F9F"}
                    onPressIn={toggleDatePicker}
                  />
                </Pressable>
              )}
            </View>
            <Pressable
              style={{ marginBottom: 25, marginTop: 30 }}
              onPress={handleSaveClick}
            >
              <View
                style={{
                  backgroundColor: "#9B0E10",
                  padding: 10,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  Save
                </Text>
              </View>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {loading && <ProgressBar process={progress} />}
      {showSuccess && <SuccessAlert />}
    </>
  );
};

export default ProfileSetUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
