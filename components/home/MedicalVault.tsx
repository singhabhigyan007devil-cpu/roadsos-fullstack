import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type MedicalVaultProps = {
  inputStyle: any;
  bloodType: string;
  allergies: string;
  medications: string;
  medicalConditions: string;
  primaryContactName: string;
  primaryContactPhone: string;
  setBloodType: (value: string) => void;
  setAllergies: (value: string) => void;
  setMedications: (value: string) => void;
  setMedicalConditions: (value: string) => void;
  setPrimaryContactName: (value: string) => void;
  setPrimaryContactPhone: (value: string) => void;
  saveMedicalVault: () => void;
};

function MedicalVault({
  inputStyle,
  bloodType,
  allergies,
  medications,
  medicalConditions,
  primaryContactName,
  primaryContactPhone,
  setBloodType,
  setAllergies,
  setMedications,
  setMedicalConditions,
  setPrimaryContactName,
  setPrimaryContactPhone,
  saveMedicalVault,
}: MedicalVaultProps) {
  return (
    <>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "900" }}>
        Medical Vault ❤️
      </Text>

      <Text style={{ color: "#CBD5E1", marginTop: 4 }}>
        Stored locally for responders during SOS.
      </Text>

      <View
        style={{
          backgroundColor: "rgba(15,23,42,0.96)",
          padding: 16,
          borderRadius: 22,
          marginTop: 18,
        }}
      >
        <TextInput
          placeholder="Blood Type e.g. O+"
          placeholderTextColor="#94A3B8"
          value={bloodType}
          onChangeText={setBloodType}
          style={[
            inputStyle,
            { backgroundColor: "#111827", color: "white" },
          ]}
        />

        <TextInput
          placeholder="Allergies"
          placeholderTextColor="#94A3B8"
          value={allergies}
          onChangeText={setAllergies}
          style={[
            inputStyle,
            { backgroundColor: "#111827", color: "white" },
          ]}
        />

        <TextInput
          placeholder="Current medications"
          placeholderTextColor="#94A3B8"
          value={medications}
          onChangeText={setMedications}
          multiline
          style={[
            inputStyle,
            {
              minHeight: 72,
              backgroundColor: "#111827",
              color: "white",
            },
          ]}
        />

        <TextInput
          placeholder="Medical conditions e.g. Diabetes, Asthma"
          placeholderTextColor="#94A3B8"
          value={medicalConditions}
          onChangeText={setMedicalConditions}
          multiline
          style={[
            inputStyle,
            {
              minHeight: 72,
              backgroundColor: "#111827",
              color: "white",
            },
          ]}
        />

        <TextInput
          placeholder="Primary contact name"
          placeholderTextColor="#94A3B8"
          value={primaryContactName}
          onChangeText={setPrimaryContactName}
          style={[
            inputStyle,
            { backgroundColor: "#111827", color: "white" },
          ]}
        />

        <TextInput
          placeholder="Primary contact phone"
          placeholderTextColor="#94A3B8"
          value={primaryContactPhone}
          onChangeText={setPrimaryContactPhone}
          keyboardType="phone-pad"
          style={[
            inputStyle,
            { backgroundColor: "#111827", color: "white" },
          ]}
        />

        <TouchableOpacity
          onPress={saveMedicalVault}
          style={{
            backgroundColor: "#DC2626",
            padding: 16,
            borderRadius: 18,
            marginTop: 14,
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "900" }}>
            Save Medical Vault
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
export default React.memo(MedicalVault);