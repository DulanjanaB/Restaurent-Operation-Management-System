import { LoginForm } from './login-form';
import {
  Brand,
  DEFAULT_BRAND_NAME,
  type Brand as BrandValue,
} from '@/components/app-shell/brand';
import { getBrand } from '@/lib/server/settings/queries';

async function loadBrand(): Promise<BrandValue> {
  try {
    const brand = await getBrand();
    return {
      name: brand.business_name ?? DEFAULT_BRAND_NAME,
      logoUrl: brand.logo_url,
    };
  } catch {
    return { name: DEFAULT_BRAND_NAME, logoUrl: null };
  }
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams;
  const next = typeof params.next === 'string' ? params.next : undefined;
  const expiredNotice = params.reason === 'expired';
  const brand = await loadBrand();

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-white p-6">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 top-1/2 bg-[#0a72e8]"
      />
      <div className="relative grid w-full max-w-[780px] overflow-hidden rounded-xl bg-white shadow-2xl md:grid-cols-[1fr_1.2fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-b from-[#00c6fb] to-[#0553d6] md:block">
          <div className="absolute -left-14 -top-6 size-48 rounded-full border-[14px] border-white/15" />
          <div className="absolute left-6 top-24 size-36 rounded-full border-[10px] border-white/15" />
          <div className="absolute bottom-32 left-12 size-16 rounded-full border-[6px] border-white/15" />
          <div className="absolute bottom-10 left-4 size-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 left-1/2 size-40 -translate-x-1/2 rounded-full bg-white/10" />
          <div className="absolute right-6 top-40 size-8 rounded-full border-4 border-white/15" />
          <div className="absolute inset-x-6 bottom-8">
            <Brand brand={brand} inverse size="lg" />
          </div>
        </div>

        <div className="flex flex-col justify-center px-10 py-14">
          <LoginForm next={next} expiredNotice={expiredNotice} />
        </div>
      </div>
    </div>
  );
}
