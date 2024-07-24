import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Octicons, AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { supabase } from "../utils/supabase";
import Replies from "./Replies";
const Comment = ({
  username,
  message,
  photo,
  media,
  type,
  handleReplyClick,
  commentId,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [replies, setReplies] = useState([]);
  useEffect(() => {
    if (commentId) {
      getReplies();
    }
  }, [commentId]);
  const getReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("replies")
        .select(`*, profiles (id,username,photo)`)
        .eq("comment", commentId);
      if (error) {
        throw error;
      }
      setReplies(data);
    } catch (error) {
      console.log("error getting replies: " + error.message);
    }
  };
  const handleMediaPress = () => {
    setModalVisible(true);
  };

  const closeMediaPreview = () => {
    setModalVisible(false);
  };
  const renderItem = ({ item }) => (
    <Replies
      username={item.profiles.username}
      photo={item.profiles.photo}
      media={item.media}
      type={item.media_type}
      message={item.message}
    />
  );
  return (
    <View>
      <View style={styles.commentContainer}>
        <View style={{ flexDirection: "row", gap: 4, flex: 1 }}>
          <Image source={{ uri: photo }} style={styles.profileImage} />
          <View style={{ top: -3, flex: 1 }}>
            <Text style={styles.username}>{username}</Text>
            {media ? (
              <Pressable style={styles.mediaButton} onPress={handleMediaPress}>
                {type === "video" ? (
                  <Feather name="video" size={12} color="black" />
                ) : (
                  <AntDesign name="picture" size={12} color="black" />
                )}
                <Text style={styles.mediaText}>
                  {type === "video" ? "Video" : "Image"}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.commentText}>{message}</Text>
            )}
          </View>
        </View>
        <Pressable
          onPress={() => handleReplyClick(commentId, username)}
          style={styles.replyButton}
        >
          <Octicons name="reply" size={14} color="#9F9F9F" />
        </Pressable>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeMediaPreview}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalCloseButton}
              onPress={closeMediaPreview}
            >
              <FontAwesome5 name="times" size={15} color="#fff" />
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
            {type === "video" ? (
              <Video
                source={{ uri: media }}
                style={styles.mediaPreview}
                resizeMode="contain"
                shouldPlay
                useNativeControls
              />
            ) : (
              <Image source={{ uri: media }} style={styles.mediaPreview} />
            )}
          </View>
        </Modal>
      </View>
      <FlatList
        data={replies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
    marginBottom: 3,
  },
  profileImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  username: {
    fontWeight: "bold",
    color: "#001138",
    fontSize: 10,
  },
  commentText: {
    fontWeight: "300",
    fontSize: 10,
    color: "black",
  },
  mediaButton: {
    flexDirection: "row",
    gap: 3,
    padding: 2,
    paddingHorizontal: 8,
    borderRadius: 3,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    alignSelf: "flex-start", // This will make the button fit its content
  },
  mediaText: {
    fontWeight: "600",
    fontSize: 10,
    color: "#9F9F9F",
  },
  replyButton: {
    padding: 4, // Add padding to ensure the button is easy to tap
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    backgroundColor: "#9B0E10",
    padding: 5,
    borderRadius: 3,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  mediaPreview: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
});

export default Comment;
