'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Uploads to our own /api/uploads route (same-origin, keeps the JWT
// server-side), then writes the returned URL into a hidden input so the
// surrounding <form action={serverAction}> sees a plain string field
// exactly like the backend DTOs expect (e.g. file_url, logo_url).
export function FileUploadField({
  name,
  defaultUrl,
  accept,
  label = 'File',
}: {
  name: string;
  defaultUrl?: string | null;
  accept?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = (await res.json()) as { url: string };
      setUrl(data.url);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={url} />
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : url ? 'Replace file' : `Upload ${label}`}
      </Button>
      {url && !uploading && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          View current file
        </a>
      )}
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
