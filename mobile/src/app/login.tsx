import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ApiError, DEFAULT_SERVER_URL, getServerUrl, login, setServerUrl } from '../lib/api';
import { useEffect } from 'react';

export default function LoginScreen() {
  const [server, setServer] = useState(DEFAULT_SERVER_URL);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServerUrl().then(setServer);
  }, []);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await setServerUrl(server.trim());
      await login(username.trim(), password);
      router.replace('/scan');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Batch Scanner</Text>
      <Text style={styles.hint}>Sign in with your restaurant account to view batch details.</Text>

      <Text style={styles.label}>Server address</Text>
      <TextInput
        style={styles.input}
        value={server}
        onChangeText={setServer}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.button, (busy || !username || !password) && styles.buttonDisabled]}
        onPress={submit}
        disabled={busy || !username || !password}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 6, backgroundColor: '#fffbf5' },
  title: { fontSize: 26, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  hint: { color: '#6b7280', marginBottom: 12 },
  label: { marginTop: 10, fontSize: 13, color: '#374151', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: { color: '#dc2626', marginTop: 10 },
  button: {
    marginTop: 18,
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
