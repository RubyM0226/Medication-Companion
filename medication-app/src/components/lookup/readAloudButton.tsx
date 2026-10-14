// Starts or stops reading a passage with text-to-speech.

import { AccessibleButton } from '@/components/accessibleButton';

export function ReadAloudButton({
  speaking,
  onPress,
  subject,
}: {
  speaking: boolean;
  onPress: () => void;
  // What will be read, for the screen reader label ("Read Warnings aloud").
  subject: string;
}) {
  return (
    <AccessibleButton
      label={speaking ? 'Stop reading' : 'Read aloud'}
      icon={speaking ? '■' : '🔊'}
      onPress={onPress}
      accessibilityLabel={speaking ? `Stop reading ${subject}` : `Read ${subject} aloud`}
      style={{ alignSelf: 'flex-start' }}
    />
  );
}
