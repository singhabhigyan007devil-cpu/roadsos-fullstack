import { BlurView } from "expo-blur";
import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
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
        intensity={9000}
        tint="dark"
        style={{
          borderRadius: 30,
          padding: 18,
          overflow: "hidden",
          backgroundColor: "rgb(28, 70, 153)",
          borderWidth: 1,
          borderColor: panelTheme.border,
        }}
      >
        <TouchableOpacity onPress={onClose} style={{ alignSelf: "flex-end" }}>
          <Text
            style={{
              color: panelTheme.text,
              fontSize: 20,
              fontWeight: "900",
            }}
          >
            ✕
          </Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {children}
        </ScrollView>
      </BlurView>
    </Animated.View>
  );
}