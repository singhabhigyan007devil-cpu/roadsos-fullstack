import { BlurView } from "expo-blur";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type RiskShieldProps = {
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  theme: any;
  onOpenRisk: () => void;
  ghostMode: boolean;
};

function RiskShield({
  riskScore,
  riskLevel,
  theme,
  onOpenRisk,
  ghostMode,
}: RiskShieldProps) {
  const riskColor =
    riskLevel === "HIGH"
      ? "#DC2626"
      : riskLevel === "MODERATE"
      ? "#D97706"
      : "#16A34A";

  const riskLabel =
    riskLevel === "HIGH"
      ? "HIGH RISK"
      : riskLevel === "MODERATE"
      ? "MODERATE RISK"
      : "LOW RISK";

  const statusText =
    riskLevel === "HIGH"
      ? "Immediate attention recommended"
      : riskLevel === "MODERATE"
      ? "Maintain situational awareness"
      : "Safety infrastructure detected";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onOpenRisk}
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 168,
      }}
    >
      <BlurView
        intensity={88}
        tint="dark"
        style={{
          borderRadius: 28,
          overflow: "hidden",
          padding: 18,
          backgroundColor: "rgba(2,6,23,0.72)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.10)",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 11,
                fontWeight: "900",
                letterSpacing: 1.2,
              }}
            >
              AI RISK SHIELD
            </Text>

            <Text
              style={{
                color: "#F8FAFC",
                marginTop: 6,
                fontSize: 24,
                fontWeight: "900",
                letterSpacing: 0.5,
              }}
            >
              {riskLabel}
            </Text>

            <Text
              style={{
                color: "#CBD5E1",
                marginTop: 4,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {statusText}
            </Text>
            {ghostMode && (
  <View
    style={{
      marginTop: 10,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "rgba(220,38,38,0.16)",
      borderWidth: 1,
      borderColor: "rgba(220,38,38,0.35)",
    }}
  >
    <Text
      style={{
        color: "#FCA5A5",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1,
      }}
    >
      COVERT SAFETY
    </Text>
  </View>
)}
          </View>

          <View
            style={{
              width: 74,
              height: 74,
              borderRadius: 999,
              borderWidth: 7,
              borderColor: riskColor,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(15,23,42,0.82)",
            }}
          >
            <Text
              style={{
                color: "#F8FAFC",
                fontSize: 22,
                fontWeight: "900",
              }}
            >
              {riskScore}
            </Text>

            <Text
              style={{
                color: "#94A3B8",
                fontSize: 9,
                fontWeight: "900",
                marginTop: -2,
              }}
            >
              /100
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 16,
            height: 8,
            borderRadius: 999,
            backgroundColor: "rgba(148,163,184,0.22)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${riskScore}%`,
              height: "100%",
              borderRadius: 999,
              backgroundColor: riskColor,
            }}
          />
        </View>

        <View
          style={{
            marginTop: 14,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            TAP FOR DIAGNOSTICS
          </Text>

          <Text
            style={{
              color: riskColor,
              fontSize: 11,
              fontWeight: "900",
              letterSpacing: 0.8,
            }}
          >
            LIVE
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

export default React.memo(RiskShield);