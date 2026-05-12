import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type SOSPanelProps = {
  vehicleNumber: string;
  onOpenAssist: () => void;
  onOpenVehicle: () => void;
  onOpenContacts: () => void;
};

function SOSPanel({
  vehicleNumber,
  onOpenAssist,
  onOpenVehicle,
  onOpenContacts,
}: SOSPanelProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(450)}
      style={{
        position: "absolute",
        top: 258,
        left: 16,
        right: 16,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={onOpenAssist}
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.96)",
            padding: 13,
            borderRadius: 20,
            marginRight: 6,
          }}
        >
          <Text style={{ color: "white", fontSize: 12, fontWeight: "800" }}>
            ROAD HELP
          </Text>
          <Text style={{ color: "#CBD5E1", fontSize: 11, marginTop: 4 }}>
            Tow • Fuel • EV
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          onPress={onOpenVehicle}
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.96)",
            padding: 13,
            borderRadius: 20,
            marginHorizontal: 6,
          }}
        >
          <Text style={{ color: "white", fontSize: 12, fontWeight: "800" }}>
            VEHICLE
          </Text>
          <Text style={{ color: "#CBD5E1", fontSize: 11, marginTop: 4 }}>
            {vehicleNumber || "Add details"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          onPress={onOpenContacts}
          style={{
            flex: 1,
            backgroundColor: "#DC2626",
            padding: 13,
            borderRadius: 20,
            marginLeft: 6,
          }}
        >
          <Text style={{ color: "white", fontSize: 12, fontWeight: "800" }}>
            CONTACTS
          </Text>
          <Text style={{ color: "#FECACA", fontSize: 11, marginTop: 4 }}>
            SOS Numbers
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
export default React.memo(SOSPanel);