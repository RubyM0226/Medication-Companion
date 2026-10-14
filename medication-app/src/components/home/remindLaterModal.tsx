// Schedules a one-time "remind me later" notification. Says plainly if
// notifications are off or unavailable instead of pretending it worked.

import { useState } from 'react';
import { Text } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AppModal } from '@/components/appModal';
import { useSettings } from '@/context/settingsContext';
import { remindLater } from '@/services/reminders';

const OPTIONS = [
  { minutes: 10, label: 'In 10 minutes' },
  { minutes: 30, label: 'In 30 minutes' },
  { minutes: 60, label: 'In 1 hour' },
];

export function RemindLaterModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, fontScale: scale } = useSettings();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  const close = () => {
    setMessage(undefined);
    onClose();
  };

  const choose = async (minutes: number) => {
    setBusy(true);
    const result = await remindLater(minutes);
    setBusy(false);
    if (result.scheduled) {
      const at = result.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setMessage(`Reminder set for ${at}. It will not show the medicine name. This dose is still pending until you log it.`);
    } else if (result.reason === 'denied') {
      setMessage('Notifications are turned off for this app. You can turn them on in your phone’s Settings.');
    } else if (result.reason === 'unsupported') {
      setMessage('Reminders are not available on this device.');
    } else {
      setMessage('The reminder could not be set. Please try again.');
    }
  };

  const text = { color: colors.textPrimary, fontSize: 17 * scale, lineHeight: 25 * scale };

  return (
    <AppModal visible={visible} title="Remind me later" onClose={close}>
      {message ? (
        <>
          <Text style={text} accessibilityLiveRegion="polite">
            ⓘ {message}
          </Text>
          <AccessibleButton label="Done" variant="primary" onPress={close} />
        </>
      ) : (
        <>
          <Text style={text}>When should we remind you?</Text>
          {OPTIONS.map((option) => (
            <AccessibleButton
              key={option.minutes}
              label={option.label}
              icon="⏰"
              onPress={() => choose(option.minutes)}
              disabled={busy}
            />
          ))}
          <AccessibleButton label="Cancel" onPress={close} disabled={busy} />
        </>
      )}
    </AppModal>
  );
}
