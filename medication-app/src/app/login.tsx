// Log in. The form and checks are ready; signing in is not connected yet.
// FUTURE BACKEND: call Supabase auth in logIn() and reset in forgotPassword().
//
// Design refresh: labelled fields in the app's style, sentence-case labels,
// messages on the screen instead of pop-ups, and Create an account opens
// Sign up.

import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AuthIntro, AuthMessage, AuthMessageText, AuthSection, PrivacyNote, ShowPasswordToggle } from '@/components/auth/authParts';
import { FormField } from '@/components/formField';

export default function LogInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<AuthMessage>();

  const say = (next: AuthMessage) => {
    setMessage(next);
    AccessibilityInfo.announceForAccessibility(next.text);
  };

  const logIn = () => {
    if (!email.trim() || !password) {
      say({ kind: 'error', text: 'Enter your email address and password.' });
      return;
    }
    say({ kind: 'info', text: 'Logging in is not connected yet. Your medicines are saved on this phone.' });
  };

  const forgotPassword = () => {
    say({
      kind: 'info',
      text: email.trim()
        ? `Password reset is not connected yet. When it is, a link will go to ${email.trim()}.`
        : 'Enter your email address first, then tap Forgot password.',
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <View style={styles.column}>
        <AuthIntro />
        <AuthSection title="Welcome back">
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
            autoComplete="current-password"
            textContentType="password"
          />
          <ShowPasswordToggle shown={showPassword} onChange={setShowPassword} />
        </AuthSection>

        <AuthMessageText message={message} />
        <AccessibleButton label="Log in" variant="primary" onPress={logIn} />
        <AccessibleButton label="Forgot password?" onPress={forgotPassword} />
        <AccessibleButton
          label="New here? Create an account"
          onPress={() => router.replace('/signup')}
          accessibilityHint="Opens Sign up"
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
