const UUID =
  '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})';

// Every batch QR sticker encodes the batch's web address, for example
// https://kitchen.example.com/food-preservation/batches/<id>. The app only
// needs the id, so it reads it from that path and ignores the host.
export function batchIdFromScan(data: string): string | null {
  const match = data.match(new RegExp(`/food-preservation/batches/${UUID}`, 'i'));
  return match ? match[1].toLowerCase() : null;
}
