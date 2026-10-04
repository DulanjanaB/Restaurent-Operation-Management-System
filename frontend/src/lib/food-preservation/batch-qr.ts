import 'server-only';
import QRCode from 'qrcode';

export function batchPublicUrl(batchId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/food-preservation/batches/${batchId}`;
}

export function batchQrDataUrl(batchId: string): Promise<string> {
  return QRCode.toDataURL(batchPublicUrl(batchId), { margin: 1, width: 320 });
}
