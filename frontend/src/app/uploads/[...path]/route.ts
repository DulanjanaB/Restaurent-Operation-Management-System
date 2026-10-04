import { NextResponse } from 'next/server';

// Serves files the backend stored (currently the business logo) from the
// app's own origin. Uploads are public by design — the backend serves them
// without auth — so this route needs no session.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (path.some((segment) => segment === '.' || segment === '..')) {
    return new NextResponse(null, { status: 400 });
  }

  const res = await fetch(
    `${process.env.BACKEND_API_URL ?? 'http://localhost:3001'}/uploads/${path
      .map(encodeURIComponent)
      .join('/')}`,
    { cache: 'no-store' },
  );
  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  return new NextResponse(res.body, {
    headers: {
      'Content-Type':
        res.headers.get('content-type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
