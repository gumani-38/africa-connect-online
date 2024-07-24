import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../utils/supabase";

const Group = ({ image, name, description, id, userId, handleJoinClick }) => {
  const navigation = useNavigation();
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (userId && id) {
      getGroupMember();
    }
  }, [userId, id]);

  const getGroupMember = async () => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select("*")
        .eq("group", id)
        .eq("member", userId);
      if (error) {
        throw error;
      }
      if (data.length > 0) {
        setIsMember(true);
      } else {
        setIsMember(false);
      }
    } catch (error) {
      console.log("error while validating membership : ", error.message);
    }
  };

  const handleJoin = async () => {
    await handleJoinClick(id);
    await getGroupMember(); // Refresh membership status after joining
  };

  return (
    <TouchableOpacity
      onPress={() => {
        isMember && navigation.navigate("ViewGroup", { groupId: id });
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: 5,
          marginBottom: 7,
          padding: 4,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: 5,
          }}
        >
          <Image
            style={{
              width: 80,
              height: 80,
              borderRadius: 3,
              resizeMode: "cover",
            }}
            source={image ? { uri: image } : require("../assets/aco-logo.png")}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", fontSize: 13 }}>{name}</Text>

            <Text
              numberOfLines={3}
              style={{ fontSize: 12, fontWeight: "500", color: "#9F9F9F" }}
            >
              {description}
            </Text>
            {isMember ? (
              <View
                style={{
                  marginVertical: 3,
                  flex: 1,
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    backgroundColor: "#9F9F9F",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "bold",
                    paddingHorizontal: 15,
                    paddingVertical: 2,
                    textAlign: "center",
                  }}
                >
                  Joined
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleJoin}
                style={{
                  marginVertical: 3,
                  flex: 1,
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    backgroundColor: "#9B0E10",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: "bold",
                    paddingHorizontal: 9,
                    paddingVertical: 1,
                    textAlign: "center",
                  }}
                >
                  Join
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Group;

const styles = StyleSheet.create({});
