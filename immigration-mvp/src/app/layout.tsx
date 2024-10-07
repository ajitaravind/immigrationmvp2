import "./globals.css";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";
import ClientAuthProvider from "@/components/ui/ClientAuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "TutorAssist",
  description: "Personalized learning experiences tailored to your needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <ClientAuthProvider>
          <div className="flex flex-col min-h-screen">{children}</div>
          <Toaster />
        </ClientAuthProvider>
      </body>
    </html>
  );
}
