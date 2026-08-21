import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { NatureAtmosphere } from '@/components/visuals/NatureAtmosphere';

export const metadata: Metadata = {
  title: 'For Sri 💜 Happy Birthday!',
  description: 'A handmade private birthday memory space dedicated to Sri (Srinithi).',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💜</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-purple-300 selection:text-purple-950">
        <ThemeProvider>
          {/* Animated butterflies, falling petals, ambient glow */}
          <NatureAtmosphere />

          <div className="relative z-10 min-h-screen flex flex-col justify-between">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
