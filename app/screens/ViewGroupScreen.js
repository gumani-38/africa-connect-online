import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  View,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Modal,
  Dimensions,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  AntDesign,
  FontAwesome5,
  SimpleLineIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { Video } from "expo-av";
import { WebView } from "react-native-webview";
import { supabase } from "../utils/supabase";
import { formatDistanceToNow, parseISO } from "date-fns";
import Message from "../components/Message";

const { height } = Dimensions.get("window");

const ViewGroupScreen = () => {
  const { groupId } = useRoute().params;
  const [group, setGroup] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [filePreviewModalVisible, setFilePreviewModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
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
    if (groupId && userId) {
      getGroup();
      getUserProfile();
      getMessages();
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      const allChangesSubscription = supabase
        .channel("public:*")
        .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
          getGroup();
          getUserProfile();
          getMessages();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(allChangesSubscription);
      };
    }, [])
  );

  const getUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*, countries(name)`)
        .eq("id", userId)
        .single();
      if (error) {
        throw error;
      }
      setUserProfile(data);
    } catch (error) {
      console.log("Error getting the profile:", error.message);
    }
  };

  const getGroup = async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();
      if (error) {
        throw error;
      }
      setGroup(data); // Fetch messages when group is loaded
    } catch (error) {
      console.log("Error retrieving group:", error.message);
    }
  };
  const dateFormmater = (timestamp) => {
    const date = parseISO(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`*,profiles(id,username)`)
        .eq("group", groupId)
        .order("created_at", { ascending: true });
      if (error) {
        throw error;
      }
      setMessages(data);
    } catch (error) {
      console.log("Error retrieving messages:", error.message);
    }
  };

  const handleSendMessageClick = async () => {
    if (!newMessage) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({ user: userId, group: groupId, message: newMessage })
        .single();
      if (error) {
        throw error;
      }
      getMessages();
      setNewMessage("");
    } catch (error) {
      console.log("Error sending message:", error.message);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
      setFilePreviewModalVisible(true);
    }
  };

  const uploadImages = async () => {
    try {
      const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const filePath = `${userId + new Date().getTime()}.${
        selectedFile.type === "image" ? "png" : "mp4"
      }`;
      const contentType =
        selectedFile.type === "image" ? "image/png" : "video/mp4";
      const { data, error } = await supabase.storage
        .from("groups_media")
        .upload(filePath, decode(base64), { contentType });

      if (error) {
        console.error("Error uploading image:", error.message);
      } else {
        await getUploadedImageUri(filePath, selectedFile.type);
      }
    } catch (err) {
      console.error("Error reading file or uploading image:", err.message);
    }
  };
  const getUploadedImageUri = async (filePath, type) => {
    try {
      const { data, error } = supabase.storage
        .from("groups_media")
        .getPublicUrl(filePath);

      if (error) {
        throw error;
      } else {
        insertMediaGroup(data.publicUrl, type);
      }
    } catch (err) {
      console.error("Error retrieving the image URL:", err.message);
    }
  };
  const insertMediaGroup = async (media, type) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          media: media,
          media_type: type,
          group: groupId,
          user: userId,
          caption: caption ? caption : null,
        })
        .single();
      if (error) {
        throw error;
      }
      getMessages();
    } catch (error) {
      console.error("Error inserting media into group:", error.message);
    }
  };
  const handleSendFileMessage = async () => {
    if (!selectedFile) {
      return;
    }
    uploadImages();
    setFilePreviewModalVisible(false);
    setSelectedFile(null);
    setCaption("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 7,
          marginBottom: 1,
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
        <Text
          style={{
            fontSize: 17,
            fontWeight: "bold",
            textTransform: "capitalize",
          }}
        >
          {group.name}
        </Text>
        <Image
          source={{ uri: group.photo }}
          style={{
            width: 40,
            height: 40,
            resizeMode: "cover",
            borderRadius: 20,
          }}
        />
      </View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Message
            message={item.message}
            senderId={item.profiles.id}
            username={item.profiles?.username}
            media={item.media}
            type={item.media_type}
            caption={item.caption}
            userId={userId}
            time={dateFormmater(item.created_at)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <Pressable
          onPress={handlePickImage}
          style={{
            backgroundColor: "#9F9F9F",
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SimpleLineIcons name="picture" size={16} color="#001138" />
        </Pressable>

        <TextInput
          placeholder="Enter message"
          style={styles.textInput}
          value={newMessage}
          multiline
          onChangeText={(text) => setNewMessage(text)}
        />
        <Pressable style={styles.sendButton} onPress={handleSendMessageClick}>
          <FontAwesome name="send" size={17} color="white" />
        </Pressable>
      </KeyboardAvoidingView>

      <Modal
        transparent={true}
        visible={filePreviewModalVisible}
        onRequestClose={() => setFilePreviewModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.filePreviewModalContent}>
            <View style={{ alignSelf: "flex-end" }}>
              <Pressable onPress={() => setFilePreviewModalVisible(false)}>
                <FontAwesome5 name="times" size={16} color="#9B0E10" />
              </Pressable>
            </View>
            {selectedFile &&
              selectedFile.uri &&
              selectedFile.type === "image" && (
                <Image
                  source={{ uri: selectedFile.uri }}
                  style={styles.previewImage}
                />
              )}
            {selectedFile &&
              selectedFile.uri &&
              selectedFile.type === "video" && (
                <Video
                  source={{ uri: selectedFile.uri }}
                  style={styles.previewImage}
                  useNativeControls
                />
              )}
            {selectedFile &&
              selectedFile.uri &&
              selectedFile.type === "application/pdf" && (
                <WebView
                  source={{ uri: selectedFile.uri }}
                  style={styles.previewImage}
                />
              )}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.inputContainer}
            >
              <TextInput
                placeholder="Add a caption"
                style={styles.textInput}
                value={caption}
                onChangeText={(text) => setCaption(text)}
              />
              <Pressable
                style={styles.sendButton}
                onPress={handleSendFileMessage}
              >
                <FontAwesome name="send" size={17} color="white" />
              </Pressable>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ViewGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  inputContainer: {
    borderColor: "#9F9F9F",
    borderWidth: 2,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 4,
    marginVertical: 10,
    padding: 5,
    marginHorizontal: 5,
  },
  textInput: {
    flex: 1,
    marginLeft: 3,
  },
  sendButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9B0E10",
    borderRadius: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  filePreviewModalContent: {
    width: "100%",
    height: height * 0.65,
    backgroundColor: "white",
    paddingVertical: 7,
    paddingHorizontal: 7,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    resizeMode: "contain",
  },
});
