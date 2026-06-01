import type {Metadata} from 'next';
import { ThemeProvider } from './theme-provider';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'JASASAJA - Sistem Penjaminan Mutu & Audit Konsistensi BPS Pamekasan Suite',
  description: 'Platform SaaS Enterprise penjaminan mutu data sensus, kuesioner Susenas, Sakernas, kepatuhan UU PDP No. 27 Tahun 2022, rate limiting Upstash, dan billing Xendit.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-[#fcfdfd] dark:bg-slate-950 text-[#1e293b] dark:text-slate-100 antialiased min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
