import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { FontAwesome, Entypo } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigation } from "@react-navigation/native";
const UserCard = ({ username, name, lastName, image, profileId, userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (profileId && userId) {
      getConnection();
    }
  }, [profileId, userId]);

  const getConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .eq("user", profileId)
        .eq("following", userId);
      if (error) {
        throw error;
      }
      if (data.length > 0) {
        setConnectionId(data[0].id);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.log(` error fetching connection `, err);
    }
  };
  const handleConnectClick = async () => {
    try {
      if (isConnected) {
        await deleteConnection();
        getConnection();
      } else {
        await followProfile();
        getConnection();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteConnection = async () => {
    try {
      console.log("connection id : ", connectionId);
      const { data, error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId)
        .select("*");
      if (error) {
        throw error;
      }
      console.log("Connection deleted:", data);
    } catch (error) {
      console.log("error while deleting connection : ", error.message);
    }
  };

  const followProfile = async () => {
    try {
      const { data, error } = await supabase.from("connections").insert({
        user: userProfile.id,
        following: userId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 4,
        marginBottom: 7,
        borderRadius: 4,
        marginHorizontal: 2,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View style={{ flexDirection: "row", gap: 7 }}>
        <Pressable
          onPress={() =>
            navigation.navigate("ViewProfile", {
              profileId: profileId,
            })
          }
        >
          <Image
            source={image ? { uri: image } : require("../assets/profile.jpeg")}
            style={{
              width: 40,
              height: 40,
              resizeMode: "cover",
              borderRadius: 20,
            }}
          />
        </Pressable>

        <View>
          <Pressable
            onPress={() =>
              navigation.navigate("ViewProfile", {
                profileId: profileId,
              })
            }
          >
            <Text
              style={{
                color: "#41DDFF",
                fontSize: 14,
                fontWeight: "bold",
                top: -4,
              }}
            >
              {username}
            </Text>
          </Pressable>
          <Text
            style={{
              fontWeight: "400",
              color: "#9F9F9F",
              textTransform: "capitalize",
              fontSize: 13,
            }}
          >
            {name + "  " + (lastName ? lastName : "")}
          </Text>
        </View>
      </View>
      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Entypo name="location-pin" size={15} color="#9B0E10" />
          <Text style={{ color: "#9F9F9F", fontWeight: "500" }}>
            south africa
          </Text>
        </View>
        {profileId != userId && (
          <View style={{ marginTop: 8 }}>
            <Pressable
              onPress={handleConnectClick}
              style={{
                backgroundColor: isConnected ? "#9F9F9F" : "#001138",
                borderRadius: 4,
                padding: 2,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: 11,
                  textAlign: "center",
                  textTransform: "capitalize",
                }}
              >
                {isConnected ? "Connected" : "connect"}
              </Text>
            </Pressable>
          </View>
        )}
        {profileId === userId && (
          <View
            style={{
              backgroundColor: "#9F9F9F",
              borderRadius: 4,
              marginTop: 8,
              padding: 2,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                fontSize: 11,
                textAlign: "center",
                textTransform: "capitalize",
              }}
            >
              Me
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default UserCard;

const styles = StyleSheet.create({});
