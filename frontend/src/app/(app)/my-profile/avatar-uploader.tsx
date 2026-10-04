'use client';

import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAX_BYTES = 5 * 1024 * 1024;

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

// Profile photo picker. Uploads through the same-origin /api/uploads route
// and writes the resulting URL into a hidden field the profile form submits.
// An empty value clears the photo.
export function AvatarUploader({
  name,
  defaultUrl,
}: {
  name: string;
  defaultUrl?: string | null;
}) {
  const [url, setUrl] = useState(defaultUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Photo must be 5 MB or smaller.');
      return;
    }

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
    <div className="flex flex-col items-center gap-4">
      <input type="hidden" name={name} value={url} />
      <div className="relative">
        <Avatar className="size-32 ring-4 ring-background shadow-lg">
          {url && <AvatarImage src={url} alt="Profile photo" />}
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-semibold text-white">
            {initials(name) || '?'}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:scale-105 disabled:opacity-60"
        >
          <Camera className="size-4" />
        </button>
      </div>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : url ? 'Change photo' : 'Add photo'}
        </Button>
        {url && !uploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUrl('')}
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        JPG or PNG, up to 5 MB. Shown in the top bar and on your profile.
      </p>
    </div>
  );
}
