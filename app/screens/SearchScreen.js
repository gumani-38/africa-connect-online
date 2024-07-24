import { useContext, useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  View,
} from "react-native";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import UserCard from "../components/UserCard";
import { supabase } from "../utils/supabase";

const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);
  };

  useEffect(() => {
    getUser();
  }, []);
  const handleSearchClick = async (text) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        throw error;
      }

      const filteredData = data.filter(
        (profile) =>
          (profile.username &&
            profile.username.toLowerCase().includes(text.toLowerCase())) ||
          (profile.name &&
            profile.name.toLowerCase().includes(text.toLowerCase())) ||
          (profile.lastname &&
            profile.lastname.toLowerCase().includes(text.toLowerCase()))
      );
      setResults(filteredData);
    } catch (error) {
      console.error("Error searching profiles:", error.message);
      // Handle error, e.g., show error message to user
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Entypo name="chevron-left" size={32} color="white" />
          </View>
        </Pressable>
        <Image source={require("../assets/aco-logo.png")} style={styles.logo} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search by username, name..."
            onChangeText={handleSearchClick}
          />
        </View>
      </View>

      <View style={styles.resultsContainer}>
        {results.length <= 0 && (
          <Text
            style={{
              color: "red",
              fontSize: 14,
              margin: 3,
              textAlign: "center",
            }}
          >
            No profile found...
          </Text>
        )}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <UserCard
              username={item.username}
              name={item.name}
              image={item.photo}
              lastName={item.lastName}
              profileId={item.id}
              userId={userId}

              // Add other relevant props from profile data
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 7,
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#9B0E10",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    borderRadius: 25,
  },
  searchContainer: {
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#9F9F9F",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
});
