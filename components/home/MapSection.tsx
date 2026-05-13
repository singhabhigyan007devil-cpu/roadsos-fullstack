import { BlurView } from "expo-blur";
import React from "react";
import { Linking, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, { FadeIn } from "react-native-reanimated";

type MapSectionProps = {
  location: any;
  places: any[];
  isNight: boolean;
  theme: any;
  lifeMessages: string[];
  lifeIndex: number;
  darkMapStyle: any[];
};

const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function MapSection({
  location,
  places,
  isNight,
  theme,
  lifeMessages,
  lifeIndex,
  darkMapStyle,
}: MapSectionProps) {
  if (!location) return null;

  const userLat = Number(location.coords.latitude);
  const userLon = Number(location.coords.longitude);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        key={isNight ? "night-map" : "day-map"}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        showsUserLocation={false}
        followsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={isNight ? darkMapStyle : []}
        initialRegion={{
          latitude: userLat,
          longitude: userLon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
  coordinate={{
    latitude: userLat,
    longitude: userLon,
  }}
  pinColor="#EA4335"
  title="You are here"
  description="Current location"
/>

        {places.slice(0, 50).map((place: any, index: number) => {
          const lat = Number(place.lat);
          const lon = Number(place.lon);

          if (Number.isNaN(lat) || Number.isNaN(lon)) {
            return null;
          }

          const distanceKm = getDistanceKm(userLat, userLon, lat, lon);

          return (
            <Marker
              key={`${place.id || index}-${lat}-${lon}`}
              coordinate={{
                latitude: lat,
                longitude: lon,
              }}
              title={
                place.type === "police"
                  ? `🚓 ${place.name || "Police Station"}`
                  : place.type === "hospital"
                  ? `🏥 ${place.name || "Hospital"}`
                  : place.name || "Nearby service"
              }
              description={`${place.type || "Safety place"} • ${distanceKm.toFixed(
                1
              )} km away`}
              pinColor={
                place.type === "hospital"
                  ? "#f41086"
                  : place.type === "police"
                  ? "#3B82F6"
                  : "#F59E0B"
              }
              onCalloutPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${lat},${lon}&travelmode=driving`;
                Linking.openURL(url);
              }}
            />
          );
        })}
      </MapView>

      <Animated.View
        entering={FadeIn.duration(500)}
        style={{
          position: "absolute",
          top: 42,
          left: 16,
          right: 16,
        }}
      >
        <BlurView
          intensity={95}
          tint={isNight ? "dark" : "light"}
          style={{
            borderRadius: 28,
            padding: 18,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 28,
              fontWeight: "900",
            }}
          >
            ROADSoS 🚨
          </Text>

          <Text
            style={{
              color: theme.sub,
              marginTop: 4,
              fontSize: 14,
            }}
          >
            {isNight ? "Night safety mode active" : "Day safety mode active"}
          </Text>

          <View
            style={{
              marginTop: 12,
              backgroundColor: isNight ? "#111827" : "#FFFFFF",
              padding: 12,
              borderRadius: 18,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              {lifeMessages[lifeIndex]}
            </Text>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

export default React.memo(MapSection);