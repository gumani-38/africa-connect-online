import {
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  View,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Entypo, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "../utils/supabase";
import ProgressBar from "../components/ProgressBar";
import SuccessAlert from "../components/SuccessAlert";
import { useNavigation } from "@react-navigation/native";

const UploadPostScreen = () => {
  const [medias, setMedias] = useState([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [captionError, setCaptionError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigation = useNavigation();
  const [tags, setTags] = useState("");
  const [userId, setUserId] = useState("");
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };

  useEffect(() => {
    getUser();
  }, [userId]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      allowsMultipleSelection: true,
      aspect: [8, 7],
      quality: 1,
    });

    if (!result.canceled) {
      setMedias([...medias, ...result.assets]);
    }
  };
  const handleUploadPostClick = async () => {
    try {
      if (!caption) {
        setCaptionError(true);
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

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author: userId,
          title: title ? title : null,
          caption: caption,
        })
        .select();

      if (error) {
        setLoading(false);
        setProgress(0);
        throw error;
      }
      uploadTags(data[0].id);
      uploadImages(data[0].id);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setShowSuccess(true);
        setMedias([]);
        setCaption("");
        setTitle("");
        setTags("");
        setTimeout(() => {
          navigation.navigate("MyPost");
          setShowSuccess(false);
        }, 300);
      }, 1000);
    } catch (error) {
      console.log("Error inserting data:", error);
    }
  };
  const uploadTags = async (postId) => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .insert([
          ...tags
            .split(",")
            .map((tag) => ({ tag: tag.trim(), post: postId, user: userId })),
        ]);
      if (error) {
        throw error;
      }
      console.log("Tags inserted successfully:", data);
    } catch (error) {
      console.log("Error inserting tags:", error);
    }
  };
  const uploadImages = async (postId) => {
    try {
      for (let i = 0; i < medias.length; i++) {
        let media = medias[i];
        const base64 = await FileSystem.readAsStringAsync(media.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const filePath = `${userId + new Date().getTime()}.${
          media.type === "image" ? "png" : "mp4"
        }`;
        const contentType = media.type === "image" ? "image/png" : "video/mp4";
        const { data, error } = await supabase.storage
          .from("posts")
          .upload(filePath, decode(base64), { contentType });

        if (error) {
          console.error("Error uploading image:", error.message);
        } else {
          console.log("Image uploaded successfully:", data);
          await getUploadedImageUri(filePath, postId, media.type);
        }
      }
      navigation.navigate("MyPost");
    } catch (err) {
      console.error("Error reading file or uploading image:", err.message);
    }
  };
  const getUploadedImageUri = async (filePath, postId, type) => {
    try {
      const { data, error } = supabase.storage
        .from("posts")
        .getPublicUrl(filePath);

      if (error) {
        console.error("Error retrieving the image URL:", error.message);
      } else {
        insertMedias(postId, type, data.publicUrl);
      }
    } catch (err) {
      console.error("Error retrieving the image URL:", err.message);
    }
  };
  const insertMedias = async (postId, type, media) => {
    try {
      const { data, error } = await supabase
        .from("post_media")
        .insert({ post: postId, type: type, media: media });
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Error uploading image to the database: ", err.message);
    }
  };
  const deleteImage = async (uri) => {
    try {
      setMedias(medias.filter((i) => i.uri !== uri));
    } catch (err) {
      console.log("Error deleting image", err.message);
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
            style={{ padding: 7, paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 40,
              }}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {medias?.map((item, index) => (
                  <View style={{ position: "relative" }}>
                    {item?.type === "video" ? (
                      <>
                        <Video
                          source={{ uri: item?.uri }}
                          style={{
                            width: 90,
                            height: 90,
                            borderRadius: 4,
                            marginHorizontal: 4,
                          }}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay
                          isLooping
                          isMuted
                        />
                        <Pressable
                          onPress={() => deleteImage(item?.uri)}
                          style={{
                            backgroundColor: "#9B0E10",
                            position: "absolute",
                            top: 0,
                            borderTopRightRadius: 4,
                            padding: 2,
                            right: 4,
                          }}
                        >
                          <Feather name="trash-2" size={21} color="white" />
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Image
                          source={{ uri: item?.uri }}
                          style={{
                            width: 90,
                            height: 90,
                            borderRadius: 4,
                            marginHorizontal: 4,
                          }}
                        />
                        <Pressable
                          onPress={() => deleteImage(item?.uri)}
                          style={{
                            backgroundColor: "#9B0E10",
                            position: "absolute",
                            top: 0,
                            borderTopRightRadius: 4,
                            padding: 2,
                            right: 4,
                          }}
                        >
                          <Feather name="trash-2" size={21} color="white" />
                        </Pressable>
                      </>
                    )}
                  </View>
                ))}
                <Pressable
                  onPress={pickImage}
                  style={{
                    backgroundColor: "#9F9F9F",
                    borderRadius: 5,
                    width: 90,
                    height: 90,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Entypo name="camera" size={30} color="#9B0E10" />
                </Pressable>
              </ScrollView>
            </View>
            <View style={{ marginTop: 18 }}>
              <View>
                <TextInput
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 8,
                    backgroundColor: "white",
                    borderWidth: 3,
                    borderRadius: 4,
                    color: "#001138",
                    borderColor: "#9F9F9F",
                    marginBottom: 25,
                  }}
                  placeholder="enter your title (optional)"
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                  placeholderTextColor={"#9F9F9F"}
                />
              </View>

              <View>
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
                    marginBottom: captionError ? 2 : 15,
                  }}
                  value={caption}
                  onChangeText={(text) => setCaption(text)}
                  placeholder="enter  caption..."
                  multiline={true}
                  placeholderTextColor={"#9F9F9F"}
                />
                {captionError && (
                  <Text
                    style={{
                      color: "red",
                      fontSize: 12,
                      marginBottom: 14,
                      marginLeft: 3,
                    }}
                  >
                    caption is required
                  </Text>
                )}
              </View>

              <View>
                <TextInput
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 8,
                    backgroundColor: "white",
                    borderWidth: 3,
                    color: "#001138",
                    borderRadius: 4,
                    borderColor: "#9F9F9F",
                  }}
                  value={tags}
                  onChangeText={(text) => setTags(text)}
                  placeholder="enter tags (optional)"
                  placeholderTextColor={"#9F9F9F"}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: "700",
                    marginTop: 3,
                    marginBottom: 15,
                  }}
                >
                  Tags should be seperated by comma( creative,africa,etc)
                </Text>
              </View>
            </View>
            <Pressable
              style={{
                backgroundColor: "#9B0E10",
                padding: 10,
                borderRadius: 5,
                marginTop: 35,
                alignItems: "center",
                flexDirection: "row",
                marginBottom: 40,
                gap: 80,
              }}
              onPress={handleUploadPostClick}
            >
              <Entypo
                style={{ marginHorizontal: 14 }}
                name="upload-to-cloud"
                size={24}
                color="white"
              />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#fff",
                  alignItems: "center",
                }}
              >
                Upload Post
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {loading && <ProgressBar process={progress} />}
      {showSuccess && <SuccessAlert />}
    </>
  );
};

export default UploadPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
