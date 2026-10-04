import { NextRequest, NextResponse } from 'next/server';
import { getToken, getBranchId } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const [token, branchId] = await Promise.all([getToken(), getBranchId()]);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const headers = new Headers({ Authorization: `Bearer ${token}` });
  if (branchId) headers.set('X-Branch-Id', branchId);

  const res = await fetch(
    `${process.env.BACKEND_API_URL ?? 'http://localhost:3001'}/audit-log/export?${request.nextUrl.searchParams.toString()}`,
    { headers },
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Export failed' }, { status: res.status });
  }

  const responseHeaders = new Headers();
  const contentType = res.headers.get('content-type');
  const contentDisposition = res.headers.get('content-disposition');
  if (contentType) responseHeaders.set('content-type', contentType);
  if (contentDisposition)
    responseHeaders.set('content-disposition', contentDisposition);

  return new NextResponse(res.body, { headers: responseHeaders });
}
