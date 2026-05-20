import React from "react";
import { Linking, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, { FadeIn } from "react-native-reanimated";

type MapSectionProps = {
  location: any;
  places: any[];
  isNight: boolean;
  theme: any;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  lifeMessages: string[];
  lifeIndex: number;
  darkMapStyle: any[];
  onStartJourney: () => void;
  mapFocusMode: boolean;
  onToggleFocus: () => void;
  
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
  mapFocusMode,
  darkMapStyle,
  onToggleFocus,
  riskLevel,
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
        customMapStyle={darkMapStyle}
        
        
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
        {riskLevel === "LOW" && (
  <Circle
    center={{ latitude: userLat, longitude: userLon }}
    radius={500}
    strokeWidth={2}
    strokeColor="rgba(34, 104, 255, 0.85)"
    fillColor="rgba(37,99,235,0.30)"
  />
)}

{riskLevel === "MODERATE" && (
  <Circle
    center={{ latitude: userLat, longitude: userLon }}
    radius={600}
    strokeWidth={2}
    strokeColor="rgba(245,158,11,0.85)"
    fillColor="rgba(245,158,11,0.32)"
  />
)}

{riskLevel === "HIGH" && (
  <Circle
    center={{ latitude: userLat, longitude: userLon }}
    radius={750}
    strokeWidth={2}
    strokeColor="rgba(220,38,38,0.9)"
    fillColor="rgba(220,38,38,0.36)"
  />
)}

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
       
      </Animated.View>
    </View>
  );
}

export default React.memo(MapSection);