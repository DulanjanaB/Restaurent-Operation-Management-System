import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { getToken } from '../lib/api';

// Entry point: signed-in users go straight to the scanner.
export default function Index() {
  useEffect(() => {
    getToken().then((token) => router.replace(token ? '/scan' : '/login'));
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
