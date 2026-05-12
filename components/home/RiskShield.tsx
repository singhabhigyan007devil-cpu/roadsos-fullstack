import React from "react";
import { Text, View } from "react-native";

type RiskShieldProps = {
  score: number;
  level: string;
  reasons: string[];
};

export default function RiskShield({ score, level, reasons }: RiskShieldProps) {
  return (
    <View>
      <Text>AI Risk Shield</Text>
      <Text>{score}/100</Text>
      <Text>{level}</Text>

      {reasons.map((reason, index) => (
        <Text key={index}>• {reason}</Text>
      ))}
    </View>
  );
}