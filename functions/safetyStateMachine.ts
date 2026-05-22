export type SafetyState =
  | "IDLE"
  | "PROTECTED_JOURNEY"
  | "COVERT"
  | "ESCALATION"
  | "SOS";

export type EscalationReason =
  | "ROUTE_DEVIATION"
  | "MOTION_SILENCE"
  | "MISSED_CHECKIN"
  | "ACCIDENT_DETECTED"
  | "MANUAL_TRIGGER"
  | "COVERT_TRIGGER";

export type SafetyEvent =
  | { type: "START_JOURNEY" }
  | { type: "ENTER_COVERT" }
  | { type: "EXIT_COVERT" }
  | { type: "RISK_DETECTED"; reason: EscalationReason }
  | { type: "USER_CONFIRMED_SAFE" }
  | { type: "SOS_TRIGGERED"; reason: EscalationReason }
  | { type: "END_JOURNEY" };

export type SafetyContext = {
  state: SafetyState;
  reasons: EscalationReason[];
  lastTransitionAt: number;
  aiMessage: string;
};

export function createInitialSafetyContext(): SafetyContext {
  return {
    state: "IDLE",
    reasons: [],
    lastTransitionAt: Date.now(),
    aiMessage: "ROADSoS standing by.",
  };
}

export function transitionSafetyState(
  context: SafetyContext,
  event: SafetyEvent
): SafetyContext {
  const now = Date.now();

  switch (event.type) {
    case "START_JOURNEY":
      return {
        state: "PROTECTED_JOURNEY",
        reasons: [],
        lastTransitionAt: now,
        aiMessage: "Protected journey active. Monitoring quietly.",
      };

    case "ENTER_COVERT":
      return {
        ...context,
        state: "COVERT",
        lastTransitionAt: now,
        aiMessage: "Covert protection active.",
      };

    case "RISK_DETECTED":
      if (context.state === "SOS") return context;

      return {
        state: "ESCALATION",
        reasons: Array.from(new Set([...context.reasons, event.reason])),
        lastTransitionAt: now,
        aiMessage: getEscalationMessage(event.reason),
      };

    case "USER_CONFIRMED_SAFE":
      return {
        state: "PROTECTED_JOURNEY",
        reasons: [],
        lastTransitionAt: now,
        aiMessage: "Safety confirmed. Protection continues.",
      };

    case "SOS_TRIGGERED":
      return {
        state: "SOS",
        reasons: Array.from(new Set([...context.reasons, event.reason])),
        lastTransitionAt: now,
        aiMessage: "SOS active. Emergency timeline recording.",
      };

    case "EXIT_COVERT":
      return {
        ...context,
        state: "PROTECTED_JOURNEY",
        lastTransitionAt: now,
        aiMessage: "Protected journey restored.",
      };

    case "END_JOURNEY":
      return createInitialSafetyContext();

    default:
      return context;
  }
}

function getEscalationMessage(reason: EscalationReason): string {
  switch (reason) {
    case "ROUTE_DEVIATION":
      return "Route drift detected. Monitoring silently.";
    case "MOTION_SILENCE":
      return "Unexpected stillness detected.";
    case "MISSED_CHECKIN":
      return "Check-in missed. Escalation timer armed.";
    case "ACCIDENT_DETECTED":
      return "Impact pattern detected. Preparing SOS.";
    case "COVERT_TRIGGER":
      return "Silent protection signal received.";
    case "MANUAL_TRIGGER":
      return "Emergency trigger received.";
    default:
      return "Risk signal detected.";
  }
}