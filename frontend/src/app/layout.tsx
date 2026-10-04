import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins, Roboto, Lora } from "next/font/google";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getThemeCookies } from "@/lib/theme/cookies";
import "./globals.css";

// Blocking (runs before hydration) so a "system" mode that resolves to
// dark doesn't flash light first — the server render already handles
// explicit "light"/"dark" correctly from the cookie, this only ever needs
// to ADD the dark class, never remove it.
const NO_FLASH_DARK_MODE_SCRIPT = `
(function () {
  try {
    var match = document.cookie.match(/(?:^|; )theme_mode=([^;]+)/);
    var mode = match ? decodeURIComponent(match[1]) : 'system';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (mode === 'dark' || (mode === 'system' && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

// All five font presets selectable in Settings -> Appearance are loaded
// here (next/font/google requires a static, build-time call per font —
// it can't fetch an arbitrary family at request time from a DB value), each
// under its own CSS variable. Only one is ever visually active: globals.css
// maps `--font-sans` to whichever variable matches the current
// `data-font="<key>"` attribute on <html>, the same selectable-preset
// pattern already used for `data-theme`.
const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const FONT_VARIABLES = `${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${roboto.variable} ${lora.variable}`;

export const metadata: Metadata = {
  title: "Restaurant Operations",
  description: "Restaurant operations management system",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { theme, mode, font } = await getThemeCookies();
  const ssrDark = mode === "dark";

  return (
    <html
      lang="en"
      data-theme={theme}
      data-font={font}
      className={`${FONT_VARIABLES} h-full antialiased${ssrDark ? " dark" : ""}`}
    >
      <head>
        <Script
          id="no-flash-dark-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: NO_FLASH_DARK_MODE_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
