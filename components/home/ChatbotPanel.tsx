import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type ChatMessage = {
  role: "bot" | "user";
  text: string;
};

type ChatbotPanelProps = {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  chatLoading: boolean;
  panelTheme: any;
  theme: any;
  isNight: boolean;
};

function ChatbotPanel({
  messages,
  input,
  setInput,
  onSend,
  chatLoading,
  panelTheme,
  theme,
  isNight,
}: ChatbotPanelProps) {
  const inputStyle = {
    backgroundColor: theme.input,
    color: panelTheme.text,
    padding: 14,
    borderRadius: 18,
    marginTop: 10,
  };

  return (
    <>
      <Text style={{ color: panelTheme.text, fontSize: 24, fontWeight: "900" }}>
        ROADSoS AI Chatbot
      </Text>

      <Text style={{ color: panelTheme.sub, marginTop: 4 }}>
        Ask for accident, first-aid, safety, or location guidance.
      </Text>

      <View style={{ marginTop: 14 }}>
        {messages.map((item, index) => (
          <View
            key={`${item.role}-${index}`}
            style={{
              alignSelf: item.role === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                item.role === "user"
                  ? "#2563EB"
                  : isNight
                  ? "#0F172A"
                  : "#FFFFFF",
              padding: 12,
              borderRadius: 18,
              marginTop: 9,
              maxWidth: "88%",
              borderWidth: 1,
              borderColor: "rgba(119,18,137,0.08)",
            }}
          >
            <Text
              style={{
                color: item.role === "user" ? "white" : theme.text,
                lineHeight: 20,
              }}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </View>

      <TextInput
        placeholder="Type your emergency question..."
        placeholderTextColor={panelTheme.sub}
        value={input}
        onChangeText={setInput}
        style={inputStyle}
        multiline
      />

      <TouchableOpacity
        onPress={onSend}
        style={{
          backgroundColor: "#7C3AED",
          padding: 16,
          borderRadius: 18,
          marginTop: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "900" }}>
          {chatLoading ? "Thinking..." : "Send to AI"}
        </Text>
      </TouchableOpacity>
    </>
  );
}
export default React.memo(ChatbotPanel);