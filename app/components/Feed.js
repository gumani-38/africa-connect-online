import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useCallback } from "react";
import { Text, View, Pressable, StyleSheet, Image, Share } from "react-native";
import { FontAwesome, AntDesign, Feather } from "@expo/vector-icons";
import { formatDistanceToNow, parseISO } from "date-fns";
import FeedMedia from "./FeedMedia";
import { supabase } from "../utils/supabase";

const Feed = ({ item, userId, handleConnectClick, handlePresentModal }) => {
  const [likeCounts, setLikeCounts] = useState(0);
  const [isConnected, setIsConneted] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [tags, setTags] = useState([]);
  const [commentCounts, setCommentCounts] = useState(0);
  const [liked, setLiked] = useState(false);
  const navigation = useNavigation();

  const handleLikedClick = async () => {
    try {
      if (liked) {
        unlikePost();
        setLiked(false);
        await getLikeCount();
        await getIsLiked();
      } else {
        likePost();
        setLiked(true);
        await getLikeCount();
        await getIsLiked();
      }
    } catch (error) {
      console.error("Error handling like click:", error);
    }
  };

  const likePost = async () => {
    try {
      const { data, error } = await supabase.from("likes").insert({
        user: userId,
        post: item.id,
      });
      if (error) {
        throw error;
      }
      console.log("Post liked:", data);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const unlikePost = async () => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .delete()
        .eq("user", userId)
        .eq("post", item.id);
      if (error) {
        throw error;
      }
      console.log("Post unliked:", data);
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };
  const getConnections = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .eq("user", item.profiles.id)
        .eq("following", userId);
      if (error) {
        throw error;
      }
      if (data.length > 0) {
        setConnectionId(data[0].id);
        setIsConneted(true);
      }
    } catch (error) {
      console.log("error while getting connections: ", error.message);
    }
  };
  const getIsLiked = async () => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("post", item.id)
        .eq("user", userId)
        .select();
      if (error) {
        throw error;
      }
      if (data.length > 0) {
        setLiked(true);
      }
    } catch (error) {
      console.log("error while getting the like count", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getLikeCount();
      getConnections();
      getTags();
      getIsLiked();
      getComments();
      const allChangesSubscription = supabase
        .channel("public:*")
        .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
          getLikeCount();
          getConnections();
          getTags();
          getIsLiked();
          getComments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(allChangesSubscription);
      };
    }, [])
  );
  const getComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`*, profiles (id,username,photo)`)
        .eq("post", item.id);
      if (error) {
        throw error;
      }
      setCommentCounts(data.length);
    } catch (error) {
      console.log("error while getting comments :", error.message);
    }
  };
  const getLikeCount = async () => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("post", item.id);
      if (error) {
        throw error;
      }
      setLikeCounts(data.length);
    } catch (error) {
      console.log("error while getting the like count", error.message);
    }
  };
  const getTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("post", item.id);
      if (error) {
        throw error;
      }
      setTags(data);
    } catch (error) {
      console.log("error while getting the tags", error.message);
    }
  };
  const onShare = async () => {
    try {
      const universalLinkUrl = `https://myapp.com/ViewPost/${item.id}`;
      const result = await Share.share({
        message: `Check out this post on Africa Connect: ${universalLinkUrl}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Dismissed");
      }
    } catch (error) {
      console.log("Error sharing:", error.message);
    }
  };

  const dateFormatter = (timestamp) => {
    const date = parseISO(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Pressable
      onPress={() => navigation.navigate("ViewPost", { postId: item.id })}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Pressable
            onPress={() =>
              navigation.navigate("ViewProfile", {
                profileId: item.profiles.id,
              })
            }
          >
            <Image
              style={styles.userAvatar}
              source={{ uri: item.profiles?.photo }}
            />
          </Pressable>
          <View style={styles.usernameContainer}>
            <Pressable
              onPress={() =>
                navigation.navigate("ViewProfile", {
                  profileId: item.profiles.id,
                })
              }
            >
              <Text style={styles.username}>{item.profiles?.username}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={styles.timestamp}>{dateFormatter(item.created_at)}</Text>
          {item?.profiles.id !== userId && isConnected && (
            <Pressable
              style={[styles.connectButton, { backgroundColor: "#9F9F9F" }]}
            >
              <Text style={styles.connectText}>Connected</Text>
            </Pressable>
          )}
          {item?.profiles.id === userId && <Text style={styles.meTag}>Me</Text>}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.caption}>{item.caption}</Text>
        <View style={{ flexDirection: "row", gap: 1 }}>
          {tags.length > 0 &&
            tags.map((tag, index) => (
              <Pressable key={tag.id}>
                <Text style={styles.tags}>
                  #{tag.tag}
                  {index < tags.length - 1 ? "," : ""}
                </Text>
              </Pressable>
            ))}
        </View>
      </View>

      <FeedMedia postId={item.id} />

      <View style={styles.actions}>
        <Pressable
          onPress={() => handlePresentModal(item.id)}
          style={styles.actionButton}
        >
          {commentCounts > 1 && (
            <Text style={{ fontSize: 13, marginRight: 3 }}>
              {" "}
              {commentCounts}
            </Text>
          )}
          <FontAwesome name="commenting" size={20} color="#9F9F9F" />
          <Text style={styles.actionText}>Comments</Text>
        </Pressable>

        <Pressable onPress={handleLikedClick} style={styles.actionButton}>
          <AntDesign
            name={liked ? "star" : "staro"}
            size={20}
            color={liked ? "#9B0E10" : "#9F9F9F"}
          />
          {likeCounts > 0 && (
            <Text style={styles.actionText}>{likeCounts}</Text>
          )}
        </Pressable>

        <Pressable onPress={onShare} style={styles.actionButton}>
          <Feather name="share-2" size={20} color="black" />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default Feed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 7,
    padding: 7,
    marginHorizontal: 5,
    marginBottom: 7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 13,
    fontWeight: "bold",
  },
  meta: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 3,
    color: "#9F9F9F",
  },
  connectButton: {
    backgroundColor: "#001138",
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  connectText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
    textAlign: "center",
  },
  meTag: {
    backgroundColor: "#9F9F9F",
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 5,
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  caption: {
    fontSize: 12,
    color: "gray",
    fontWeight: "600",
    marginVertical: 4,
  },
  tags: {
    color: "#41DDFF",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 7,
    paddingHorizontal: 5,
    gap: 15,
    marginBottom: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "400",
    marginLeft: 3,
  },
});
