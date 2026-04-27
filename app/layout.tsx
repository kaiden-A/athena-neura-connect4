// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Athena vs Neura: Connect 4 — Smart AI',
  description: 'Challenge the AI in Connect 4 strategy. Choose your side: Athena or Neura.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}