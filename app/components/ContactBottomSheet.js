import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const ContactBottomSheet = ({
  bottomSheetModalRef,
  error,
  username,
  handleCloseModal,
  handleContactClick,
}) => {
  const [contactMessage, setContactMessage] = useState(null);
  const snapPoints = ["61%"];

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: "white",
        borderRadius: 30,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: 10,
          paddingRight: 20,
        }}
      >
        <Pressable onPress={() => handleCloseModal()}>
          <FontAwesome5 name="times" size={20} color="#9F9F9F" />
        </Pressable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 9 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Book me:</Text>
          <Text style={{ fontSize: 15, fontWeight: "500", color: "#9F9F9F" }}>
            {username}
          </Text>
        </View>
        <View>
          <TextInput
            style={{
              paddingVertical: 7,
              paddingHorizontal: 8,
              backgroundColor: "white",
              borderWidth: 1,
              borderRadius: 4,
              minHeight: 160,
              color: "#001138",
              textAlignVertical: "top",
              borderColor: "#9F9F9F",
              marginBottom: error ? 2 : 25,
            }}
            placeholder="enter your message..."
            multiline={true}
            editable
            value={contactMessage}
            onChangeText={(text) => setContactMessage(text)}
            placeholderTextColor={"#9F9F9F"}
          />
          {error && (
            <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
              contact message cannot be empty
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => handleContactClick(contactMessage)}
          style={{ backgroundColor: "#9B0E10", borderRadius: 4, padding: 10 }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 19,
              fontWeight: "bold",
            }}
          >
            Send Message
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheetModal>
  );
};

export default ContactBottomSheet;

const styles = StyleSheet.create({});
