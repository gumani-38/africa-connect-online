import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import Comment from "./Comment";
import { useContext, useEffect, useRef, useState } from "react";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "../utils/supabase";

const CommentBottomSheet = ({ isVisible, handleCloseModal, postId }) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState(null);
  const [commentId, setCommentId] = useState(null);
  const [username, setUsername] = useState(null);
  const [postCaptions, setPostCaptions] = useState(null);
  const [authorToken, setAuthorToken] = useState(null);
  const commentInputRef = useRef(null);
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
      setCommentId(null);
      setUsername(null);
      getComments();
      getUserPost();
    }
  }, [postId]);
  const getUserPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles (id,username,photo,expo_push_token)`)
        .eq("id", postId)
        .single();
      if (error) {
        throw error;
      }
      setAuthorToken(data.profiles.expo_push_token);
      setPostCaptions(data.caption);
    } catch (error) {
      console.log("error getting user post author :", error.message);
    }
  };
  const getComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`*, profiles (id,username,photo)`)
        .eq("post", postId);
      if (error) {
        throw error;
      }

      setComments(data);
    } catch (error) {
      console.log("error while getting comments :", error.message);
    }
  };

  const uploadImages = async (media) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(media.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const filePath = `${userId + new Date().getTime()}.${
        media.type === "image" ? "png" : "mp4"
      }`;
      const contentType = media.type === "image" ? "image/png" : "video/mp4";
      const { data, error } = await supabase.storage
        .from("comments")
        .upload(filePath, decode(base64), { contentType });

      if (error) {
        console.error("Error uploading image:", error.message);
      } else {
        await getUploadedImageUri(filePath, postId, media.type);
      }
    } catch (err) {
      console.error("Error reading file or uploading image:", err.message);
    }
  };
  const getUploadedImageUri = async (filePath, postId, type) => {
    try {
      const { data, error } = supabase.storage
        .from("comments")
        .getPublicUrl(filePath);

      if (error) {
        throw error;
      } else {
        insertMediaComment(data.publicUrl, type);
      }
    } catch (err) {
      console.error("Error retrieving the image URL:", err.message);
    }
  };
  const insertMediaComment = async (uri, type) => {
    try {
      if (!username && !commentId) {
        const { data, error } = await supabase.from("comments").insert({
          media: uri,
          media_type: type,
          post: postId,
          author: userId,
        });
        if (error) {
          throw error;
        }

        getComments();
        await sendPushNotification(
          authorToken,
          `a new comment on your post with a caption of ${postCaptions} `
        );
      } else {
        const { data, error } = await supabase.from("replies").insert({
          media: uri,
          media_type: type,
          comment: commentId,
          author: userId,
        });
        if (error) {
          throw error;
        }
        setCommentId(null);
        setUsername(null);
        getComments();
        await sendPushNotification(
          authorToken,
          `a new comment on your post with a caption of ${postCaptions} `
        );
      }
    } catch (error) {
      console.log("error while inserting media comment :", error.message);
    }
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      uploadImages(result.assets[0]);
    }
  };
  const handleReplyClick = async (commentId, username) => {
    try {
      commentInputRef.current.focus();
      setCommentId(commentId);
      setUsername(username);
      console.log("comment: " + commentId);
    } catch (error) {
      console.log("error while replying to comment :", error.message);
    }
  };
  const handleReplyCancelClick = async () => {
    try {
      commentInputRef.current.blur();
      setCommentId(null);
      setUsername(null);
    } catch (error) {
      console.log("error while replying to comment :", error.message);
    }
  };
  async function sendPushNotification(expoPushToken, text) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Comment",
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
  const renderItem = ({ item }) => (
    <Comment
      username={item.profiles.username}
      photo={item.profiles.photo}
      media={item.media}
      type={item.media_type}
      commentId={item.id}
      handleReplyClick={handleReplyClick}
      message={item.message}
    />
  );
  const handleSendCommentClick = async () => {
    if (!comment) {
      return;
    }
    try {
      if (!username && !commentId) {
        const { data, error } = await supabase.from("comments").insert({
          message: comment,
          post: postId,
          author: userId,
        });
        if (error) {
          throw error;
        }
        getComments();
        await sendPushNotification(
          authorToken,
          `a new comment on your post with a caption of ${postCaptions} `
        );
      } else {
        const { data, error } = await supabase.from("replies").insert({
          message: comment,
          author: userId,
          comment: commentId,
        });
        if (error) {
          throw error;
        }
        setCommentId(null);
        setUsername(null);
        getComments();
      }
      Keyboard.dismiss();
      setComment(null);
    } catch (error) {
      console.log("error while sending comment :", error.message);
    }
  };
  return (
    <BottomModal
      visible={isVisible}
      modalAnimation={
        new SlideAnimation({
          slideFrom: "bottom",
        })
      }
    >
      <ModalContent style={{ width: "100%", height: 500, padding: 0 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600" }}>Comments</Text>
          <Pressable onPress={() => handleCloseModal()}>
            <FontAwesome5 name="times" size={20} color="#9F9F9F" />
          </Pressable>
        </View>
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            padding: 4,
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {commentId && username && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 4,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#9F9F9F",
                  fontSize: 12,
                  flex: 1,
                }}
              >
                replying to {username}
              </Text>
              <Pressable onPress={handleReplyCancelClick}>
                <Text style={{ color: "red", fontSize: 13 }}>cancel</Text>
              </Pressable>
            </View>
          )}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.inputContainer}
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color="black"
              onPress={pickImage}
            />
            <TextInput
              ref={commentInputRef}
              placeholder="add comment"
              style={styles.textInput}
              value={comment}
              onChangeText={(text) => setComment(text)}
              multiline
            />
            <Pressable
              style={styles.sendButton}
              onPress={handleSendCommentClick}
            >
              <FontAwesome name="send" size={13} color="white" />
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </ModalContent>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderColor: "#9F9F9F",
    borderWidth: 1,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderRadius: 4,
    padding: 3,
  },
  textInput: {
    flex: 1,
    marginLeft: 3,
  },
  sendButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9B0E10",
    borderRadius: 13,
  },
});

export default CommentBottomSheet;
