// Search state for the Lookup screen: one request at a time, with recent
// searches saved on the device.

import { useEffect, useRef, useState } from 'react';

import { DrugLabelSummary, DrugLookupError, searchDrugLabels } from '@/services/openFda';
import { addRecentSearch, clearRecentSearches, loadRecentSearches } from '@/services/recentSearches';

export const MIN_QUERY_LENGTH = 2;

export type DrugSearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'results'; query: string; results: DrugLabelSummary[]; total: number }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: DrugLookupError };

export function useDrugSearch() {
  const [state, setState] = useState<DrugSearchState>({ status: 'idle' });
  const [recent, setRecent] = useState<string[]>([]);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    loadRecentSearches().then(setRecent);
    return () => controller.current?.abort();
  }, []);

  const search = async (rawQuery: string) => {
    const query = rawQuery.trim();
    if (query.length < MIN_QUERY_LENGTH) return;

    // A newer search replaces any one still running.
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState({ status: 'loading', query });

    try {
      const { results, total } = await searchDrugLabels(query, current.signal);
      if (current.signal.aborted) return;
      if (results.length === 0) {
        setState({ status: 'empty', query });
        return;
      }
      setState({ status: 'results', query, results, total });
      setRecent(await addRecentSearch(query));
    } catch (error) {
      if (current.signal.aborted) return;
      setState({
        status: 'error',
        query,
        error:
          error instanceof DrugLookupError
            ? error
            : new DrugLookupError('server', 'Something went wrong. Please try again.'),
      });
    }
  };

  const reset = () => {
    controller.current?.abort();
    setState({ status: 'idle' });
  };

  const clearRecent = () => {
    clearRecentSearches();
    setRecent([]);
  };

  return { state, recent, search, reset, clearRecent };
}
