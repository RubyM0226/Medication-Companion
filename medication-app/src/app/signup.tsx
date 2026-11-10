// Sign up. The form and checks are ready; creating an account is not
// connected yet. FUTURE BACKEND: call Supabase auth in register().
//
// Design refresh: labelled fields in the app's style, sentence-case labels,
// messages on the screen instead of pop-ups, and Log in opens Log in.

import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AuthIntro, AuthMessage, AuthMessageText, AuthSection, PrivacyNote, ShowPasswordToggle } from '@/components/auth/authParts';
import { FormField } from '@/components/formField';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<AuthMessage>();

  const say = (next: AuthMessage) => {
    setMessage(next);
    AccessibilityInfo.announceForAccessibility(next.text);
  };

  const register = () => {
    if (!email.trim() || !password || !confirmPassword) {
      say({ kind: 'error', text: 'Please fill out all fields.' });
      return;
    }
    if (password !== confirmPassword) {
      say({ kind: 'error', text: 'The passwords do not match. Type the same password in both fields.' });
      return;
    }
    say({ kind: 'info', text: 'Creating accounts is not connected yet. Your medicines are saved on this phone.' });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <View style={styles.column}>
        <AuthIntro />
        <AuthSection title="Get started">
          <FormField
            label="Email address"
            required
            value={email}
            onChangeText={setEmail}
            placeholder="jamie@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <FormField
            label="Password"
            required
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <FormField
            label="Confirm password"
            required
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <ShowPasswordToggle shown={showPassword} onChange={setShowPassword} />
        </AuthSection>

        <AuthMessageText message={message} />
        <AccessibleButton label="Create account" variant="primary" onPress={register} />
        <AccessibleButton
          label="Already have an account? Log in"
          onPress={() => router.replace('/login')}
          accessibilityHint="Opens Log in"
        />
        <PrivacyNote />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12 },
});
