import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { supabase } from "../utils/supabase";
import Feed from "../components/Feed";
import CommentBottomSheet from "../components/CommentBottomSheet";
import { useFocusEffect } from "@react-navigation/native";
import PushNotification from "../components/PushNotification";

const FeedScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [postCommentId, setPostCommentId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      getFeed();
      const allChangesSubscription = supabase
        .channel("public:*")
        .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
          getFeed();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(allChangesSubscription);
      };
    }, [])
  );
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getFeed().then(() => setRefreshing(false));
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
      await getFeed();
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
      <PushNotification />
      <View style={styles.container}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <CommentBottomSheet
        isVisible={isVisible}
        postId={postCommentId}
        handleCloseModal={handleCloseModal}
      />
    </>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    padding: 4,
    flex: 1,
  },
});
