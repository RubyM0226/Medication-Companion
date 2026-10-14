// Text-to-speech for on-screen content. Only one passage plays at a time, and
// speech stops when the screen loses focus or unmounts.

import * as Speech from 'expo-speech';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

// Android rejects text longer than maxSpeechInputLength, so long label
// sections are split at sentence ends and queued.
function splitForSpeech(text: string) {
  const limit = Math.min(Speech.maxSpeechInputLength || 4000, 4000) - 1;
  const sentences = text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let chunk = '';
  for (const sentence of sentences) {
    if (chunk.length + sentence.length > limit && chunk) {
      chunks.push(chunk);
      chunk = '';
    }
    // A single sentence longer than the limit is cut at the limit.
    for (let i = 0; i < sentence.length; i += limit) {
      const piece = sentence.slice(i, i + limit);
      if (chunk.length + piece.length > limit) {
        chunks.push(chunk);
        chunk = '';
      }
      chunk += piece;
    }
  }
  if (chunk.trim()) chunks.push(chunk);
  return chunks;
}

export function useReadAloud() {
  // Which passage is playing, so only its button shows "Stop".
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const activeId = useRef<string | null>(null);

  const stop = useCallback(() => {
    activeId.current = null;
    setSpeakingId(null);
    Speech.stop();
  }, []);

  useFocusEffect(useCallback(() => stop, [stop]));

  const toggle = async (id: string, text: string) => {
    if (activeId.current === id) {
      stop();
      return;
    }
    await Speech.stop();
    activeId.current = id;
    setSpeakingId(id);

    const finish = () => {
      if (activeId.current !== id) return;
      activeId.current = null;
      setSpeakingId(null);
    };
    const chunks = splitForSpeech(text);
    chunks.forEach((chunk, index) => {
      const last = index === chunks.length - 1;
      Speech.speak(chunk, {
        rate: 0.9,
        onDone: last ? finish : undefined,
        onStopped: finish,
        onError: finish,
      });
    });
  };

  return { speakingId, toggle, stop };
}
