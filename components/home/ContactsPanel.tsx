import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type ContactsPanelProps = {
  visible: boolean;
  contacts: any[];
  newContact: string;
  setNewContact: (value: string) => void;
  onAddContact: () => void;
  onClose: () => void;
};

export default function ContactsPanel({
  visible,
  contacts,
  newContact,
  setNewContact,
  onAddContact,
  onClose,
}: ContactsPanelProps) {
  if (!visible) return null;

  return (
    <View>
      <Text>Emergency Contacts</Text>

      {contacts.map((contact, index) => (
        <Text key={index}>{contact.name || contact.phone || contact}</Text>
      ))}

      <TextInput
        value={newContact}
        onChangeText={setNewContact}
        placeholder="Add contact"
      />

      <Pressable onPress={onAddContact}>
        <Text>Add</Text>
      </Pressable>

      <Pressable onPress={onClose}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}