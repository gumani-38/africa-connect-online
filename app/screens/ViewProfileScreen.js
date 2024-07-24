import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Image } from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { supabase } from "../utils/supabase";
import ContactBottomSheet from "../components/ContactBottomSheet";

import MyJourney from "../components/MyJourney";

const ViewProfileScreen = () => {
  const { profileId } = useRoute().params;
  const [userProfile, setUserProfile] = useState("");
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [selectedTab, setSelectedTab] = useState("about");
  const [error, setError] = useState(false);
  const [contactMessage, setContactMessage] = useState(null);
  const [userId, setUserId] = useState("");

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };
  useFocusEffect(
    useCallback(() => {
      getUser();
      getProfile();
      getFollowers();
      getFollowings();
      getConnection();
      const allChangesSubscription = supabase
        .channel("public:*")
        .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
          getProfile();
          getFollowers();
          getFollowings();
          getConnection();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(allChangesSubscription);
      };
    }, [])
  );
  const getProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*,countries(name)`)
        .eq("id", profileId)
        .single();
      if (error) {
        throw error;
      }
      setUserProfile(data);
    } catch (error) {
      console.log("error while getting profile : ", error.message);
    }
  };
  const getFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select(`*`)
        .eq("user", profileId);
      if (error) {
        throw error;
      }
      setFollowers(data.length);
    } catch (error) {
      console.log("error message getting followers count : ", error.message);
    }
  };
  const getFollowings = async () => {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select(`*`)
        .eq("following", profileId);
      if (error) {
        throw error;
      }
      setFollowing(data.length);
    } catch (error) {
      console.log("error getting the followings count : ", error.message);
    }
  };
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
  const handleContactClick = async (message) => {
    try {
      if (!message) {
        setError(true);
        return;
      }
      const { data, error } = await supabase
        .from("contact")
        .insert({
          from: userId,
          message: message,
          to: profileId,
        })
        .select("*");
      if (error) {
        throw error;
      }
      setContactMessage(null);
      await sendPushNotification(userProfile.expo_push_token);
    } catch (error) {
      console.log("while sending the contact message : ", error.message);
    }
  };
  async function sendPushNotification(expoPushToken) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Surprise",
      body: "app push notification",
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }
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
  const handlePresentModal = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleCloseModal = () => {
    bottomSheetModalRef.current?.close();
  };

  const data = [
    { value: 15, label: "Jan" },
    { value: 30, label: "Feb" },
    { value: 23, label: "Mar" },
    { value: 40, label: "Arp" },
    { value: 16, label: "May" },
    { value: 40, label: "Jun" },
  ];
  return (
    <>
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 7,
            marginBottom: 1,
          }}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <View
              style={{
                backgroundColor: "#9B0E10",
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Entypo name="chevron-left" size={24} color="white" />
            </View>
          </Pressable>
          <Image
            source={require("../assets/aco-logo.png")}
            style={{
              width: 50,
              height: 50,
              resizeMode: "contain",
              borderRadius: 25,
            }}
          />
        </View>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: userProfile.photo }}
              style={{
                position: "relative",
                padding: 10,
                width: 70,
                height: 70,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                resizeMode: "cover",
                borderRadius: 35,
                borderColor: "#9F9F9F",
              }}
            />
          </View>
          <Text style={{ fontWeight: "bold", fontSize: 15 }}>
            {userProfile.username}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#9F9F9F",
              fontWeight: "400",
              textTransform: "capitalize",
            }}
          >
            {userProfile?.name +
              "  " +
              (userProfile?.lastName ? userProfile.lastName : "")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ marginHorizontal: 4, flexDirection: "row", gap: 3 }}>
              <Text
                style={{
                  backgroundColor: "#9B0E10",
                  borderRadius: 20,
                  paddingHorizontal: 8,
                  textAlign: "center",
                  paddingVertical: 1,
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 11,
                }}
              >
                {followers}
              </Text>
              <Text
                style={{
                  textTransform: "capitalize",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                connecting
              </Text>
            </View>
            <View
              style={{ height: 19, backgroundColor: "#888", width: 1 }}
            ></View>
            <View style={{ marginHorizontal: 4, flexDirection: "row", gap: 3 }}>
              <Text
                style={{
                  backgroundColor: "#9B0E10",
                  borderRadius: 20,
                  paddingHorizontal: 8,
                  textAlign: "center",
                  paddingVertical: 1,
                  fontWeight: "bold",
                  color: "white",
                  fontSize: 11,
                }}
              >
                {following}
              </Text>
              <Text
                style={{
                  textTransform: "capitalize",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                connected
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginVertical: 7 }}>
            {profileId != userId && (
              <>
                <Pressable
                  onPress={handleConnectClick}
                  style={{
                    backgroundColor: isConnected ? "#9F9F9F" : "#001138",
                    borderRadius: 4,

                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    height: 25,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "white",
                      textAlign: "center",
                      textTransform: "capitalize",
                    }}
                  >
                    {isConnected ? "connected" : "connect"}
                  </Text>
                </Pressable>
                {userProfile.profile_type === 1 && (
                  <Pressable
                    onPress={handlePresentModal}
                    style={{
                      backgroundColor: "#9B0E10",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      height: 25,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      Contact
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>

          <View style={{ flexDirection: "row", gap: 25, marginBottom: 9 }}>
            <Pressable onPress={() => setSelectedTab("about")}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  color: selectedTab === "about" ? "#9B0E10" : "#9F9F9F",
                }}
              >
                About
              </Text>
            </Pressable>
            <Pressable onPress={() => setSelectedTab("myjourney")}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  color: selectedTab === "myjourney" ? "#9B0E10" : "#9F9F9F",
                }}
              >
                My Journey
              </Text>
            </Pressable>
          </View>
        </View>
        {selectedTab === "about" ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginTop: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomWidth: 2,
                  borderColor: "#9F9F9F",
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  marginHorizontal: 2,
                  marginVertical: 10,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                  Location:
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "500", color: "#001138" }}
                >
                  <Entypo name="location-pin" size={15} color="#9B0E10" />{" "}
                  {userProfile.countries?.name}
                </Text>
              </View>
              {userProfile.profile_type === 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottomWidth: 2,
                    borderColor: "#9F9F9F",
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    marginHorizontal: 2,
                    marginVertical: 10,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    Gender:
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#001138",
                    }}
                  >
                    {userProfile.gender}
                  </Text>
                </View>
              )}

              <View
                style={{
                  borderBottomWidth: 2,
                  borderColor: "#9F9F9F",
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  marginHorizontal: 2,
                  marginVertical: 10,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "bold" }}>Bio:</Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "500", color: "#001138" }}
                >
                  {userProfile.bio}
                </Text>
              </View>
              {userProfile.profile_type === 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottomWidth: 2,
                    borderColor: "#9F9F9F",
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    marginHorizontal: 2,
                    marginVertical: 10,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    Date of Birth:
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#001138",
                    }}
                  >
                    {userProfile.date_of_birth}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : selectedTab === "myjourney" ? (
          <MyJourney profileId={profileId} userId={userId} />
        ) : (
          <View>
            <Text></Text>
          </View>
        )}
      </SafeAreaView>
      <ContactBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        handleCloseModal={handleCloseModal}
        handleContactClick={handleContactClick}
        username={userProfile.username}
        error={error}
      />
    </>
  );
};

export default ViewProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
