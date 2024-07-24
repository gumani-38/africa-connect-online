import { Image, StyleSheet, Text, View } from "react-native";
import { Entypo } from "@expo/vector-icons";

const Notification = () => {
  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
      }}
    >
      <View style={{ position: "absolute", top: 0, left: 0 }}>
        <Entypo name="dot-single" size={24} color="#9B0E10" />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Image
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              resizeMode: "cover",
            }}
            source={require("../assets/profile.jpeg")}
            accessibilityLabel="User Profile Image"
          />
          <View style={{ marginLeft: 10, flexShrink: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
              }}
              numberOfLines={2} // Adjust number of lines based on content
            >
              @peachy : just liked the this post, liked by @karabo
            </Text>
          </View>
          <Image
            style={{
              width: 80,
              height: 50,
              resizeMode: "cover",
              borderRadius: 5,
            }}
            source={require("../assets/post.jpg")}
            accessibilityLabel="Post Image"
          />
        </View>
      </View>
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({});
