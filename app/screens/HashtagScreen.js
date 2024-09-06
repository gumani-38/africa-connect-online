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
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../utils/supabase";
import { Entypo, Feather } from "@expo/vector-icons";
import CommentBottomSheet from "../components/CommentBottomSheet";
import Feed from "../components/Feed";

const HashtagScreen = () => {
  const navigation = useNavigation();
  const { tagName, tagId } = useRoute().params;
  const [postData, setPostData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [postCommentId, setPostCommentId] = useState(null);
  const [userId, setUserId] = useState("");
  useEffect(() => {
    getUser();
  }, [userId]);
  useEffect(() => {
    if (tagName && tagId) {
      FilterByTags();
    }
  }, [tagName, tagId]);
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };

  const FilterByTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select(`*,posts(*)`)
        .eq("tag", tagName);
      if (error) {
        throw error;
      }
      console.log("data is :", data);
      getNewFeed(data);
    } catch (error) {
      console.log("error while filtering by tags :", error.message);
    }
  };
  const getNewFeed = async (items) => {
    try {
      let newPosts = []; // Use this to accumulate new posts
      for (let tag of items) {
        if (tag.posts?.id) {
          console.log("posts id : ", tag.posts.id);
          const { data, error } = await supabase
            .from("posts")
            .select(`*, profiles (id, username, photo)`)
            .eq("id", tag.posts.id)
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          // Accumulate new posts
          newPosts = [...newPosts, ...data];
        }
      }

      // Update state correctly
      setPostData((prevData) => [...prevData, ...newPosts]);
    } catch (error) {
      console.log("error while getting the new feed : ", error.message);
    }
  };

  const handlePresentModal = (postId) => {
    setPostCommentId(postId);
    setIsVisible(true);
  };
  const handleCloseModal = () => {
    setIsVisible(false);
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
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>#{tagName}</Text>
          <Image
            source={require("../assets/afro-connect.png")}
            style={{
              width: 50,
              height: 50,
              resizeMode: "contain",
              borderRadius: 25,
            }}
          />
        </View>
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          data={postData}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Feed
              item={item}
              handlePresentModal={handlePresentModal}
              userId={userId}
            />
          )}
          style={{ marginBottom: 25 }}
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

export default HashtagScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
