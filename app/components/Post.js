import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDistanceToNow, parseISO } from "date-fns";
import { FontAwesome6, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
const Post = ({ item, handleDeletePost }) => {
  const dateFormmater = (timestamp) => {
    const date = parseISO(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  const navigation = useNavigation();
  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 7,
        borderRadius: 5,
        marginHorizontal: 10,
        borderColor: "gray",
        borderWidth: 1,
        marginVertical: 6,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Pressable
          onPress={() => navigation.navigate("UpdatePost", { postId: item.id })}
        >
          <FontAwesome6 name="edit" size={14} color="#41DDFF" />
        </Pressable>
        <Text style={{ textAlign: "right", fontSize: 13, color: "#9F9F9F" }}>
          {dateFormmater(item?.created_at)}
        </Text>
      </View>
      {item.title && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#4d4d4d",
            marginBottom: 2,
            textTransform: "capitalize",
          }}
        >
          {item.title}
        </Text>
      )}
      <Text
        style={{ fontSize: 12, fontWeight: "600", color: "#5b5c5b" }}
        numberOfLines={3}
      >
        {item.caption}
      </Text>
      {item.tags && (
        <Text style={{ fontSize: 13, color: "#41DDFF" }}>{item.tags}</Text>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 4,
        }}
      >
        <Pressable
          onPress={() => navigation.navigate("ViewPost", { postId: item.id })}
        >
          <Feather name="eye" size={16} color="#9B0E10" />
        </Pressable>
        <Pressable onPress={() => handleDeletePost(item.id)}>
          <Feather name="trash-2" size={16} color="red" />
        </Pressable>
      </View>
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({});
