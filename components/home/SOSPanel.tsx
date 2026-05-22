import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type SOSPanelProps = {
  vehicleNumber: string;
  protectedJourney: boolean;
  journeyCheckTime: number;
  covertMode: boolean;
onActivateCovertMode: () => void;
onDeactivateCovertMode: () => void;
  onStartJourney: () => void;
  onOpenVehicle: () => void;
  onOpenContacts: () => void;
  onOpenTools: () => void;
escalationActive: boolean;
  onSOS: () => void;
onCall112: () => void;
onOpenAI: () => void;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function SOSPanel({
  vehicleNumber,
  protectedJourney,
  covertMode,
onActivateCovertMode,
onDeactivateCovertMode,
  journeyCheckTime,
  onStartJourney,
  onOpenVehicle,
  onSOS,
  onCall112,
  onOpenAI,
  onOpenContacts,
escalationActive,
    onOpenTools,
}: SOSPanelProps) {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(escalationActive ? 1.75 : protectedJourney ? 1.45 : 1.25, {
  duration: escalationActive ? 520 : protectedJourney ? 900 : 1300,
}),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
  <Animated.View
    entering={FadeIn.delay(450)}
    style={{
      shadowColor: "#000",
shadowOpacity: 0.16,
shadowRadius: 18,
elevation: 10,
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 22,
      padding: 10,
      borderRadius: 36,
      backgroundColor: "rgba(2,6,23,0.64)",
      backdropFilter: "blur(18px)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    }}
  >
    <Animated.View
  entering={FadeIn.delay(180)}
  style={{
    marginBottom: 8,
paddingHorizontal: 12,
paddingVertical: 8,
borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
  }}
>
  <Animated.View
  style={[
    {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: escalationActive
        ? "#F59E0B"
        : protectedJourney
        ? "#4ADE80"
        : "#60A5FA",
      marginRight: 10,
      shadowColor: escalationActive
        ? "#F59E0B"
        : protectedJourney
        ? "#22C55E"
        : "#38BDF8",
      shadowOpacity: 0.9,
      shadowRadius: 8,
    },
    pulseStyle,
  ]}
/>

  <View style={{ flex: 1 }}>
    <Text
      style={{
        color: "#F8FAFC",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0.4,
      }}
    >
      ROADSoS AI
    </Text>
      <View
  style={{
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
    overflow: "hidden",
  }}
>
  <View
    style={{
      width: protectedJourney ? "78%" : "32%",
      height: "100%",
      borderRadius: 999,
      backgroundColor: protectedJourney ? "#22C55E" : "#2563EB",
    }}
  />
</View>
    <Text
  style={{
    color: "#CBD5E1",
    fontSize: 11,
    marginTop: 2,
  }}
  numberOfLines={1}
>
  {escalationActive
    ? "Escalation active • Monitoring intensified"
    : protectedJourney
    ? "Monitoring journey and nearby safety infrastructure"
    : "Low risk detected • Nearby medical support available"}
</Text>
  </View>
</Animated.View>
    <TouchableOpacity
  activeOpacity={0.9}
  onPress={covertMode ? onDeactivateCovertMode : onStartJourney}
  onLongPress={onActivateCovertMode}
  delayLongPress={900}
      style={{
        padding: 12,
        borderRadius: 20,
        borderColor: covertMode
  ? "rgba(245,158,11,0.38)"
  : escalationActive
  ? "rgba(245,158,11,0.35)"
  : protectedJourney
  ? "rgba(74,222,128,0.35)"
  : "rgba(255,255,255,0.10)",
        backgroundColor: covertMode
  ? "rgba(245,158,11,0.18)"
  : escalationActive
  ? "rgba(245,158,11,0.16)"
  : protectedJourney
  ? "rgba(22,163,74,0.16)"
  : "rgba(15,23,42,0.92)",
      }}
    >
      <Text style={{ color: protectedJourney ? "#4ADE80" : "#93C5FD", fontSize: 11, fontWeight: "900", letterSpacing: 1 }}>
        {covertMode
  ? "COVERT MODE ACTIVE"
  : escalationActive
  ? "ESCALATION MODE ACTIVE"
  : protectedJourney
  ? "PROTECTED JOURNEY ACTIVE"
  : "START PROTECTED JOURNEY"}
      </Text>

      <Text style={{ color: "#F8FAFC", marginTop: 6, fontSize: 13, fontWeight: "800" }}>
       {covertMode
  ? `Silent monitoring • Check in ${formatTime(journeyCheckTime)}`
  : protectedJourney
  ? `Next safety check in ${formatTime(journeyCheckTime)}`
  : "Tap to start • Long press for covert mode"}
      </Text>
    </TouchableOpacity>

    <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
      <TouchableOpacity onPress={onSOS} activeOpacity={0.86} style={{ flex: 1, height: 58, borderRadius: 20, backgroundColor: "rgba(127,29,29,0.58)", borderWidth: 1, borderColor: "rgba(248,113,113,0.35)", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#FCA5A5", fontSize: 20, fontWeight: "900" }}>SOS</Text>
        <Text style={{ color: "#FEE2E2", fontSize: 9, fontWeight: "800", marginTop: 3 }}>EMERGENCY</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onCall112} activeOpacity={0.86} style={{ flex: 1, height: 58, borderRadius: 20, backgroundColor: "rgba(37,99,235,0.28)", borderWidth: 1, borderColor: "rgba(96,165,250,0.35)", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#DBEAFE", fontSize: 18, fontWeight: "900" }}>CALL</Text>
        <Text style={{ color: "#93C5FD", fontSize: 10, fontWeight: "900", marginTop: 3 }}>112</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onOpenAI} activeOpacity={0.86} style={{ flex: 1, height: 58, borderRadius: 20, backgroundColor: "rgba(88,28,135,0.38)", borderWidth: 1, borderColor: "rgba(216,180,254,0.28)", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#E9D5FF", fontSize: 18, fontWeight: "900" }}>AI</Text>
        <Text style={{ color: "#D8B4FE", fontSize: 9, fontWeight: "900", marginTop: 3 }}>ASSIST</Text>
      </TouchableOpacity>
    </View>
<TouchableOpacity
  onPress={covertMode ? onDeactivateCovertMode : onActivateCovertMode}
  activeOpacity={0.86}
  style={{
    flex: 1,
    height: 58,
    borderRadius: 20,
    backgroundColor: covertMode
      ? "rgba(245,158,11,0.35)"
      : "rgba(15,23,42,0.72)",
    borderWidth: 1,
    borderColor: covertMode
      ? "rgba(245,158,11,0.55)"
      : "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <Text style={{ color: "#FCD34D", fontSize: 15, fontWeight: "900" }}>
    COV
  </Text>
  <Text style={{ color: "#FDE68A", fontSize: 9, fontWeight: "900", marginTop: 3 }}>
    MODE
  </Text>
</TouchableOpacity>
    {/*<TouchableOpacity
      onPress={onOpenVehicle}
      activeOpacity={0.88}
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 20,
        backgroundColor: "rgba(15,23,42,0.82)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text style={{ color: "#94A3B8", fontSize: 10, fontWeight: "900", letterSpacing: 1 }}>
          VEHICLE ID
        </Text>
        <Text style={{ color: "#F8FAFC", fontSize: 15, fontWeight: "900", marginTop: 4 }}>
          {vehicleNumber || "DL • Vehicle"}
        </Text>
      </View>

   <View style={{ alignItems: "flex-end" }}>
  <Text
    style={{
      color: "#93C5FD",
      fontSize: 12,
      fontWeight: "900",
    }}
  >
    DETAILS ›
  </Text>
*/}
  <TouchableOpacity
    onPress={onOpenTools}
    activeOpacity={0.8}
    style={{ marginTop: 8 }}
  >
    <Text
      style={{
        color: "#64748B",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 1,
      }}
    >
      TOOLS
    </Text>
  </TouchableOpacity>


  </Animated.View>
);
}
export default React.memo(SOSPanel);