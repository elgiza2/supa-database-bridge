/** Shared rules for phone voice keys (browser-safe). */
export const VOICE_KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;
export const VAPI_ASSISTANT_ID = "4c3c3384-2605-4953-a037-1c1c3f93642c";

/** The body sent to Vapi to open a raw-audio phone call for the native assistant. */
export function nativeCallBody(name: string, prompt: string) {
  const agentName = name.trim() || "Ceyo";
  return {
    assistantId: VAPI_ASSISTANT_ID,
    assistantOverrides: {
      variableValues: {
        agentName,
        agentPrompt: prompt.slice(0, 6000),
        reason: "The user opened the phone assistant with the power button or by calling its name.",
        greeting: "أيوه، أنا معاك. قول.",
      },
    },
    transport: { provider: "vapi.websocket", audioFormat: { format: "pcm_s16le", container: "raw", sampleRate: 16000 } },
  };
}
