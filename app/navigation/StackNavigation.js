import React, { useContext, useEffect, useState } from "react";
import { View, Image, Pressable } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UploadPostScreen from "../screens/UploadPostScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { FontAwesome, Feather, FontAwesome5 } from "@expo/vector-icons";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import NotificationScreen from "../screens/NotificationScreen";
import GroupScreen from "../screens/GroupScreen";
import FeedScreen from "../screens/FeedScreen";
import ProfileSetUpScreen from "../screens/ProfileSetUpScreen";
import SearchScreen from "../screens/SearchScreen";
import ViewGroupScreen from "../screens/ViewGroupScreen";
import ViewProfileScreen from "../screens/ViewProfileScreen";
import AddGroupScreen from "../screens/AddGroupScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import TermsScreen from "../screens/TermsScreen";
import ForgotScreen from "../screens/ForgotScreen";
import MyPostScreen from "../screens/MyPostScreen";
import UpdatePostScreen from "../screens/UpdatePostScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ViewPostScreen from "../screens/ViewPostScreen";

const StackNavigation = () => {
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();
  const TopTabs = createMaterialTopTabNavigator();
  const [token, setToken] = useState(null);
  useEffect(() => {
    checkAppInstalled();
  }, []);

  const checkAppInstalled = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      setToken(token);
    } catch (error) {
      console.log("error message : ", error.message);
    }
  };

  function TopTabsGroup() {
    return (
      <TopTabs.Navigator
        screenOptions={{
          tabBarLabelStyle: {
            textTransform: "capitalize",
            fontWeight: "bold",
          },
          tabBarIndicatorStyle: {
            height: 5,
            borderRadius: 5,
            backgroundColor: "#1DA1F2",
          },
        }}
      >
        <TopTabs.Screen
          name="main"
          component={FeedScreen}
          options={{
            tabBarLabel: "Feed",
          }}
        />
        <TopTabs.Screen name="Group" component={GroupScreen} />
        <TopTabs.Screen name="Notifications" component={NotificationScreen} />
      </TopTabs.Navigator>
    );
  }

  function BottomTabs({ navigation }) {
    return (
      <Tab.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Tab.Screen
          name="Afro Connect"
          component={TopTabsGroup}
          options={{
            headerRight: () => (
              <Pressable
                onPress={() => navigation.navigate("Search")}
                style={{
                  backgroundColor: "#9B0E10",
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 7,
                }}
              >
                <FontAwesome name="search" size={24} color="white" />
              </Pressable>
            ),
            headerLeft: () => (
              <Image
                source={require("../assets/afro-connect.png")}
                style={{
                  width: 50,
                  height: 50,
                  resizeMode: "contain",
                  borderRadius: 25,
                  marginHorizontal: 4,
                }}
              />
            ),
            tabBarLabel: "Home",
            tabBarLabelStyle: { color: "#001138" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name="home" size={24} color="#9B0E10" />
              ) : (
                <FontAwesome name="home" size={24} color="#9F9F9F" />
              ),
          }}
        />
        <Tab.Screen
          name="Upload"
          component={UploadPostScreen}
          options={{
            headerShown: false,
            tabBarLabel: "Create Post",
            tabBarLabelStyle: { color: "#001138" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Feather name="plus-circle" size={24} color="#9B0E10" />
              ) : (
                <Feather name="plus-circle" size={24} color="#9F9F9F" />
              ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: false,
            tabBarLabel: "Profile",
            tabBarLabelStyle: { color: "#001138" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome5 name="user-cog" size={24} color="#9B0E10" />
              ) : (
                <FontAwesome5 name="user-cog" size={24} color="#9F9F9F" />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        {!token && (
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
        )}

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Forgot"
          component={ForgotScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Setup"
          component={ProfileSetUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewGroup"
          component={ViewGroupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewProfile"
          component={ViewProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewPost"
          component={ViewPostScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="MyPost"
          component={MyPostScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UpdatePost"
          component={UpdatePostScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddGroup"
          component={AddGroupScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;
