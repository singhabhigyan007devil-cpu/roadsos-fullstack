import { BlurView } from "expo-blur";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type RiskShieldProps = {
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  theme: any;
  onOpenRisk: () => void;
};

function RiskShield({
  riskScore,
  riskLevel,
  theme,
  onOpenRisk,
}: RiskShieldProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(300)}
      style={{
        position: "absolute",
        top: 180,
        left: 16,
        right: 16,
      }}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onOpenRisk}>
        <BlurView
          intensity={92}
          tint={theme.glass}
          style={{
            borderRadius: 22,
            padding: 13,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              color: theme.sub,
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            AI RISK SHIELD
          </Text>

          <Text
            style={{
              color:
                riskLevel === "HIGH"
                  ? "#DC2626"
                  : riskLevel === "MODERATE"
                  ? "#EA580C"
                  : "#059669",
              fontSize: 15,
              fontWeight: "900",
              marginTop: 4,
            }}
          >
            {riskLevel === "HIGH"
              ? "This area has elevated risk right now"
              : riskLevel === "MODERATE"
              ? "Moderate risk signals detected"
              : "Low risk around you"}
          </Text>

          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Score: {riskScore}/100 • Tap for details
          </Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}
export default React.memo(RiskShield);