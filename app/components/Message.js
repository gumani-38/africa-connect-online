import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const Message = ({
  message,
  time,
  username,
  senderId,
  userId,
  media,
  caption,
  type,
}) => {
  const navigation = useNavigation();
  const isSender = senderId === userId;
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 12,
        alignSelf: isSender ? "flex-end" : "flex-start",
      }}
    >
      <View
        style={{
          backgroundColor: isSender ? "#9B0E10" : "white",
          borderRadius: 4,
          alignItems: "flex-end",
          padding: 8,
          marginBottom: 6,
          maxWidth: "95%", // Set max width to limit the message width
        }}
      >
        <Pressable
          onPress={() =>
            navigation.navigate("ViewProfile", {
              profileId: senderId,
            })
          }
          style={{ alignSelf: "flex-start" }}
        >
          <Text
            style={{ fontSize: 9, color: isSender ? "#001138" : "#41DDFF" }}
          >
            {isSender ? "me" : username}
          </Text>
        </Pressable>
        {media ? (
          <>
            <Image
              source={{ uri: media }}
              style={{
                width: 180,
                height: 180,
                resizeMode: "contain",
                borderRadius: 3,
              }}
            />
            {caption && (
              <Text
                style={{
                  fontSize: 12,
                  color: isSender ? "white" : "#9F9F9F",
                  marginTop: 4,
                }}
              >
                {caption}
              </Text>
            )}
          </>
        ) : (
          <Text
            style={{
              fontSize: 13,
              fontWeight: "400",
              color: isSender ? "white" : "#001138",
            }}
          >
            {message}
          </Text>
        )}
        <Text style={{ fontSize: 10, color: "#9F9F9F", marginRight: 4 }}>
          {time}
        </Text>
      </View>
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({});
