import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type RiskFullPanelProps = {
  panelTheme: any;
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  riskReasons: string[];
  lastForce: number;
  savedContacts: string[];
  ghostMode: boolean;
  handleSOS: () => void;
};

export default function RiskFullPanel({
  panelTheme,
  riskScore,
  riskLevel,
  riskReasons,
  lastForce,
  savedContacts,
  ghostMode,
  handleSOS,
}: RiskFullPanelProps) {
  return (
    <>
      <Text style={{ color: panelTheme.text, fontSize: 24, fontWeight: "900" }}>
        Predictive Danger Score 🚨
      </Text>

      <Text style={{ color: panelTheme.sub, marginTop: 4 }}>
        ROADSoS estimates nearby safety risk using time, location, movement, and emergency readiness.
      </Text>

      <View
        style={{
          backgroundColor:
            riskLevel === "HIGH"
              ? "#7F1D1D"
              : riskLevel === "MODERATE"
              ? "#7C2D12"
              : "#064E3B",
          padding: 22,
          borderRadius: 24,
          marginTop: 18,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 44, fontWeight: "900" }}>
          {riskScore}
        </Text>

        <Text style={{ color: "white", fontSize: 20, fontWeight: "900", marginTop: 4 }}>
          {riskLevel} RISK
        </Text>

        <Text style={{ color: "#FEE2E2", textAlign: "center", marginTop: 10, lineHeight: 21 }}>
          {riskLevel === "HIGH"
            ? "This area has elevated risk right now. Avoid stopping here and share your location."
            : riskLevel === "MODERATE"
            ? "Be alert. Some risk signals are active around you."
            : "Current risk appears low, but stay aware of surroundings."}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: panelTheme.chip,
          padding: 16,
          borderRadius: 20,
          marginTop: 14,
        }}
      >
        <Text style={{ color: panelTheme.text, fontWeight: "900", fontSize: 18 }}>
          Live Safety Signals
        </Text>

        <Text style={{ color: panelTheme.sub, marginTop: 8, lineHeight: 22 }}>
          • Movement force: {lastForce.toFixed(2)}
        </Text>

        <Text style={{ color: panelTheme.sub, marginTop: 4, lineHeight: 22 }}>
          • Emergency contacts: {savedContacts.length}
        </Text>

        <Text style={{ color: panelTheme.sub, marginTop: 4, lineHeight: 22 }}>
          • Ghost Mode: {ghostMode ? "Active" : "Off"}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: panelTheme.chip,
          padding: 16,
          borderRadius: 20,
          marginTop: 14,
        }}
      >
        <Text style={{ color: panelTheme.text, fontWeight: "900", fontSize: 18 }}>
          Why this score?
        </Text>

        {riskReasons.length === 0 ? (
          <Text style={{ color: panelTheme.sub, marginTop: 8 }}>
            No major risk signals detected.
          </Text>
        ) : (
          riskReasons.map((reason) => (
            <Text
              key={reason}
              style={{ color: panelTheme.sub, marginTop: 8, lineHeight: 22 }}
            >
              • {reason}
            </Text>
          ))
        )}
      </View>

      <TouchableOpacity
        onPress={handleSOS}
        style={{
          backgroundColor: "#DC2626",
          padding: 16,
          borderRadius: 18,
          marginTop: 16,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "900" }}>
          Send SOS Now
        </Text>
      </TouchableOpacity>
    </>
  );
}