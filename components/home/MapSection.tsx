import { BlurView } from "expo-blur";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
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
  onStartJourney: () => void;
};

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

function MapSection({
  location,
  places,
  isNight,
  theme,
  darkMapStyle,
  onStartJourney,
}: MapSectionProps) {
  if (!location) return null;

  const userLat = Number(location.coords.latitude);
  const userLon = Number(location.coords.longitude);

  const hospitals = places.filter((p) => p.type === "hospital");
  const police = places.filter((p) => p.type === "police");

  const nearestHospitalKm =
    hospitals.length > 0
      ? Math.min(
          ...hospitals.map((p) =>
            getDistanceKm(userLat, userLon, Number(p.latitude), Number(p.longitude))
          )
        )
      : null;

  const nearestPoliceKm =
    police.length > 0
      ? Math.min(
          ...police.map((p) =>
            getDistanceKm(userLat, userLon, Number(p.latitude), Number(p.longitude))
          )
        )
      : null;

  const coverageStatus =
    nearestHospitalKm !== null &&
    nearestPoliceKm !== null &&
    nearestHospitalKm <= 3 &&
    nearestPoliceKm <= 3
      ? "READY"
      : nearestHospitalKm !== null || nearestPoliceKm !== null
      ? "LIMITED"
      : "EXPOSED";

  const coverageColor =
    coverageStatus === "READY"
      ? "#16A34A"
      : coverageStatus === "LIMITED"
      ? "#D97706"
      : "#DC2626";

  return (
    <View style={{ flex: 1 }}>
      <MapView
        key={isNight ? "night-map" : "day-map"}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        showsUserLocation={false}
        followsUserLocation
        showsMyLocationButton
        customMapStyle={isNight ? darkMapStyle : []}
        initialRegion={{
          latitude: userLat,
          longitude: userLon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: userLat, longitude: userLon }}
          pinColor="#DC2626"
          title="Current Position"
          description="Live ROADSoS location"
        />

        {places.slice(0, 50).map((place: any, index: number) => {
          const lat = Number(place.latitude);
          const lon = Number(place.longitude);

          if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

          const distanceKm = getDistanceKm(userLat, userLon, lat, lon);

          return (
            <Marker
              key={`${place.id || index}-${lat}-${lon}`}
              coordinate={{ latitude: lat, longitude: lon }}
              title={place.name || "Emergency point"}
              description={`${place.type || "Safety point"} • ${distanceKm.toFixed(1)} km`}
              pinColor={
                place.type === "hospital"
                  ? "#059669"
                  : place.type === "police"
                  ? "#2563EB"
                  : "#D97706"
              }
              onCalloutPress={() => {
                Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${lat},${lon}&travelmode=driving`
                );
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
          intensity={92}
          tint={isNight ? "dark" : "light"}
          style={{
            borderRadius: 26,
            padding: 18,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: isNight
              ? "rgba(255,255,255,0.10)"
              : "rgba(15,23,42,0.10)",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 26,
                  fontWeight: "900",
                  letterSpacing: 0.8,
                }}
              >
                ROADSoS
              </Text>

              <Text
                style={{
                  color: theme.sub,
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 0.4,
                }}
              >
                Emergency Safety Intelligence
              </Text>
              <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  }}
>
  <View
    style={{
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: "#22C55E",
      marginRight: 8,
      shadowColor: "#22C55E",
      shadowOpacity: 0.8,
      shadowRadius: 6,
      elevation: 6,
    }}
  />

  <Text
    style={{
      color: "#94A3B8",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1,
    }}
  >
    LIVE GRID ACTIVE
  </Text>
</View>
            </View>

            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: coverageColor,
                marginTop: 8,
              }}
            />
          </View>

          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 18,
              backgroundColor: isNight
                ? "rgba(2,6,23,0.72)"
                : "rgba(248,250,252,0.92)",
              borderWidth: 1,
              borderColor: isNight
                ? "rgba(255,255,255,0.08)"
                : "rgba(15,23,42,0.08)",
            }}
          >
            <Text
              style={{
                color: theme.sub,
                fontSize: 11,
                fontWeight: "900",
                letterSpacing: 1.1,
              }}
            >
              EMERGENCY COVERAGE
            </Text>

            <Text
              style={{
                color: coverageColor,
                marginTop: 6,
                fontSize: 22,
                fontWeight: "900",
                letterSpacing: 0.8,
              }}
            >
              {coverageStatus}
            </Text>

            <Text
              style={{
                color: theme.text,
                marginTop: 8,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Hospital{" "}
              {nearestHospitalKm !== null
                ? `${nearestHospitalKm.toFixed(1)} km`
                : "unavailable"}{" "}
              • Police{" "}
              {nearestPoliceKm !== null
                ? `${nearestPoliceKm.toFixed(1)} km`
                : "unavailable"}
            </Text>
          </View>
          <TouchableOpacity
  activeOpacity={0.9}
  onPress={onStartJourney}
  style={{
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(2,6,23,0.86)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.22)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  <View style={{ flex: 1 }}>
    <Text
      style={{
        color: "#4ADE80",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1,
      }}
    >
      PROTECTED JOURNEY
    </Text>

    <Text
      style={{
        color: "#F8FAFC",
        marginTop: 4,
        fontSize: 13,
        fontWeight: "800",
      }}
      numberOfLines={1}
    >
      Monitoring, check-ins and escalation
    </Text>
  </View>

  <Text
    style={{
      color: "#94A3B8",
      fontSize: 11,
      fontWeight: "900",
      marginLeft: 10,
    }}
  >
    START
  </Text>
</TouchableOpacity>
        </BlurView>
      </Animated.View>
    </View>
  );
}

export default React.memo(MapSection);