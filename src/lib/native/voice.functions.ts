import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/** Gives this phone its own key so the power-button assistant can talk without opening the app. */
export const registerVoiceDevice = createServerFn({ method: "POST" }).handler(async () => {
  const { authenticate } = await import("@/lib/ceyo/auth.server");
  const { userId } = await authenticate(getRequest());
  const { issueVoiceKey } = await import("@/lib/ceyo/voiceDevice.server");
  return { key: await issueVoiceKey(userId) };
});
