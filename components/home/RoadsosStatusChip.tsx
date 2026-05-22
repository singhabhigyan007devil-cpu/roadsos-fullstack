import React from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

type SafetyState = 'idle' | 'protected' | 'escalation' | 'sos';

export default function RoadsosStatusChip({
  state,
  riskLevel,
  isNight,
}: {
  state: SafetyState;
  riskLevel: string;
  isNight: boolean;
}) {
  const config = {
    idle: {
      dot: '#38BDF8',
      title: 'ROADSoS Ready',
      sub: 'AI safety layer online',
    },
    protected: {
      dot: '#22C55E',
      title: 'Protected Journey Active',
      sub: 'Route and movement monitored',
    },
    escalation: {
      dot: '#F59E0B',
      title: 'Elevated Risk Detected',
      sub: 'Escalation layer standing by',
    },
    sos: {
      dot: '#EF4444',
      title: 'SOS Emergency Live',
      sub: 'Emergency response active',
    },
  }[state];

  return (
    <Animated.View
      
      style={{
        position: 'absolute',
        top: 58,
        left: 18,
        right: 18,
        zIndex: 3000,
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      <View
        style={{
          maxWidth: 330,
          paddingHorizontal: 16,
          paddingVertical: 11,
          borderRadius: 999,
          backgroundColor: isNight
            ? 'rgba(2,6,23,0.72)'
            : 'rgba(15,23,42,0.68)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.16)',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            backgroundColor: config.dot,
            marginRight: 10,
          }}
        />

        <View>
          <Text
            style={{
              color: '#F8FAFC',
              fontSize: 13,
              fontWeight: '900',
              letterSpacing: 0.3,
            }}
          >
            {config.title}
          </Text>

          <Text
            style={{
              color: '#CBD5E1',
              fontSize: 10,
              fontWeight: '700',
              marginTop: 2,
            }}
          >
            {config.sub} · Risk {riskLevel}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}