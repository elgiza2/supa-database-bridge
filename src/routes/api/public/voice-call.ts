import { createFileRoute } from "@tanstack/react-router";

/** Native assistant: exchanges the phone's private voice key for a live Vapi audio connection. */
export const Route = createFileRoute("/api/public/voice-call")({ server: { handlers: { POST: async ({ request }) => {
  const auth = request.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const { startPhoneCall } = await import("@/lib/ceyo/voiceDevice.server");
  try {
    const call = await startPhoneCall(key);
    if (!call) return Response.json({ error: "sign-in" }, { status: 401 });
    return Response.json(call);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
} } } });
