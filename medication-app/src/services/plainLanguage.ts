// Plain-language medication explanations from the raia AI agent.
//
// FUTURE BACKEND: the raia agent is run by another teammate, and its endpoint,
// request format and authentication are not decided yet. Nothing here calls
// it. When it is ready, write a class that implements PlainLanguageService and
// return it from getPlainLanguageService(). The Lookup screen already handles
// the unavailable, loading, error and ready states.

import { LabelSection } from '@/services/openFda';

export type PlainLanguageRequest = {
  setId: string;
  drugName: string;
  genericName?: string;
  // The FDA label text to simplify, so the explanation stays grounded in it.
  sections: LabelSection[];
};

export type PlainLanguageExplanation = {
  summary: string;
  keyPoints: { title: string; text: string }[];
  // ISO timestamp, shown so people know how current the explanation is.
  generatedAt: string;
  // The label the explanation was made from. The UI rejects a mismatch.
  basedOnSetId: string;
};

export interface PlainLanguageService {
  explain(request: PlainLanguageRequest, signal?: AbortSignal): Promise<PlainLanguageExplanation>;
}

// Returns null until the raia integration exists.
export function getPlainLanguageService(): PlainLanguageService | null {
  return null;
}
