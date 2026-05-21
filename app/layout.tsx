import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biblioteca — Acervo de Estudo',
  description: 'Coletânea curada de livros do professor',
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
