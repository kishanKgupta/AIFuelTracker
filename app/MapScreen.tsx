// app/MapScreen.tsx
import React, { useState, useCallback } from "react";
import { View, Button, Alert, StyleSheet, Text } from "react-native";
import MapView, {
  Marker,
  Polyline,
  MapPressEvent,
  Region,
} from "react-native-maps";
import polyline from "@mapbox/polyline";


const GOOGLE_MAPS_APIKEY = "AIzaSyCwAhQiOUEz_zsfm8abRkqwnIRGnLvF19s";


const fuelStations = [
  {
    id: 1,
    title: "Fuel Station 1 - Los Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: 2,
    title: "Fuel Station 2 - San Francisco",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: 3,
    title: "Fuel Station 3 - New York",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: 4,
    title: "Fuel Station 4 - Chicago",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: 5,
    title: "Fuel Station 5 - Miami",
    latitude: 25.7617,
    longitude: -80.1918,
  },
];

interface Location {
  latitude: number;
  longitude: number;
}

const MapScreen: React.FC = () => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Location[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: 37.0902, // USA's center latitude
    longitude: -95.7129, // USA's center longitude
    latitudeDelta: 60, // Zoom level
    longitudeDelta: 60, // Zoom level
  });

  // Fetch route using Google Maps Directions API
  const fetchRoute = useCallback(async (start: Location, end: Location) => {
    if (!start || !end) {
      Alert.alert("Error", "Start or Destination is missing.");
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.status !== "OK" || !json.routes.length) {
        Alert.alert("Error", "No route found.");
        return;
      }

      const encodedPoints = json.routes[0].overview_polyline.points;
      const points = polyline.decode(encodedPoints);
      const routeCoords = points.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      setRouteCoordinates(routeCoords);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch route.");
    }
  }, []);

  // Handle map press to set start and destination locations
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      const { latitude, longitude } = event.nativeEvent.coordinate;

      if (!startLocation) {
        setStartLocation({ latitude, longitude });
        setRouteCoordinates([]);
        Alert.alert("Start Location Set", "Now tap on the destination.");
      } else if (!endLocation) {
        setEndLocation({ latitude, longitude });
        Alert.alert("Destination Set", "Fetching the route...");
        fetchRoute({ latitude, longitude }, startLocation);
      }
    },
    [startLocation, endLocation, fetchRoute]
  );

  // Clear the route
  const clearRoute = () => {
    setStartLocation(null);
    setEndLocation(null);
    setRouteCoordinates([]);
    Alert.alert("Cleared", "You can now select new locations.");
  };

  

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onPress={handleMapPress}
        region={region} // Set the initial region to focus on the USA
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // Update the region if it changes
      >
        {/* Dummy Fuel Stations Markers */}
        {fuelStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.title}
            pinColor="orange"
          />
        ))}

        {/* Start Location Marker */}
        {startLocation && (
          <Marker coordinate={startLocation} title="Start" pinColor="green" />
        )}

        {/* End Location Marker */}
        {endLocation && (
          <Marker coordinate={endLocation} title="Destination" pinColor="red" />
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="blue"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* UI Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Clear Route" onPress={clearRoute} color="#FF6347" />
      </View>

      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Tap to set start and destination</Text>
      </View>
    </View>
  );
};

// Styling for the map and components
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 10,
  },
  infoContainer: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});

export default MapScreen;
