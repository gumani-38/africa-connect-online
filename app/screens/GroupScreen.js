import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import Group from "../components/Group";
import { supabase } from "../utils/supabase";
import { useFocusEffect } from "@react-navigation/native";

const GroupScreen = () => {
  const [group, setGroup] = useState([]);
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
    getGroup();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUser();
      getGroup();
      const allChangesSubscription = supabase
        .channel("public:*")
        .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
          getUser();
          getGroup();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(allChangesSubscription);
      };
    }, [])
  );

  const getGroup = async () => {
    try {
      const { data, error } = await supabase.from("groups").select("*");
      if (error) {
        console.log(error);
      } else {
        setGroup(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleJoinClick = async (groupId) => {
    try {
      const { error } = await supabase.from("group_members").insert({
        member: userId,
        group: groupId,
      });
      if (error) {
        console.log(error);
      } else {
        // Fetch the updated group data after joining
        await getGroup();
      }
    } catch (error) {
      console.log("error while joining the group : ", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <Group
      name={item.name}
      description={item.description}
      image={item.photo}
      userId={userId}
      id={item.id}
      handleJoinClick={handleJoinClick}
    />
  );

  return (
    <View style={{ padding: 5, marginTop: 15 }}>
      <FlatList
        data={group}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default GroupScreen;

const styles = StyleSheet.create({});
