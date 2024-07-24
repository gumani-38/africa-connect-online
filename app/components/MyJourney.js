import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Feed from "./Feed";
import { supabase } from "../utils/supabase";
import { useEffect, useState } from "react";
import CommentBottomSheet from "./CommentBottomSheet";
import { ScrollView } from "react-native-gesture-handler";

const MyJourney = ({ profileId, userId }) => {
  const [journeyData, setJourneyData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [postCommentId, setPostCommentId] = useState(null);
  const [selectedTag, setSelectedTag] = useState("all");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    getFeed();
    getTags();
  }, [selectedTag]);

  const getFeed = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles (id, username, photo)`)
        .eq("author", profileId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      setJourneyData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user", profileId);
      if (error) {
        throw error;
      }
      setTags(data);
    } catch (error) {
      console.log("error while getting the tags", error.message);
    }
  };
  const getNewFeed = async (item) => {
    try {
      for (let i = 0; i < item.length; i++) {
        let tag = item[i];
        const { data, error } = await supabase
          .from("posts")
          .select(`*, profiles (id, username, photo)`)
          .eq("id", tag.post.id)
          .order("created_at", { ascending: false });
        if (error) {
          throw error;
        }
        setJourneyData([journeyData, ...data]);
        getTags();
      }
    } catch (error) {
      console.log("error while getting the new feed : ", error.message);
    }
  };
  const FilterByTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select(`*,posts(*)`)
        .ilike("tag", selectedTag)
        .eq("user", profileId);
      if (error) {
        throw error;
      }

      getNewFeed(data);
    } catch (error) {
      console.log("error while filtering by tags :", error.message);
    }
  };
  const handlePresentModal = (postId) => {
    setPostCommentId(postId);
    setIsVisible(true);
  };

  const handleCloseModal = () => {
    setIsVisible(false);
  };

  const handleTagPress = (tag) => {
    if (tag === "all") {
      setSelectedTag(tag);
      getFeed();
    } else {
      setSelectedTag(tag);
      FilterByTags();
    }
  };

  return (
    <>
      <View style={{ marginBottom: 5, padding: 3 }}>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          <Pressable
            onPress={() => handleTagPress("all")}
            style={[styles.tag, selectedTag === "all" && styles.activeTag]}
          >
            <Text
              style={[
                styles.tagText,
                selectedTag === "all" && styles.activeTagText,
              ]}
            >
              all
            </Text>
          </Pressable>
          {tags.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleTagPress(item.tag)}
              style={[styles.tag, selectedTag === item.tag && styles.activeTag]}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTag === item.tag && styles.activeTagText,
                ]}
              >
                {item.tag}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        keyExtractor={(item) => item.id.toString()}
        data={journeyData}
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
      <CommentBottomSheet
        isVisible={isVisible}
        postId={postCommentId}
        handleCloseModal={handleCloseModal}
      />
    </>
  );
};

export default MyJourney;

const styles = StyleSheet.create({
  tag: {
    backgroundColor: "#DEDEDE",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeTag: {
    backgroundColor: "black",
  },
  tagText: {
    textAlign: "center",
    fontSize: 12,
    color: "black",
    textTransform: "capitalize",
  },
  activeTagText: {
    color: "white",
  },
});
