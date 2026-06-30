import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'e-micro-commerce',
  description: 'Plataforma de fluxo duplo para microempreendedores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
