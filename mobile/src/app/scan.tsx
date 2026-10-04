import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { clearToken } from '../lib/api';
import { batchIdFromScan } from '../lib/batch-link';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [message, setMessage] = useState<string | null>(null);
  // Stops a single QR code from opening the batch many times per second.
  const handled = useRef(false);

  // Coming back from a batch's details re-arms the scanner.
  useFocusEffect(
    useCallback(() => {
      handled.current = false;
      setMessage(null);
    }, []),
  );

  function onScanned({ data }: { data: string }) {
    if (handled.current) return;
    handled.current = true;
    const id = batchIdFromScan(data);
    if (!id) {
      setMessage('That QR code is not a batch sticker.');
      setTimeout(() => {
        handled.current = false;
      }, 1500);
      return;
    }
    router.push(`/batch/${id}`);
  }

  async function signOut() {
    await clearToken();
    router.replace('/login');
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>The camera is needed to read batch QR stickers.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onScanned}
      />
      <View style={styles.footer}>
        <Text style={styles.hint}>
          {message ?? 'Point the camera at a batch sticker.'}
        </Text>
        <Pressable onPress={signOut}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbf5' },
  camera: { flex: 1 },
  footer: { padding: 16, gap: 10, alignItems: 'center' },
  hint: { color: '#374151', textAlign: 'center', fontSize: 15, padding: 16 },
  link: { color: '#ea580c', fontWeight: '600' },
  button: {
    alignSelf: 'center',
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
