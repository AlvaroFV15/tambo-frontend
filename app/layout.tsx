import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'El Tambo Cañetano - Comida Criolla Peruana',
  description: 'Ordena tu comida criolla favorita en línea. Recoge en nuestro restaurante.',
  keywords: 'restaurante, comida peruana, criolla, cañete',
  authors: [{ name: 'El Tambo Cañetano' }],
  openGraph: {
    title: 'El Tambo Cañetano',
    description: 'Auténtica comida criolla peruana',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
