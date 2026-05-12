import React from "react";
import { Text, View } from "react-native";
import MapView, {
    Marker,
    PROVIDER_GOOGLE,
} from "react-native-maps";

import Animated, {
    FadeIn,
} from "react-native-reanimated";

import { BlurView } from "expo-blur";

type MapSectionProps = {
  location: any;
  places: any[];
  isNight: boolean;
  theme: any;
  lifeMessages: string[];
  lifeIndex: number;
  darkMapStyle: any[];
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

  return (
    <View style={{ flex: 1 }}>

      {/* MAP */}
      <MapView
      key={isNight ? "night-map" : "day-map"}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
         customMapStyle={isNight ? darkMapStyle : []}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* USER MARKER */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
        />

        {/* NEARBY PLACES */}
        {places.slice(0, 30).map((place, index) => (
          <Marker
            key={place.id || index}
            coordinate={{
              latitude: place.lat,
              longitude: place.lon,
            }}
            title={place.name || "Nearby service"}
            pinColor={
              place.type === "hospital"
                ? "#22C55E"
                : place.type === "police"
                ? "#3B82F6"
                : "#F59E0B"
            }
          />
        ))}
      </MapView>

      {/* HEADER */}
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
            {isNight
              ? "Night safety mode active"
              : "Day safety mode active"}
          </Text>

          <View
            style={{
              marginTop: 12,
              backgroundColor: isNight
                ? "#111827"
                : "#FFFFFF",
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