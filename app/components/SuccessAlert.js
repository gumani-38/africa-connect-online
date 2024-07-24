import { StyleSheet, Text, View } from "react-native";
import * as Animatable from "react-native-animatable";

import { Entypo } from "@expo/vector-icons";
const SuccessAlert = () => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <Animatable.View animation="bounceIn">
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "#9B0E10",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Entypo name="check" size={30} color="white" />
        </View>
      </Animatable.View>
    </View>
  );
};

export default SuccessAlert;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
