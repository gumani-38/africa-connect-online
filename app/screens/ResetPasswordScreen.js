import {
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICES_ROLE;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ResetPasswordScreen = () => {
  const { userId, email } = useRoute().params;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const handleResetPassword = async () => {
    try {
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      const { data: user, error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: password }
      );
      if (error) {
        throw error;
      }
      navigation.navigate("Login");
    } catch (err) {
      console.log("error while resetting password: ", err.message);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View animation="zoomIn">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 60,
            marginTop: 20,
            marginBottom: 80,
          }}
        >
          <View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons
                style={styles.backArrow}
                name="chevron-back"
                size={30}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.forgotText}>Reset Password</Text>
        </View>

        <View>
          <Text style={styles.enterYourEmail}>Enter new password</Text>

          <TextInput
            style={styles.emailBox}
            placeholder="Enter your password"
            value={password}
            onChangeText={(val) => setPassword(val)}
          />
        </View>

        <View>
          <Pressable style={styles.LoginButton} onPress={handleResetPassword}>
            <Text style={styles.LoginText}>Reset Password</Text>
          </Pressable>
        </View>
      </Animatable.View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 10,
  },

  forgotText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },

  backArrow: {
    fontSize: 30,
    color: "#9B0E10",
  },

  forgotPassword: {
    fontSize: 20,
    alignSelf: "center",
    fontWeight: "bold",
    marginTop: 20,
    color: "#000",
  },

  dontWorry: {
    textAlign: "center",
    color: "#000",
    marginTop: 5,
  },

  enterYourEmail: {
    color: "#000",
    marginTop: 50,
  },

  emailBox: {
    borderWidth: 1,
    width: "100%",
    borderRadius: 4,
    marginTop: 10,
    borderColor: "#D1D1D1",
    padding: 8,
  },

  emailIcon: {
    position: "absolute",
    top: -35,
    right: 10,
  },

  LoginButton: {
    width: "100%",
    borderRadius: 4,
    marginTop: 30,
    backgroundColor: "#8b0016",
    padding: 9,
  },

  LoginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    alignSelf: "center",
  },
});
