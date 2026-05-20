import { BlurView } from "expo-blur";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
type PanelModalProps = {
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
  panelTheme: any;
};

export default function PanelModal({
  visible,
  children,
  onClose,
  panelTheme,
}: PanelModalProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInDown.springify()}
      exiting={SlideOutDown}
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 80,
        top: 120,
      }}
    >
      <BlurView
  intensity={80}
  tint="dark"
  style={{
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(2,6,23,0.92)",
    borderWidth: 1,
    borderColor: panelTheme.border,
  }}
>
  <TouchableOpacity
    onPress={onClose}
    style={{
      alignSelf: "flex-end",
      padding: 18,
      paddingBottom: 6,
    }}
  >
    <Text style={{ color: panelTheme.text, fontSize: 20, fontWeight: "900" }}>
      ✕
    </Text>
  </TouchableOpacity>

  <ScrollView
    style={{ flex: 1 }}
    nestedScrollEnabled
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{
      paddingHorizontal: 18,
      paddingBottom: 140,
    }}
  >
    {children}
  </ScrollView>
</BlurView>
</Animated.View>
  );
}