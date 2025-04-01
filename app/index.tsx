import React from "react";
import { StyleSheet, Text, View, Button, ImageBackground } from "react-native";
import { useRouter } from "expo-router";



const backgroundImage = {
  uri: "https://img.freepik.com/free-photo/transport-logistics-concept_23-2151541930.jpg?t=st=1743507390~exp=1743510990~hmac=ca8e66e1477a993f96ff659665e00a79c9cee7fb5458957a07408e95fdf19a85&w=740",
};

const App: React.FC = () => {
  const router = useRouter(); 

  const navigateToMap = () => {
    router.push("/MapScreen"); 
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to Aifeul Tracker!</Text>
      <Button title="Go to Map" onPress={navigateToMap} />{" "}
      {/* Button to navigate to Map */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
     
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    backgroundColor: "black",
    padding: 10
  },
});

export default App;
