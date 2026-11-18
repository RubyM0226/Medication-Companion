// Connects registration to Flask through the auth context and handles
// email confirmation before login.

import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemeColors } from '@/constants/colors';
import { useAuth } from '@/context/authContext';
import { useSettings } from '@/context/settingsContext';

export default function SignUpScreen() {
  const { colors } = useSettings();
  const { signUp } = useAuth();
  const styles = createStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSignUp() {
    if (submitting) return;

    setError('');
    setMessage('');

    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await signUp(email.trim(), password);

      if (result.requiresConfirmation) {
        setMessage(
          result.message ??
            'Check your email to confirm your account, then sign in.',
        );
        setPassword('');
        setConfirmPassword('');
      }

      // If registration creates a session, the root layout opens the app.
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to register. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <View style={styles.brandingSection}>
        <Text style={styles.brandingHeader}>
          A calmer way to stay on track.
        </Text>
        <Text style={styles.brandingSubheader}>
          Clear reminders, plain-language facts, and support without judgment.
        </Text>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>CREATE ACCOUNT</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.welcomeHeading}>Get Started</Text>

        <Text style={styles.fieldLabel}>♦ EMAIL ADDRESS</Text>
        <TextInput
          style={styles.underlineInput}
          placeholder="jamie@example.com"
          placeholderTextColor={`${colors.textPrimary}40`}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          accessibilityLabel="Email address"
          value={email}
          onChangeText={setEmail}
          editable={!submitting}
        />

        <Text style={styles.fieldLabel}>♦ PASSWORD</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[
              styles.underlineInput,
              {
                flex: 1,
                borderBottomWidth: 0,
                marginTop: 0,
                marginBottom: 0,
              },
            ]}
            placeholder="••••••••••••"
            placeholderTextColor={`${colors.textPrimary}40`}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            accessibilityLabel="Password"
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
          />

          <Pressable
            onPress={() => setShowPassword((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Hide passwords' : 'Show passwords'
            }>
            <Text style={styles.showPasswordText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>♦ CONFIRM PASSWORD</Text>
        <TextInput
          style={styles.underlineInput}
          placeholder="••••••••••••"
          placeholderTextColor={`${colors.textPrimary}40`}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          accessibilityLabel="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!submitting}
          returnKeyType="go"
          onSubmitEditing={handleSignUp}
        />
      </View>

      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}

      {message ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: colors.textPrimary }}>
          {message}
        </Text>
      ) : null}

      <Pressable
        style={[
          styles.button,
          styles.primaryButton,
          submitting && { opacity: 0.6 },
        ]}
        onPress={handleSignUp}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityState={{
          disabled: submitting,
          busy: submitting,
        }}>
        <Text style={styles.primaryButtonText}>
          {submitting ? 'Creating account…' : 'Register →'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.footerLinkButton}
        onPress={() => router.replace('/login')}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityState={{ disabled: submitting }}>
        <Text style={styles.footerLinkText}>
          Already have an account?{' '}
          <Text style={styles.footerLinkBold}>Sign in</Text>
        </Text>
      </Pressable>

      <View style={styles.privacyCard}>
        <Text style={styles.privacyHeader}>PRIVACY</Text>
        <Text style={styles.privacyText}>
          Your medication information is encrypted. You control what is
          shared and with whom.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: 25,
      paddingTop: 70,
      paddingBottom: 40,
      gap: 16,
    },
    brandingSection: {
      marginTop: 20,
      marginBottom: 10,
      gap: 12,
    },
    brandingHeader: {
      fontSize: 34,
      fontWeight: 'bold',
      color: colors.primary,
      letterSpacing: -0.5,
      lineHeight: 40,
    },
    brandingSubheader: {
      fontSize: 16,
      color: colors.textPrimary,
      opacity: 0.7,
      lineHeight: 22,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginVertical: 14,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.textPrimary,
      opacity: 0.2,
    },
    dividerText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textPrimary,
      opacity: 0.5,
      letterSpacing: 1.5,
    },
    formContainer: {
      gap: 12,
    },
    welcomeHeading: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textPrimary,
      opacity: 0.6,
      letterSpacing: 1,
      marginTop: 8,
    },
    underlineInput: {
      borderBottomWidth: 1,
      borderColor: colors.textPrimary,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.textPrimary,
      marginTop: -4,
      marginBottom: 12,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: colors.textPrimary,
      paddingRight: 4,
      marginBottom: 12,
    },
    showPasswordText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    button: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onPrimary,
    },
    footerLinkButton: {
      alignItems: 'center',
      marginVertical: 8,
    },
    footerLinkText: {
      fontSize: 14,
      color: colors.textPrimary,
      opacity: 0.8,
    },
    footerLinkBold: {
      fontWeight: '700',
      color: colors.primary,
    },
    privacyCard: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.textPrimary,
      opacity: 0.7,
      padding: 16,
      borderRadius: 12,
      gap: 4,
      marginTop: 20,
    },
    privacyHeader: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 1,
      opacity: 0.6,
    },
    privacyText: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textPrimary,
    },
  });