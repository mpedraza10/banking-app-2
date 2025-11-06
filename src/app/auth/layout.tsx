"use client";

import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-row relative">
      {/* Theme Toggle Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      {/* Left half for the form */}
      <section className="w-1/2 flex items-center justify-center">
        {children}
      </section>

      {/* Right half for an image or illustration */}
      <section
        className="w-1/2 bg-cover bg-center bg-gray-200 dark:bg-gray-800"
        style={{
          backgroundImage: "url('/Frida.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
    </main>
  );
}
