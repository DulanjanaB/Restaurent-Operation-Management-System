import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth/session';

// Same-origin proxy to the backend's POST /uploads — keeps the JWT
// server-side even for a Client Component-initiated file upload (the
// browser never sees the token, only ever talks to this route).
export async function POST(request: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const res = await fetch(
    `${process.env.BACKEND_API_URL ?? 'http://localhost:3001'}/uploads`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Upload failed' }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}
