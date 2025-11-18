import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

import { QueryProvider } from '@/lib/queryClient';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionManager } from "@/components/session/session-manager";
import { ErrorProvider } from "@/lib/contexts/error-context";
import { ConditionalHeader } from "@/components/navigation/conditional-header";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caja Cooperativa - Sistema de Gestión de Cajeros",
  description: "Sistema integral para la gestión de transacciones y operaciones de cajeros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorProvider>
            <QueryProvider>
              <ConditionalHeader />
              {children}
              <SessionManager />
            </QueryProvider>
          </ErrorProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
