package si.ceyo.app.assistant;

import android.content.Intent;
import android.os.Bundle;
import android.service.voice.VoiceInteractionSession;
import android.service.voice.VoiceInteractionSessionService;

public class CeyoVoiceSessionService extends VoiceInteractionSessionService {
    @Override public VoiceInteractionSession onNewSession(Bundle args) {
        return new VoiceInteractionSession(this) {
            @Override public void onShow(Bundle a, int flags) {
                super.onShow(a, flags);
                // Power/home long-press opens a live Vapi voice call with the main bot.
                startAssistantActivity(CeyoIntents.openIntent(getContext(), "/?ceyoCall=1"));
                hide();
            }
        };
    }
}
