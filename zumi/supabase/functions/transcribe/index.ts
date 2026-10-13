// Speech-to-text for dictation, shared voice notes and call/meeting recordings.
import { HttpError, json, requireUser, serve } from '../_shared/http.ts';
import { decodeBase64, speechToText } from '../_shared/voice.ts';

serve(async (req, body: { audio?: string; path?: string; mime?: string; speakers?: boolean }) => {
  const { user, sb } = await requireUser(req);
  let bytes: Uint8Array;
  if (body.path) {
    // long recordings are uploaded to Storage first: <user_id>/<file>
    if (!body.path.startsWith(`${user.id}/`)) throw new HttpError(403, 'foreign file');
    const { data, error } = await sb.storage.from('audio').download(body.path);
    if (error || !data) throw new HttpError(404, 'audio not found');
    bytes = new Uint8Array(await data.arrayBuffer());
    await sb.storage.from('audio').remove([body.path]); // don't keep raw audio around
  } else if (body.audio) {
    bytes = decodeBase64(body.audio);
  } else {
    throw new HttpError(400, 'no audio');
  }
  const text = await speechToText(bytes, body.mime ?? 'audio/mp4', !!body.speakers);
  return json({ text });
});
