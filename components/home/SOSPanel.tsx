import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type SOSPanelProps = {
  vehicleNumber: string;
  protectedJourney: boolean;
  journeyCheckTime: number;
  onStartJourney: () => void;
  onOpenVehicle: () => void;
  onOpenContacts: () => void;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function SOSPanel({
  vehicleNumber,
  protectedJourney,
  journeyCheckTime,
  onStartJourney,
  onOpenVehicle,
  onOpenContacts,
}: SOSPanelProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(450)}
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 92,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onStartJourney}
        style={{
          backgroundColor: "rgba(2,6,23,0.94)",
          padding: 14,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: protectedJourney
            ? "rgba(34,197,94,0.45)"
            : "rgba(255,255,255,0.10)",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            color: protectedJourney ? "#4ADE80" : "#CBD5E1",
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 1,
          }}
        >
          {protectedJourney ? "PROTECTED JOURNEY ACTIVE" : "START PROTECTED JOURNEY"}
        </Text>

        <Text
          style={{
            color: "#F8FAFC",
            marginTop: 5,
            fontSize: 13,
            fontWeight: "800",
          }}
          numberOfLines={1}
        >
          {protectedJourney
            ? `Next safety check in ${formatTime(journeyCheckTime)}`
            : "Live monitoring, check-ins and escalation"}
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity
  activeOpacity={0.88}
  onPress={onOpenVehicle}
  onLongPress={onStartJourney}
  delayLongPress={2200}
  style={{
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.96)",
    padding: 13,
    borderRadius: 20,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  }}
>
          <Text style={{ color: "white", fontSize: 12, fontWeight: "900" }}>
            VEHICLE ID
          </Text>

          <Text style={{ color: "#CBD5E1", fontSize: 11, marginTop: 4 }}>
            {vehicleNumber || "DL • Vehicle"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onOpenContacts}
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.96)",
            padding: 13,
            borderRadius: 20,
            marginLeft: 6,
            borderWidth: 1,
            borderColor: "rgba(220,38,38,0.35)",
          }}
        >
          <Text style={{ color: "#FCA5A5", fontSize: 12, fontWeight: "900" }}>
            CONTACTS
          </Text>

          <Text style={{ color: "#CBD5E1", fontSize: 11, marginTop: 4 }}>
            SOS Numbers
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default React.memo(SOSPanel);