import { describe, expect, it } from "vitest";
import { nativeCallBody, VOICE_KEY_PATTERN } from "./voiceDevice";

describe("phone voice call", () => {
  it("asks Vapi for raw 16 kHz audio the phone can play directly", () => {
    const b = nativeCallBody("Sio", "be kind");
    expect(b.transport).toEqual({ provider: "vapi.websocket", audioFormat: { format: "pcm_s16le", container: "raw", sampleRate: 16000 } });
    expect(b.assistantOverrides.variableValues.agentName).toBe("Sio");
  });
  it("falls back to Ceyo when the bot has no name", () => {
    expect(nativeCallBody("  ", "").assistantOverrides.variableValues.agentName).toBe("Ceyo");
  });
  it("accepts only 43-character phone keys", () => {
    expect(VOICE_KEY_PATTERN.test("a".repeat(43))).toBe(true);
    expect(VOICE_KEY_PATTERN.test("a".repeat(42))).toBe(false);
    expect(VOICE_KEY_PATTERN.test("a".repeat(42) + "/")).toBe(false);
  });
});
