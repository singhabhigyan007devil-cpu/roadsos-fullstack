import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type MedicalVaultProps = {
  visible: boolean;
  medicalInfo: any;
  setMedicalInfo: (value: any) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function MedicalVault({
  visible,
  medicalInfo,
  setMedicalInfo,
  onSave,
  onClose,
}: MedicalVaultProps) {
  if (!visible) return null;

  return (
    <View>
      <Text>Medical Vault</Text>

      <TextInput
        value={medicalInfo?.bloodType || ""}
        onChangeText={(text) =>
          setMedicalInfo({ ...medicalInfo, bloodType: text })
        }
        placeholder="Blood Type"
      />

      <TextInput
        value={medicalInfo?.allergies || ""}
        onChangeText={(text) =>
          setMedicalInfo({ ...medicalInfo, allergies: text })
        }
        placeholder="Allergies"
      />

      <Pressable onPress={onSave}>
        <Text>Save</Text>
      </Pressable>

      <Pressable onPress={onClose}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}