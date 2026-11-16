import { nativeCallBody, VOICE_KEY_PATTERN } from "./voiceDevice";

async function sha256(text: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Issues a new private key for this phone; only its hash is stored. */
export async function issueVoiceKey(userId: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const key = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("native_voice_devices" as never).insert({ user_id: userId, secret_hash: await sha256(key) } as never);
  if (error) throw new Error("Could not prepare voice on this phone");
  return key;
}

/** Opens a Vapi raw-audio call for the phone that owns this key. */
export async function startPhoneCall(key: string): Promise<{ url: string; name: string } | null> {
  if (!VOICE_KEY_PATTERN.test(key)) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { from: (t: string) => any };
  const { data: device } = await db.from("native_voice_devices").select("id,user_id").eq("secret_hash", await sha256(key)).maybeSingle();
  if (!device) return null;
  await db.from("native_voice_devices").update({ last_used_at: new Date().toISOString() }).eq("id", device.id);
  const { data: profile } = await db.from("profiles").select("primary_bot_id,display_name").eq("id", device.user_id).maybeSingle();
  let name = "Ceyo", prompt = "";
  if (profile?.primary_bot_id) {
    const { data: bot } = await db.from("bots").select("name,instructions,description").eq("id", profile.primary_bot_id).eq("owner_id", device.user_id).maybeSingle();
    if (bot) { name = bot.name || name; prompt = [bot.description, bot.instructions].filter(Boolean).join("\n"); }
  }
  if (profile?.display_name) prompt = `The user's name is ${profile.display_name}.\n${prompt}`;
  const secret = process.env.VAPI_PRIVATE_KEY;
  if (!secret) throw new Error("Voice service is not configured");
  const res = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(nativeCallBody(name, prompt)),
  });
  const body = (await res.json().catch(() => null)) as { transport?: { websocketCallUrl?: string }; message?: unknown } | null;
  const url = body?.transport?.websocketCallUrl;
  if (!res.ok || !url) throw new Error("Voice service refused the call");
  return { url, name };
}
