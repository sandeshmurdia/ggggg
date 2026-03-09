import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../components/Input';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useApp } from '../context/AppContext';

type AuthParamList = { SignIn: undefined; SignUp: undefined };
type Props = { navigation: NativeStackNavigationProp<AuthParamList, 'SignIn'> };

export function SignInScreen({ navigation }: Props) {
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    const success = signIn(email.trim(), password);
    if (!success) {
      setError('Invalid credentials. Use any email/password for demo.');
    }
    // On success, RootNavigator switches to Main automatically via useApp().user
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue to your account</Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="Sign In" onPress={handleSignIn} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
            Sign Up
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
