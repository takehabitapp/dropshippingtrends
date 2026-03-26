import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropshipTrends – Descubrimiento de Productos con IA",
  description: "Plataforma de análisis y descubrimiento de tendencias para dropshipping impulsada por IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center mb-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-black text-white shadow-lg text-sm">
              DT
            </div>
            <h1 className="text-lg font-bold gradient-text tracking-tight">
              DropshipTrends
            </h1>
          </div>
          <div className="text-xs text-gray-600 font-medium hidden md:block">
            Powered by GPT-3.5 + DALL·E 3
          </div>
        </header>
        <main className="container mx-auto px-4 pb-24 max-w-5xl">
          {children}
        </main>
      </body>
    </html>
  );
}
