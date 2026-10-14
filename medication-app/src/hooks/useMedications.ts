// The saved medication list, reloaded whenever the screen comes into view so
// changes made on another screen show up.

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { localMedications, Medication } from '@/services/medicationStore';

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      localMedications.list().then((list) => {
        if (!active) return;
        setMedications(list);
        setLoaded(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const remove = async (id: string) => {
    await localMedications.remove(id);
    setMedications((current) => current.filter((medication) => medication.id !== id));
  };

  return { medications, loaded, remove };
}
