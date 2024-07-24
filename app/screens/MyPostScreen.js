import {
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  Text,
  View,
  FlatList,
  RefreshControl,
} from "react-native";
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Post from "../components/Post";
import { useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const MyPostScreen = () => {
  const navigation = useNavigation();
  const [postData, setPostData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState("");
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserPost();
    setRefreshing(false);
  }, []);
  useEffect(() => {
    getUser();
    if (userId) {
      getUserPost();
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      const allChangesSubscription = supabase
        .channel("public:*")
        .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
          getUserPost();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(allChangesSubscription);
      };
    }, [])
  );

  const getUserPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`*`)
        .eq("author", userId)
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      setPostData(data);
    } catch (error) {
      console.log("error retrieving user post :", error.message);
    }
  };
  const deleteImage = async (uri) => {
    try {
      const parsedURL = new URL(uri);
      const path = parsedURL.pathname.split("/storage/v1/object/public/")[1];
      const bucket = path.split("/")[0];
      const filePath = path.split("/").slice(1).join("/");
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        throw error;
      }

      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting old image:", error.message);
    }
  };
  const removeLikes = async (postId) => {
    try {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post", postId);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.log("error while deleting likes of the post :", error.message);
    }
  };
  const removeComments = async (postId) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("post", postId);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.log("error while deleting comments of the post :", error.message);
    }
  };
  const removeUserPost = async (postId) => {
    try {
      removeLikes(postId);
      removeComments(postId);
      removeMediasAndImages(postId);
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.log("error while deleting user post :", error.message);
    }
  };
  const removeMedia = async (postId) => {
    try {
      const { error } = await supabase
        .from("post_media")
        .delete()
        .eq("post", postId);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.log("error while deleting user post media :", error.message);
    }
  };
  const removeMediasAndImages = async (postId) => {
    try {
      const { data, error } = await supabase
        .from("post_media")
        .select("*")
        .eq("post", postId);

      if (error) {
        throw error;
      }
      console.log("media data", data);
      data.map(async (item) => {
        deleteImage(item.media);
      });
      removeMedia(postId);
    } catch (error) {
      console.log("error while deleting all post media :", error.message);
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      console.log("post id :", postId);
      removeUserPost(postId);

      getUserPost();
    } catch (error) {
      console.log("error while deleting user post line 103 :", error.message);
    }
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
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>My Post</Text>
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
      {postData.length <= 0 && (
        <View>
          <Text style={{ textAlign: "center" }}>No post available</Text>
        </View>
      )}
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item) => item.id.toString()}
        data={postData}
        renderItem={({ item }) => (
          <Post item={item} handleDeletePost={handleDeletePost} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default MyPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
