import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSettings } from '@/context/settingsContext';

export default function SignInScreen() {
  // email and password start as blank string 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // navigation handler placeholder for registration routing (new here? create an account button)
  const handleNavigateToSignUp = () => {
    Alert.alert('Navigation Clicked', 'Route user to CreateAccountScreen component here.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Upper Intro Section */}
      <View style={styles.brandingSection}>
        <Text style={styles.brandingHeader}>A calmer way to stay on track.</Text>
        <Text style={styles.brandingSubheader}>
          Clear reminders, plain-language facts, and support without judgment.
        </Text>
      </View>

      {/* Decorative Section Splitter */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>SIGN IN</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Form Group Block */}
      <View style={styles.formContainer}>
        <Text style={styles.welcomeHeading}>Welcome back</Text>

        {/* Email Input Field */}
        <Text style={styles.fieldLabel}>♦ EMAIL ADDRESS</Text>
        <TextInput
          style={styles.underlineInput}
          placeholder="jamie@example.com"
          placeholderTextColor={`${Colors.textPrimary}40`}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail} 
          // links input to React state so updates state var automatically with every typed letter.
        />

        {/* Password Input Field */}
        <Text style={styles.fieldLabel}>♦ PASSWORD</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.underlineInput, { flex: 1, borderBottomWidth: 0, marginTop: 0, marginBottom: 0 }]}
            placeholder="••••••••••••"
            placeholderTextColor={`${Colors.textPrimary}40`}
            secureTextEntry={!showPassword} 
            // hides text behind security dots when showPassword is false
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <Pressable 
            onPress={() => setShowPassword(!showPassword)}
            // flips boolean val for showpassword
          > 
            <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>

        {/* Forgot Password Link - triggers native Alert confirmation popup only for now */}
        <Pressable 
          style={styles.forgotPasswordButton}
          onPress={() => Alert.alert('Reset Password', `A password reset link will be sent to ${email || 'your email'}`)}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </Pressable>
      </View>

      {/* Primary Call to Action Button, aka Sign in Button*/}
      <Pressable 
        style={[styles.button, styles.primaryButton]}
        onPress={() => Alert.alert('Sign In clicked', 'Executing validation...')}
      >
        <Text style={styles.primaryButtonText}>Sign in →</Text>
      </Pressable>

      {/* Sign Up Navigation - Create an account button functionality */}
      <Pressable style={styles.footerLinkButton} onPress={handleNavigateToSignUp}>
        <Text style={styles.footerLinkText}>
          New here? <Text style={styles.footerLinkBold}>Create an account</Text>
        </Text>
      </Pressable>

      {/* Privacy Guarantee Disclaimer Container */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyHeader}>PRIVACY</Text>
        <Text style={styles.privacyText}>
          Your medication information is encrypted. You control what is shared and with whom.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
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
    color: Colors.primary, 
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  brandingSubheader: {
    fontSize: 16,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.textPrimary,
    opacity: 0.2,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    opacity: 0.5,
    letterSpacing: 1.5,
  },
  formContainer: {
    gap: 12,
  },
  welcomeHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    opacity: 0.6,
    letterSpacing: 1,
    marginTop: 8,
  },
  underlineInput: {
    borderBottomWidth: 1,
    borderColor: Colors.textPrimary,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: -4,
    marginBottom: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: Colors.textPrimary,
    paddingRight: 4,
    marginBottom: 12,
  },
  showPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginTop: -4,
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  button: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onPrimary,
  },
  footerLinkButton: {
    alignItems: 'center',
    marginVertical: 8,
  },
  footerLinkText: {
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.8,
  },
  footerLinkBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  privacyCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    opacity: 0.7,
    padding: 16,
    borderRadius: 12,
    gap: 4,
    marginTop: 20,
  },
  privacyHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
    opacity: 0.6,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
});
