import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type ChatbotPanelProps = {
  visible: boolean;
  messages: any[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
};

export default function ChatbotPanel({
  visible,
  messages,
  input,
  setInput,
  onSend,
  onClose,
}: ChatbotPanelProps) {
  if (!visible) return null;

  return (
    <View>
      <Text>ROADSoS AI</Text>

      {messages.map((msg, index) => (
        <Text key={index}>{msg.text}</Text>
      ))}

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Ask emergency assistant..."
      />

      <Pressable onPress={onSend}>
        <Text>Send</Text>
      </Pressable>

      <Pressable onPress={onClose}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}