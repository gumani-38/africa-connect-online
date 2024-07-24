import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const handleBtnClick = () => {
    AsyncStorage.setItem("authToken", "true");
    navigation.navigate("Login");
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 60,
          }}
        >
          <Image
            source={require("../assets/aco-logo.png")}
            style={{ width: 300, height: 300, resizeMode: "contain" }}
          />
        </View>
        <Pressable
          onPress={handleBtnClick}
          style={{
            backgroundColor: "#9B0E10",
            borderRadius: 4,
            marginHorizontal: 10,
            padding: 9,
            marginBottom: 20,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
            }}
          >
            Get Started
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#001138",
  },
});
