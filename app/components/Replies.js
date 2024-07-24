import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, Modal } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { Octicons, AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";

const Replies = ({ username, message, photo, media, type }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleMediaPress = () => {
    setModalVisible(true);
  };

  const closeMediaPreview = () => {
    setModalVisible(false);
  };

  return (
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
  );
};

export default Replies;

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    gap: 6,
    padding: 4,
    marginLeft: 35,
    marginBottom: 3,
    justifyContent: "flex-end",
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
    color: "#9F9F9F",
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
