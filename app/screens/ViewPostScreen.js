import {
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import CommentBottomSheet from "../components/CommentBottomSheet";
import { Entypo } from "@expo/vector-icons";
import { supabase } from "../utils/supabase";
import Feed from "../components/Feed";

const ViewPostScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [postCommentId, setPostCommentId] = useState(null);
  const {
    params: { postId },
  } = useRoute();
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState("");
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };

  useEffect(() => {
    getUser();
    getFeed();
  }, []);
  const getFeed = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
              *,
              profiles (id,username,photo)
              `
        )
        .eq("id", postId)
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      setPosts(data);
    } catch (error) {
      console.log("Error fetching feed:", error);
    }
  };

  const handleConnectClick = async (isConnected, connectionId, profileId) => {
    try {
      if (isConnected) {
        deleteConnection(connectionId);
      } else {
        createConnection(profileId);
      }
      getFeed();
    } catch (error) {
      console.error("Error handling connect click:", error);
    }
  };

  const createConnection = async (profileId) => {
    try {
      const { data, error } = await supabase.from("connections").insert([
        {
          user: userId,
          following: profileId,
        },
      ]);
      if (error) {
        throw error;
      }
      console.log("Connection created:", data);
    } catch (error) {
      console.error("Error creating connection:", error);
    }
  };

  const deleteConnection = async (connectionId) => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);
      if (error) {
        throw error;
      }
      console.log("Connection deleted:", data);
    } catch (error) {
      console.error("Error deleting connection:", error);
    }
  };

  const handlePresentModal = (postId) => {
    setPostCommentId(postId);
    setIsVisible(true);
  };

  const handleCloseModal = () => {
    setIsVisible(false);
  };
  const renderItem = ({ item }) => (
    <Feed
      key={item.id}
      item={item}
      userId={userId}
      handlePresentModal={handlePresentModal}
      handleConnectClick={handleConnectClick}
    />
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 7,
            marginBottom: 40,
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
              <Entypo name="chevron-left" size={24} color="white" />
            </View>
          </Pressable>
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
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </SafeAreaView>
      <CommentBottomSheet
        isVisible={isVisible}
        postId={postCommentId}
        handleCloseModal={handleCloseModal}
      />
    </>
  );
};

export default ViewPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
