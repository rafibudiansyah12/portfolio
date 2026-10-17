import { DM_Sans, Manrope } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './styles.css';

const heading = Manrope({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Rafi Budiansyah Developer', template: '%s | Rafi Budiansyah' },
  description:
    'Web developer and Informatics Engineering student building useful digital products.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={`${heading.variable} ${body.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
