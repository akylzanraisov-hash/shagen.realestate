// Zumi's voice (ElevenLabs) → base64 mp3.
import { HttpError, json, requireUser, serve } from '../_shared/http.ts';
import { encodeBase64, textToSpeech } from '../_shared/voice.ts';

serve(async (req, body: { text: string }) => {
  await requireUser(req);
  const text = body.text?.trim();
  if (!text) throw new HttpError(400, 'no text');
  const audio = await textToSpeech(text.slice(0, 900));
  return json({ audio: encodeBase64(audio) });
});
