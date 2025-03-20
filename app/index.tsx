import React, { useState } from "react";
import MapView, { Marker, Polyline, MapPressEvent } from "react-native-maps";
import { StyleSheet, View, Alert, Button } from "react-native";
import polyline from "@mapbox/polyline"; // Ensure it's installed

// Define a Location type
interface Location {
  latitude: number;
  longitude: number;
}

// Initial region of Punjab
const initialRegion = {
  latitude: 30.900965,
  longitude: 75.857277,
  latitudeDelta: 2.0,
  longitudeDelta: 2.0,
};

const GOOGLE_MAPS_APIKEY = "AIzaSyCXk-YdEKxJc9bJHjUHu6pWozyZiGWoTWc";

export default function App() {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Location[]>([]); // Stores route points

  // Fetch route from Google Maps API
  const fetchRoute = async (start: Location, end: Location) => {
    if (!start || !end) {
      Alert.alert("Error", "Start or Destination is missing.");
      return;
    }

    const startCoords = `${start.latitude},${start.longitude}`;
    const endCoords = `${end.latitude},${end.longitude}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords}&destination=${endCoords}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      console.log("API Response:", JSON.stringify(json, null, 2)); // Debugging

      if (json.status !== "OK" || !json.routes.length) {
        Alert.alert("Error", "No route found. Check API key or try again.");
        return;
      }

      const encodedPoints = json.routes[0].overview_polyline.points;
      console.log("Encoded Polyline Points:", encodedPoints); // Debugging

      const points: [number, number][] = polyline.decode(encodedPoints);
      console.log("Decoded Points:", points); // Debugging

      const routeCoords: Location[] = points.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      console.log("Final Route Coordinates:", routeCoords); // Debugging
      setRouteCoordinates(routeCoords);
    } catch (error) {
      console.error("Fetch Route Error:", error);
      Alert.alert("Error", "Failed to fetch route.");
    }
  };

  // Handle user tap on map
  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    if (!startLocation) {
      setStartLocation({ latitude, longitude });
      setRouteCoordinates([]); // Clear previous route
      Alert.alert("Start Location Set", "Now tap on the destination.");
    } else if (!destination) {
      const dest: Location = { latitude, longitude };
      setDestination(dest);
      Alert.alert("Destination Set", "Fetching the route...");

      // Wait for `startLocation` to be set properly before calling fetchRoute
      setTimeout(() => {
        fetchRoute(startLocation, dest);
      }, 500);
    }
  };

  // Clear everything
  const clearRoute = () => {
    setStartLocation(null);
    setDestination(null);
    setRouteCoordinates([]);
    Alert.alert("Cleared", "You can now select new locations.");
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress}
      >
        {/* Start Marker */}
        {startLocation && (
          <Marker
            coordinate={startLocation}
            title="Start Location"
            pinColor="green"
          />
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker coordinate={destination} title="Destination" pinColor="red" />
        )}

        {/* Draw Route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="blue"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* Clear Button */}
      <View style={styles.buttonContainer}>
        <Button title="Clear Route" onPress={clearRoute} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "90%", // Adjusted to make space for button
  },
  buttonContainer: {
    width: "100%",
    height: "10%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
