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
import ProgressBar from "../components/ProgressBar";
import SuccessAlert from "../components/SuccessAlert";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../utils/supabase";

const UpdatePostScreen = () => {
  const { postId } = useRoute().params;
  const [medias, setMedias] = useState([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [captionError, setCaptionError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };
  useEffect(() => {
    getUser();
    if (postId) {
      getPost();
      getMedia();
      getTags();
    }
  }, [postId]);

  const getPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId);
      if (error) {
        throw error;
      }
      const { title, caption } = data[0];
      setTitle(title);
      setCaption(caption);
    } catch (error) {
      console.log("error getting post: ", error);
    }
  };
  const getTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("post", postId);
      if (error) {
        throw error;
      }
      setTags(data.map((tag) => tag.tag).join(", "));
    } catch (error) {
      console.log("error getting tags: ", error);
    }
  };
  const updateTags = async () => {
    try {
      // Fetch current tags from the database
      const { data: currentTags, error } = await supabase
        .from("tags")
        .select("tag")
        .eq("post", postId);
      if (error) {
        throw error;
      }

      // Map current tags from the database to a simple array of tag strings
      const currentTagNames = currentTags.map((tag) => tag.tag);

      // Parse input tags
      const inputTags = tags.split(",").map((tag) => tag.trim());

      // Find tags to be added
      const tagsToAdd = inputTags.filter(
        (tag) => !currentTagNames.includes(tag)
      );

      // Find tags to be removed
      const tagsToRemove = currentTagNames.filter(
        (tag) => !inputTags.includes(tag)
      );

      // Insert new tags
      for (let tag of tagsToAdd) {
        await supabase.from("tags").insert({ post: postId, tag });
      }

      // Remove old tags
      for (let tag of tagsToRemove) {
        await supabase.from("tags").delete().eq("post", postId).eq("tag", tag);
      }
    } catch (error) {
      console.error("Error updating tags: ", error.message);
    }
  };

  const getMedia = async () => {
    try {
      const { data, error } = await supabase
        .from("post_media")
        .select("*")
        .eq("post", postId);
      if (error) {
        throw error;
      }
      setMedias(data);
    } catch (error) {
      console.log("error getting media: ", error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      allowsMultipleSelection: true,
      aspect: [8, 7],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets);
      uploadImages(result.assets);
      await getMedia();
    }
  };
  const uploadImages = async (postMedias) => {
    try {
      for (let i = 0; i < postMedias.length; i++) {
        let item = postMedias[i];
        const base64 = await FileSystem.readAsStringAsync(item.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const filePath = `${userId + new Date().getTime()}.${
          item.type === "image" ? "png" : "mp4"
        }`;
        const contentType = item.type === "image" ? "image/png" : "video/mp4";
        const { data, error } = await supabase.storage
          .from("posts")
          .upload(filePath, decode(base64), { contentType });

        if (error) {
          throw error;
        }
        await getUploadedImageUri(filePath, item.type);
      }
    } catch (err) {
      console.error("Error reading file or uploading image:", err.message);
    }
  };
  const getUploadedImageUri = async (filePath, type) => {
    try {
      const { data, error } = supabase.storage
        .from("posts")
        .getPublicUrl(filePath);

      if (error) {
        throw error;
      }
      insertMedias(type, data.publicUrl);
    } catch (err) {
      console.error("Error retrieving the image URL:", err.message);
    }
  };

  const insertMedias = async (type, media) => {
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

  const deleteImage = async (uri, id) => {
    try {
      const parsedURL = new URL(uri);
      const path = parsedURL.pathname.split("/storage/v1/object/public/")[1];
      const bucket = path.split("/")[0];
      const filePath = path.split("/").slice(1).join("/");
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) {
        throw error;
      }
      await supabase.from("post_media").delete().eq("id", id);
      getMedia();
    } catch (error) {
      console.error("Error deleting old image:", error.message);
    }
  };
  const handleUpdatePostClick = async () => {
    if (!caption.trim()) {
      setCaptionError(true);
      return;
    }
    setCaptionError(false);
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
    try {
      const { data, error } = await supabase
        .from("posts")
        .update({
          title: title,
          caption: caption,
        })
        .eq("id", postId);

      if (error) {
        throw error;
      }
      updateTags();
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setShowSuccess(true);
        setTimeout(() => {
          navigation.navigate("MyPost");
          setShowSuccess(false);
        }, 700);
      }, 2000);
    } catch (error) {
      console.log("error updating post: ", error);
    }
  };
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
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Entypo name="chevron-left" size={27} color="white" />
            </View>
          </Pressable>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Edit Post</Text>
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
                marginBottom: 10,
              }}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {medias?.map((item, index) => (
                  <View style={{ position: "relative" }} key={index}>
                    {item?.type === "video" ? (
                      <>
                        <Video
                          source={{ uri: item?.media }}
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
                          onPress={() => deleteImage(item?.media, item.id)}
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
                          source={{ uri: item?.media }}
                          style={{
                            width: 90,
                            height: 90,
                            borderRadius: 4,
                            marginHorizontal: 4,
                          }}
                        />
                        <Pressable
                          onPress={() => deleteImage(item?.media, item.id)}
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
                    marginBottom: 10,
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
                    marginBottom: 6,
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
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                marginBottom: 40,
                gap: 80,
              }}
              onPress={handleUpdatePostClick}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                Update Post
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

export default UpdatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
