import React from "react";
import { Linking, Text, TextInput, TouchableOpacity, View } from "react-native";

type CountryCode = {
  name: string;
  code: string;
  flag: string;
};

type ContactsPanelProps = {
  panelTheme: any;
  inputStyle: any;
  countryCodes: CountryCode[];
  selectedCountry: CountryCode;
  showCountryDropdown: boolean;
  emergencyContact: string;
  savedContacts: string[];
  setSelectedCountry: (country: CountryCode) => void;
  setShowCountryDropdown: (value: boolean | ((prev: boolean) => boolean)) => void;
  setEmergencyContact: (value: string) => void;
  saveEmergencyContact: () => void;
  deleteEmergencyContact: (contact: string) => void;
};

function ContactsPanel({
  panelTheme,
  inputStyle,
  countryCodes,
  selectedCountry,
  showCountryDropdown,
  emergencyContact,
  savedContacts,
  setSelectedCountry,
  setShowCountryDropdown,
  setEmergencyContact,
  saveEmergencyContact,
  deleteEmergencyContact,
}: ContactsPanelProps) {
  return (
    <>
      <Text style={{ color: panelTheme.text, fontSize: 24, fontWeight: "900" }}>
        Emergency Contacts
      </Text>

      <Text style={{ color: panelTheme.sub, marginTop: 4 }}>
        Add trusted SOS contacts for emergency messages and calls.
      </Text>

      <TouchableOpacity
        onPress={() => setShowCountryDropdown((prev) => !prev)}
        activeOpacity={0.86}
        style={{
          backgroundColor: panelTheme.chip,
          padding: 14,
          borderRadius: 18,
          marginTop: 14,
          borderWidth: 1,
          borderColor: panelTheme.border,
        }}
      >
        <Text style={{ color: panelTheme.text, fontWeight: "900" }}>
          {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.code})
        </Text>

        <Text style={{ color: panelTheme.sub, marginTop: 4 }}>
          Tap to change country code
        </Text>
      </TouchableOpacity>

      {showCountryDropdown && (
        <View
          style={{
            backgroundColor: "#020617",
            borderRadius: 18,
            marginTop: 10,
            padding: 8,
            borderWidth: 1,
            borderColor: panelTheme.border,
          }}
        >
          {countryCodes.map((country) => (
            <TouchableOpacity
              key={`${country.name}-${country.code}`}
              onPress={() => {
                setSelectedCountry(country);
                setShowCountryDropdown(false);
              }}
              style={{
                padding: 12,
                borderRadius: 14,
                backgroundColor:
                  selectedCountry.name === country.name
                    ? "#2563EB"
                    : "transparent",
              }}
            >
              <Text style={{ color: "white", fontWeight: "800" }}>
                {country.flag} {country.name} ({country.code})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TextInput
        placeholder="Enter phone number without country code"
        placeholderTextColor={panelTheme.sub}
        value={emergencyContact}
        onChangeText={setEmergencyContact}
        keyboardType="phone-pad"
        style={inputStyle}
      />

      <TouchableOpacity
        onPress={saveEmergencyContact}
        style={{
          backgroundColor: "#059669",
          padding: 16,
          borderRadius: 18,
          marginTop: 14,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "900" }}>
          Add Contact
        </Text>
      </TouchableOpacity>

      {savedContacts.length === 0 && (
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            padding: 16,
            borderRadius: 18,
            marginTop: 14,
          }}
        >
          <Text style={{ color: "#CBD5E1", textAlign: "center" }}>
            No emergency contacts added yet.
          </Text>
        </View>
      )}

      {savedContacts.map((contact) => (
        <View
          key={contact}
          style={{
            backgroundColor: panelTheme.chip,
            padding: 14,
            borderRadius: 18,
            marginTop: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: panelTheme.text,
              fontWeight: "700",
              flex: 1,
            }}
          >
            {contact}
          </Text>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${contact}`)}
              style={{ marginRight: 16 }}
            >
              <Text style={{ color: "#38BDF8", fontWeight: "900" }}>
                CALL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteEmergencyContact(contact)}>
              <Text style={{ color: "#EF4444", fontWeight: "900" }}>
                DELETE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </>
  );
}
export default React.memo(ContactsPanel);