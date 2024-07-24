import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  Feather,
  FontAwesome5,
  MaterialIcons,
  EvilIcons,
} from "@expo/vector-icons"; // Assuming you are using expo/vector-icons for icons
import { supabase } from "../utils/supabase";

const UpdateBottomSheet = ({
  bottomSheetModalRef,
  type,
  handleCloseModal,
  userId,
}) => {
  const [edtBio, setEdtBio] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const snapPoints = [`${type != "password" ? "55%" : "47%"}`];

  useEffect(() => {
    if (userId) {
      getUserProfile();
    }
  }, [userId]);
  const getUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", userId);
      if (error) {
        throw error;
      }
      setBio(data[0].bio);
    } catch (error) {
      console.log("error message getting the profile : ", error.message);
    }
  };
  const handleUpdatePassword = async (req, res) => {
    try {
      if (!password) {
        setErrMessage("Password is required");
        return;
      }
      if (password.length <= 6) {
        setErrMessage("Password must be at least 6 characters");
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;
      handleCloseModal();
      hidePassword(true);
      password("");
    } catch (error) {
      console.log(`while updating password`, err);
    }
  };
  const handleUpdateBio = async () => {
    try {
      if (!bio) {
        setErrMessage("Bio is required");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .update({
          bio: bio,
        })
        .eq("id", userId);
      if (error) {
        throw error;
      }
      handleCloseModal();
      getUserProfile();
      setEdtBio(false);
    } catch (error) {
      console.log("error updating bio : ", error.message);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: "white",
        borderRadius: 30,
        padding: 10,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {type === "password" ? (
            <>
              <View
                style={{
                  marginHorizontal: 11,
                  marginBottom: 15,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  Password
                </Text>
                <Pressable onPress={handleCloseModal}>
                  <FontAwesome5 name="times" size={18} color="#9F9F9F" />
                </Pressable>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 6,
                  borderWidth: 2,
                  borderRadius: 6,
                  borderColor: "#9F9F9F",
                  marginHorizontal: 8,
                  marginBottom: errMessage ? 2 : 17,
                }}
              >
                <TextInput
                  placeholder="***********"
                  style={{ flex: 1 }}
                  secureTextEntry={hidePassword ? true : false}
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                />
                <Pressable onPress={() => setHidePassword(!hidePassword)}>
                  <Feather
                    name={hidePassword ? "eye-off" : "eye"}
                    size={22}
                    color="black"
                  />
                </Pressable>
              </View>
              {errMessage && (
                <Text
                  style={{
                    color: "red",
                    fontSize: 13,
                    marginBottom: 3,
                    marginHorizontal: 8,
                  }}
                >
                  {errMessage}
                </Text>
              )}

              <View>
                <Pressable
                  onPress={handleUpdatePassword}
                  style={{
                    backgroundColor: "#9B0E10",
                    borderRadius: 4,
                    marginHorizontal: 8,
                    padding: 12,
                    marginBottom: 8,
                    marginTop: 26,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: 16,
                      color: "white",
                    }}
                  >
                    Update Password
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View
                style={{
                  marginTop: 5,
                  marginBottom: 7,
                  flex: 1,
                  alignSelf: "flex-end",
                  marginHorizontal: 12,
                }}
              >
                <Pressable onPress={() => handleCloseModal()}>
                  <FontAwesome5 name="times" size={18} color="#9F9F9F" />
                </Pressable>
              </View>
              <View
                style={{
                  marginHorizontal: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>Bio</Text>
                {edtBio ? (
                  <Pressable onPress={() => setEdtBio(!edtBio)}>
                    <MaterialIcons name="cancel" size={22} color="red" />
                  </Pressable>
                ) : (
                  <Pressable onPress={() => setEdtBio(!edtBio)}>
                    <EvilIcons name="pencil" size={22} color="#9B0E10" />
                  </Pressable>
                )}
              </View>
              <ScrollView>
                <View style={{ marginHorizontal: 8, marginTop: 10 }}>
                  <View>
                    <TextInput
                      defaultValue={bio}
                      style={{
                        paddingVertical: 7,
                        paddingHorizontal: 8,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderRadius: 4,
                        minHeight: 150,
                        color: "#001138",
                        textAlignVertical: "top",
                        borderColor: "#9F9F9F",
                        marginBottom: errMessage ? 2 : 20,
                      }}
                      placeholder="You have not created any bio..."
                      multiline={true}
                      editable={edtBio ? true : false}
                      onChangeText={(text) => setBio(text)}
                      placeholderTextColor={"#9F9F9F"}
                    />
                    {errMessage && (
                      <Text
                        style={{ color: "red", fontSize: 13, marginBottom: 3 }}
                      >
                        {errMessage}
                      </Text>
                    )}
                    {edtBio && (
                      <Pressable
                        onPress={handleUpdateBio}
                        style={{
                          backgroundColor: "#9B0E10",
                          borderRadius: 4,
                          padding: 10,
                          marginBottom: 20,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "white",
                            textAlign: "center",
                          }}
                        >
                          Update Bio
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </KeyboardAvoidingView>
      </ScrollView>
    </BottomSheetModal>
  );
};

export default UpdateBottomSheet;

const styles = StyleSheet.create({});
