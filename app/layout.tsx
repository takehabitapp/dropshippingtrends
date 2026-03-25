import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DropshipTrends API MVP",
  description: "AI-Powered Product Discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.className} antialiased`}
      >
        <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
              D
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              DropshipTrends
            </h1>
          </div>
        </header>
        <main className="container mx-auto px-4 pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
