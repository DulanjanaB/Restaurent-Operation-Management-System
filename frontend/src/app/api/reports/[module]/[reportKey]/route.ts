import { NextRequest, NextResponse } from 'next/server';
import { getToken, getBranchId } from '@/lib/auth/session';

// Same-origin proxy for report CSV/Excel exports — a browser <a href>
// download can't attach an Authorization header itself, so this route does
// it server-side and streams the backend's response straight through.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ module: string; reportKey: string }> },
) {
  const { module, reportKey } = await params;
  const [token, branchId] = await Promise.all([getToken(), getBranchId()]);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // "All accessible branches" submits branch_id=all — the backend's
  // contract is to omit branch_id entirely for that, not treat it as a
  // literal (nonexistent) branch UUID.
  const exportParams = new URLSearchParams(request.nextUrl.searchParams);
  if (exportParams.get('branch_id') === 'all') exportParams.delete('branch_id');
  const query = exportParams.toString();
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  if (branchId) headers.set('X-Branch-Id', branchId);

  const res = await fetch(
    `${process.env.BACKEND_API_URL ?? 'http://localhost:3001'}/reports/${module}/${reportKey}?${query}`,
    { headers },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Export failed' },
      { status: res.status },
    );
  }

  const responseHeaders = new Headers();
  const contentType = res.headers.get('content-type');
  const contentDisposition = res.headers.get('content-disposition');
  if (contentType) responseHeaders.set('content-type', contentType);
  if (contentDisposition)
    responseHeaders.set('content-disposition', contentDisposition);

  return new NextResponse(res.body, { headers: responseHeaders });
}
