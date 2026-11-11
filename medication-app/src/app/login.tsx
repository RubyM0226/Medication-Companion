// Connects sign-in to Flask through the auth context, with validation,
// loading state, and error feedback. Links registration to /signup.

import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

export default function SignInScreen() {
  const { colors } = useSettings();
  const { signIn } = useAuth();
  const styles = createStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    if (submitting) return;

    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      // The root layout handles navigation when auth state changes.
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
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
        <Text style={styles.dividerText}>SIGN IN</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.welcomeHeading}>Welcome back</Text>

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
            autoComplete="current-password"
            accessibilityLabel="Password"
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
          />

          <Pressable
            onPress={() => setShowPassword((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Hide password' : 'Show password'
            }>
            <Text style={styles.showPasswordText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.forgotPasswordButton}
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              'Password reset',
              'Password reset is not connected yet.',
            )
          }>
          <Text style={styles.forgotPasswordText}>
            Forgot password?
          </Text>
        </Pressable>
      </View>

      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}

      <Pressable
        style={[
          styles.button,
          styles.primaryButton,
          submitting && { opacity: 0.6 },
        ]}
        onPress={handleSignIn}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityState={{
          disabled: submitting,
          busy: submitting,
        }}>
        <Text style={styles.primaryButtonText}>
          {submitting ? 'Signing in…' : 'Sign in →'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.footerLinkButton}
        onPress={() => router.push('/signup')}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityState={{ disabled: submitting }}>
        <Text style={styles.footerLinkText}>
          New here?{' '}
          <Text style={styles.footerLinkBold}>Create an account</Text>
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
    forgotPasswordButton: {
      alignSelf: 'flex-start',
      marginTop: -4,
      marginBottom: 12,
    },
    forgotPasswordText: {
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