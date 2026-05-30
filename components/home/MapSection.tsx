import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type MapSectionProps = {
  location: any;
  places: any[];
  onStartJourney: () => void;
  onSelectDestination: (coordinate: Coordinate) => void;
  onStartJourneyTo: (destination: Coordinate) => void;
  onRouteDeviationDetected?: () => void;
  routeRiskScore?: number;
  routeRiskLabel?: "SECURE" | "WATCH" | "ELEVATED";
  journeyDestination?: Coordinate | null;
  isNight: boolean;
  routeCoordinates?: Coordinate[];
  theme: any;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  lifeMessages: string[];
  protectedJourney: boolean;
  escalationActive: boolean;
  accidentDetected: boolean;
  lifeIndex: number;
  darkMapStyle: any[];
  mapFocusMode: boolean;
  onToggleFocus: () => void;
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
  routeRiskLabel = "SECURE",
  darkMapStyle,
  onRouteDeviationDetected,
  onStartJourneyTo,
  accidentDetected,
  journeyDestination,
  protectedJourney,
  routeCoordinates,
  onSelectDestination,
  escalationActive,
  riskLevel,
}: MapSectionProps) {
  const mapRef = useRef<MapView | null>(null);

  if (!location) return null;

  const userLat = Number(location.coords.latitude);
  const userLon = Number(location.coords.longitude);

  const getLookAheadPoint = () => {
    if (!routeCoordinates || routeCoordinates.length < 2) {
      return { latitude: userLat, longitude: userLon };
    }

    const targetIndex = Math.min(8, routeCoordinates.length - 1);
    const ahead = routeCoordinates[targetIndex];

    return {
      latitude: userLat * 0.65 + ahead.latitude * 0.35,
      longitude: userLon * 0.65 + ahead.longitude * 0.35,
    };
  };

  const getDistanceToRouteMeters = () => {
    if (!routeCoordinates || routeCoordinates.length < 2) return 0;

    const distances = routeCoordinates.map(
      (point) =>
        getDistanceKm(userLat, userLon, point.latitude, point.longitude) * 1000
    );

    return Math.min(...distances);
  };

  const getNearestRouteIndex = () => {
    if (!routeCoordinates || routeCoordinates.length < 2) return 0;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    routeCoordinates.forEach((point, index) => {
      const distance = getDistanceKm(
        userLat,
        userLon,
        point.latitude,
        point.longitude
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  };

  const nearestRouteIndex = getNearestRouteIndex();

  const traversedCoordinates =
    routeCoordinates?.slice(0, nearestRouteIndex + 1) || [];

  const remainingCoordinates =
    routeCoordinates?.slice(nearestRouteIndex) || [];

  useEffect(() => {
    if (!routeCoordinates || routeCoordinates.length <= 1 || !mapRef.current) {
      return;
    }

    if (protectedJourney) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: {
          top: 120,
          right: 55,
          bottom: 190,
          left: 55,
        },
        animated: true,
      });
    }
  }, [protectedJourney, routeCoordinates]);

  useEffect(() => {
    if (!protectedJourney || !mapRef.current) return;
    if (!routeCoordinates || routeCoordinates.length < 2) return;

    const cameraTarget = getLookAheadPoint();

    mapRef.current.animateCamera(
      {
        center: cameraTarget,
        zoom: 16.4,
        pitch: 0,
        heading: 0,
      },
      { duration: 900 }
    );
  }, [userLat, userLon, protectedJourney]);

  useEffect(() => {
    if (!protectedJourney || !routeCoordinates || routeCoordinates.length < 2) {
      return;
    }

    const distanceFromRoute = getDistanceToRouteMeters();

    if (distanceFromRoute > 120) {
      onRouteDeviationDetected?.();
    }
  }, [userLat, userLon, protectedJourney, routeCoordinates]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        onPress={(event) => {
          const coordinate = event.nativeEvent.coordinate;

          onSelectDestination({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          });
        }}
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
          latitudeDelta: accidentDetected
            ? 0.0038
            : escalationActive
            ? 0.006
            : protectedJourney
            ? 0.0065
            : 0.012,
          longitudeDelta: accidentDetected
            ? 0.0038
            : escalationActive
            ? 0.006
            : protectedJourney
            ? 0.0065
            : 0.012,
        }}
      >
        <Marker
          coordinate={{ latitude: userLat, longitude: userLon }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                width: 34,
                height: 34,
                borderRadius: 999,
                backgroundColor: protectedJourney
                  ? "rgba(96,165,250,0.10)"
                  : "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: protectedJourney
                  ? "rgba(147,197,253,0.22)"
                  : "rgba(255,255,255,0.10)",
              }}
            />

            <View
              style={{
                position: "absolute",
                width: 2,
                height: protectedJourney ? 18 : 10,
                backgroundColor: protectedJourney
                  ? "rgba(191,219,254,0.82)"
                  : "rgba(255,255,255,0.32)",
                borderRadius: 999,
                top: 2,
                opacity: protectedJourney ? 1 : 0.45,
              }}
            />

            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: protectedJourney ? "#E0F2FE" : "#F8FAFC",
                borderWidth: 2,
                borderColor: protectedJourney ? "#60A5FA" : "#CBD5E1",
                shadowColor: "#93C5FD",
                shadowOpacity: protectedJourney ? 0.35 : 0.12,
                shadowRadius: 10,
                elevation: 8,
              }}
            />
          </View>
        </Marker>

        {journeyDestination && (
          <Marker
            coordinate={journeyDestination}
            title={
              protectedJourney ? "Protected destination" : "Selected destination"
            }
            description={
              protectedJourney
                ? "ROADSoS route lock active"
                : "Start Protected Journey to lock route"
            }
            pinColor={protectedJourney ? "#93C5FD" : "#94A3B8"}
          />
        )}

        {protectedJourney && routeCoordinates && routeCoordinates.length > 1 && (
          <>
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={11}
              strokeColor="rgba(15,23,42,0.55)"
              lineCap="round"
              lineJoin="round"
            />

            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={7}
              strokeColor={
                escalationActive
                  ? "rgba(245,158,11,0.22)"
                  : "rgba(96,165,250,0.14)"
              }
              lineCap="round"
              lineJoin="round"
            />

            {traversedCoordinates.length > 1 && (
              <Polyline
                coordinates={traversedCoordinates}
                strokeWidth={5}
                strokeColor="rgba(148,163,184,0.38)"
                lineCap="round"
                lineJoin="round"
              />
            )}

            {remainingCoordinates.length > 1 && (
              <>
                <Polyline
                  coordinates={remainingCoordinates}
                  strokeWidth={6}
                  strokeColor={
                    escalationActive
                      ? "rgba(251,191,36,0.94)"
                      : "rgba(214,228,255,0.96)"
                  }
                  lineCap="round"
                  lineJoin="round"
                />

                <Polyline
                  coordinates={remainingCoordinates}
                  strokeWidth={2}
                  strokeColor={
                    escalationActive
                      ? "rgba(254,243,199,0.80)"
                      : "rgba(219,234,254,0.85)"
                  }
                  lineCap="round"
                  lineJoin="round"
                />
              </>
            )}
          </>
        )}

        {protectedJourney && (
          <>
            <Circle
              center={{ latitude: userLat, longitude: userLon }}
              radius={260}
              strokeWidth={1}
              strokeColor={
                escalationActive
                  ? "rgba(245,158,11,0.18)"
                  : "rgba(34,197,94,0.14)"
              }
              fillColor={
                escalationActive
                  ? "rgba(245,158,11,0.08)"
                  : "rgba(34,197,94,0.06)"
              }
            />

            <Circle
              center={{ latitude: userLat, longitude: userLon }}
              radius={120}
              strokeWidth={1}
              strokeColor={
                escalationActive
                  ? "rgba(245,158,11,0.55)"
                  : "rgba(34,197,94,0.45)"
              }
              fillColor={
                escalationActive
                  ? "rgba(245,158,11,0.12)"
                  : "rgba(34,197,94,0.10)"
              }
            />
          </>
        )}

        {riskLevel === "LOW" && (
          <Circle
            center={{ latitude: userLat, longitude: userLon }}
            radius={260}
            strokeWidth={1}
            strokeColor="rgba(59,130,246,0.20)"
            fillColor="rgba(45, 98, 212, 0.31)"
          />
        )}

        {riskLevel === "MODERATE" && (
          <Circle
            center={{ latitude: userLat, longitude: userLon }}
            radius={420}
            strokeWidth={1}
            strokeColor="rgba(245,158,11,0.28)"
            fillColor="rgba(245,158,11,0.08)"
          />
        )}

        {riskLevel === "HIGH" && (
          <Circle
            center={{ latitude: userLat, longitude: userLon }}
            radius={520}
            strokeWidth={1}
            strokeColor="rgba(220,38,38,0.32)"
            fillColor="rgba(220,38,38,0.10)"
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
              description={`${place.type || "Safety point"} • ${distanceKm.toFixed(
                1
              )} km`}
              pinColor={
                place.type === "hospital"
                  ? "#34D399"
                  : place.type === "police"
                  ? "#60A5FA"
                  : "#D97706"
              }
              onPress={() => {
                onStartJourneyTo({
                  latitude: lat,
                  longitude: lon,
                });
              }}
            />
          );
        })}
      </MapView>

      {protectedJourney && (
        <View
          style={{
            position: "absolute",
            top: 58,
            alignSelf: "center",
            backgroundColor: "rgba(2,6,23,0.72)",
            borderWidth: 1,
            borderColor:
              routeRiskLabel === "ELEVATED"
                ? "rgba(245,158,11,0.28)"
                : routeRiskLabel === "WATCH"
                ? "rgba(96,165,250,0.22)"
                : "rgba(34,197,94,0.22)",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              marginRight: 10,
              backgroundColor:
                routeRiskLabel === "ELEVATED"
                  ? "#F59E0B"
                  : routeRiskLabel === "WATCH"
                  ? "#60A5FA"
                  : "#22C55E",
            }}
          />

          <View>
            <Text
              style={{
                color: "#F8FAFC",
                fontSize: 12,
                fontWeight: "800",
                letterSpacing: 0.8,
              }}
            >
              {routeRiskLabel} ROUTE
            </Text>

            <Text
              style={{
                color: "#94A3B8",
                fontSize: 10,
                marginTop: 2,
                fontWeight: "600",
              }}
            >
              ROADSoS corridor intelligence active
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default React.memo(MapSection);