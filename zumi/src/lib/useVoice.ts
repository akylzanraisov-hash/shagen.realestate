import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * Microphone capture with a live loudness level (0..1) for the Orb.
 */
export function useVoice() {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 80);
  const level = useSharedValue(0);
  const [denied, setDenied] = useState(false);
  const starting = useRef(false);

  useEffect(() => {
    if (!state.isRecording) {
      level.value = withTiming(0, { duration: 300 });
      return;
    }
    const db = state.metering ?? -60;
    const norm = Math.max(0, Math.min(1, (db + 50) / 45));
    level.value = withTiming(norm, { duration: 90 });
  }, [state.metering, state.isRecording, level]);

  const start = async () => {
    if (starting.current || state.isRecording) return false;
    starting.current = true;
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setDenied(true);
        return false;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      return true;
    } finally {
      starting.current = false;
    }
  };

  /** Stops and returns the local file uri (m4a / webm). */
  const stop = async (): Promise<string | null> => {
    if (!recorder.isRecording) return null;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    return recorder.uri;
  };

  return { start, stop, level, metering: state.metering, isRecording: state.isRecording, durationMs: state.durationMillis, denied };
}
