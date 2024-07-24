import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import Notification from "../components/Notification";

const NotificationScreen = () => {
  return (
    <View style={{ padding: 3, marginTop: 24 }}>
      <Notification />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({});
