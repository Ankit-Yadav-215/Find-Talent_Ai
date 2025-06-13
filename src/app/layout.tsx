import './globals.css';
import type { Metadata } from 'next';
import { nunito, encodeSans } from './fonts';

export const metadata: Metadata = {
  title: 'TalentAI - AI-Powered Recruitment Platform',
  description: 'Find the perfect candidates with AI-generated job descriptions and smart LinkedIn filtering',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${encodeSans.variable}`}>
      <body className={`${nunito.className} antialiased`}>{children}</body>
    </html>
  );
}