import { StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";

const ProgressBar = ({ process }) => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <Progress.Bar progress={process} width={280} height={8} color="#9B0E10" />
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
