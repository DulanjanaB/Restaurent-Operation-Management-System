import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan batch' }} />
      <Stack.Screen name="batch/[id]" options={{ title: 'Batch details' }} />
    </Stack>
  );
}
