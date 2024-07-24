import {
  StyleSheet,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  StatusBar,
  Pressable,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import * as Animatable from "react-native-animatable";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SelectList } from "react-native-dropdown-select-list";
import { supabase } from "../utils/supabase";
import ProgressBar from "../components/ProgressBar";
import SuccessAlert from "../components/SuccessAlert";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [selectedProfileType, setSelectedProfileType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [userId, setUserId] = useState("");
  const [profileTypes, setProfileTypes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    getUser();
    if (userId) {
      getUserProfile();
    }
    getLocation();
    getProfileTypes();
  }, []);
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };
  const getLocation = async () => {
    try {
      const { data, error } = await supabase.from("countries").select("*");
      if (error) {
        throw error;
      }
      const formattedData = data.map((item) => ({
        key: item.id,
        value: item.name,
      }));
      setLocations(formattedData);
    } catch (error) {
      console.log(error);
    }
  };
  const getProfileTypes = async () => {
    try {
      const { data, error } = await supabase.from("profile_types").select("*");
      if (error) {
        throw error;
      }
      const formattedData = data.map((item) => ({
        key: item.id,
        value: item.type,
      }));
      setProfileTypes(formattedData);
    } catch (error) {
      console.log(error);
    }
  };
  const getUserProfile = async () => {
    return navigation.replace("Main");
  };
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    description: "",
    secureTextEntry: true,
    isValidFirstName: true,
    isValidLastName: true,
    isValidEmail: true,
    isValidPhone: true,
  });

  const handleFirstNameChange = (val) => {
    setUserData({
      ...userData,
      firstName: val,
      isValidFirstName: val.trim().length >= 2,
    });
  };

  const handleLastNameChange = (val) => {
    setUserData({
      ...userData,
      lastName: val,
      isValidLastName: val.trim().length >= 2,
    });
  };

  const handleEmailChange = (val) => {
    const emailPattern = /\S+@\S+\.\S+/;
    setUserData({
      ...userData,
      email: val,
      isValidEmail: emailPattern.test(val),
    });
  };

  const handlePasswordChange = (val) => {
    setUserData({
      ...userData,
      password: val,
    });
  };

  const handlePhoneChange = (val) => {
    const phonePattern = /^[0-9]{10,15}$/;
    setUserData({
      ...userData,
      phone: val,
      isValidPhone: phonePattern.test(val),
    });
  };

  const handleDescriptionChange = (val) => {
    setUserData({
      ...userData,
      description: val,
    });
  };

  const updateSecureTextEntry = () => {
    setUserData({
      ...userData,
      secureTextEntry: !userData.secureTextEntry,
    });
  };
  const insertProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from("profiles").insert([
        {
          id: userId,
          profile_type: selectedProfileType,
          location: selectedLocation,
          name: userData.firstName,
          email: userData.email,
          lastName: userData.lastName ? userData.lastName : null,
        },
      ]);
      if (error) {
        throw error;
      }
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSignUp = async () => {
    if (
      userData.firstName &&
      userData.email &&
      userData.password &&
      userData.phone &&
      selectedLocation &&
      selectedProfileType &&
      userData.isValidFirstName &&
      userData.isValidEmail &&
      userData.isValidPhone
    ) {
      setLoading(true);

      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 1) {
            clearInterval(progressInterval);
            return 1;
          }
          return prevProgress + 0.1;
        });
      }, 100);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              phone: userData.phone,
            },
          },
        });

        if (error) return setError("Failed to create an account");
        insertProfile(data.user.id);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
          setShowSuccess(true);
          setTimeout(async () => {
            navigation.navigate("Setup");
            setShowSuccess(false);
          }, 300);
        }, 1000);
      } catch (error) {
        setError("Failed to create an account");
      }
    } else {
      setUserData({
        ...userData,
        isValidFirstName: userData.firstName.trim().length >= 2,
        isValidLastName: userData.lastName.trim().length >= 2,
        isValidEmail: /\S+@\S+\.\S+/.test(userData.email),
        isValidPhone: /^[0-9]{10,15}$/.test(userData.phone),
      });
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ padding: 10 }}
        >
          <Animatable.View animation="zoomIn">
            <Text style={styles.Register}>Register</Text>

            <View>
              <SelectList
                data={profileTypes}
                setSelected={setSelectedProfileType}
                boxStyles={{
                  padding: 7,
                  borderColor: "#D1D1D1",
                  borderWidth: 1,
                  borderRadius: 4,
                  marginBottom: 6,
                  marginTop: 10,
                }}
                dropdownTextStyles={{
                  color: "#001138",
                  fontSize: 13,
                  fontWeight: "500",
                }}
                placeholder="What best describes you"
              />
            </View>

            <View>
              <TextInput
                style={styles.NameBox}
                placeholder={
                  selectedProfileType === 2
                    ? "Enter your organization name"
                    : "Enter your first name"
                }
                onChangeText={handleFirstNameChange}
              />
              {!userData.isValidFirstName && (
                <Animatable.View animation="bounceIn">
                  <MaterialIcons
                    style={styles.Nameicon}
                    name="cancel"
                    size={20}
                    color="red"
                  />
                </Animatable.View>
              )}
            </View>
            {selectedProfileType === 1 && (
              <View>
                <TextInput
                  style={styles.NameBox}
                  placeholder="Enter your last name"
                  onChangeText={handleLastNameChange}
                />
                {!userData.isValidLastName && (
                  <Animatable.View animation="bounceIn">
                    <MaterialIcons
                      style={styles.Nameicon}
                      name="cancel"
                      size={20}
                      color="red"
                    />
                  </Animatable.View>
                )}
              </View>
            )}

            <View>
              <TextInput
                style={styles.EmailBox}
                placeholder="Enter your email"
                keyboardType="email-address"
                onChangeText={handleEmailChange}
              />
              {!userData.isValidEmail && (
                <Animatable.View animation="bounceIn">
                  <MaterialIcons
                    style={styles.Nameicon}
                    name="cancel"
                    size={20}
                    color="red"
                  />
                </Animatable.View>
              )}
            </View>

            <View>
              <SelectList
                data={locations}
                setSelected={setSelectedLocation}
                boxStyles={{
                  padding: 7,
                  borderColor: "#D1D1D1",
                  borderWidth: 1,
                  borderRadius: 4,
                  marginTop: 10,
                }}
                dropdownTextStyles={{
                  color: "#001138",
                  fontSize: 13,
                  fontWeight: "500",
                }}
                placeholder="Select your country"
              />
            </View>

            <View>
              <TextInput
                style={styles.PhoneBox}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                onChangeText={handlePhoneChange}
              />
              {userData.isValidPhone == false && (
                <Animatable.View animation="bounceIn">
                  <MaterialIcons
                    style={styles.Nameicon}
                    name="cancel"
                    size={20}
                    color="red"
                  />
                </Animatable.View>
              )}
            </View>
            <View style={styles.PasswordBox}>
              <TextInput
                style={{ flex: 1 }}
                secureTextEntry={userData.secureTextEntry}
                placeholder="Enter your password"
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity onPress={updateSecureTextEntry}>
                <Feather
                  style={{ top: 4 }}
                  name={userData.secureTextEntry ? "eye-off" : "eye"}
                  size={18}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {error && (
              <View>
                <Text
                  style={{
                    textAlign: "center",
                    color: "red",
                    marginTop: 12,
                    fontWeight: 500,
                  }}
                >
                  {error}
                </Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => navigation.navigate("Terms")}>
                <Text style={styles.Terms}>
                  By clicking Sign Up, you agree to our Terms, Privacy Policy
                  and Cookies Policy
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                style={styles.RegisterButton}
                onPress={handleSignUp}
              >
                <Text style={styles.RegisterText}>Register</Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignSelf: "center", marginBottom: 26 }}>
              <Text style={styles.Alreadyaccount}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.Login}> Login</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </SafeAreaView>
      {loading && <ProgressBar process={progress} />}
      {showSuccess && <SuccessAlert />}
    </>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 10,
  },
  Register: {
    fontSize: 23,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
  },
  Enteryourname: {
    marginTop: 7,
    color: "#000",
  },
  NameBox: {
    borderWidth: 1,
    width: "100%",
    borderRadius: 4,
    marginTop: 10,
    borderColor: "#D1D1D1",
    padding: 7,
  },
  Nameicon: {
    position: "absolute",
    top: -35,
    right: 10,
  },
  Enteryouremail: {
    marginTop: 15,
    color: "#000",
  },
  Terms: {
    marginTop: 17,
    textAlign: "center",
    fontWeight: "500",
    fontSize: 12,
    color: "#9B0E10",
    marginBottom: 20,
  },
  EmailBox: {
    borderWidth: 1,
    width: "100%",
    borderRadius: 4,
    marginTop: 10,
    borderColor: "#D1D1D1",
    padding: 7,
  },
  Emailicon: {
    position: "absolute",
    top: -35,
    right: 10,
  },
  Enteryourpassword: {
    marginTop: 15,
    color: "#000",
  },
  PasswordBox: {
    borderWidth: 1,
    width: "100%",
    borderRadius: 4,
    marginTop: 10,
    flexDirection: "row",
    borderColor: "#D1D1D1",
    padding: 7,
  },

  Forgotpassword: {
    fontWeight: "bold",
    alignSelf: "flex-end",
    marginTop: 10,
    color: "#000",
  },
  RegisterButton: {
    borderRadius: 4,
    marginTop: 15,
    backgroundColor: "#8b0016",
    padding: 8,
  },
  RegisterText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    alignSelf: "center",
  },
  Alreadyaccount: {
    marginTop: 20,
    color: "#000",
  },
  Login: {
    marginTop: -18,
    marginLeft: 165,
    color: "#00bfff",
    fontWeight: "bold",
  },
  Enteryourdescription: {
    marginTop: 15,
    color: "#000",
  },
  DescriptionBox: {
    borderWidth: 1,
    width: "100%",
    borderRadius: 10,
    marginTop: 10,
    borderColor: "#D1D1D1",
    paddingLeft: 10,
    height: 50,
  },
  Descriptionicon: {
    position: "absolute",
    top: -35,
    right: 10,
  },
  Enteryourphone: {
    marginTop: 20,
    color: "#000",
  },
  PhoneBox: {
    borderWidth: 1,
    width: "100%",
    borderRadius: 4,
    marginTop: 10,
    borderColor: "#D1D1D1",
    padding: 7,
  },
  Phoneicon: {
    position: "absolute",
    top: -35,
    right: 10,
  },
});
