import { Nunito, Encode_Sans } from 'next/font/google';

export const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const encodeSans = Encode_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-encode-sans',
});