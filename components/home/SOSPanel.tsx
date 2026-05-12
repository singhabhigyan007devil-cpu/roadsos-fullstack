import React from "react";
import { Pressable, Text, View } from "react-native";

type SOSPanelProps = {
  onSendSOS: () => void;
  onCall112: () => void;
};

export default function SOSPanel({ onSendSOS, onCall112 }: SOSPanelProps) {
  return (
    <View>
      <Text>SOS Emergency</Text>

      <Pressable onPress={onSendSOS}>
        <Text>Send SOS</Text>
      </Pressable>

      <Pressable onPress={onCall112}>
        <Text>Call 112</Text>
      </Pressable>
    </View>
  );
}