import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinanceAI — Smart Personal Finance",
  description: "AI-powered personal finance dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'Syne', sans-serif",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#020817" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#020817" },
            },
          }}
        />
      </body>
    </html>
  );
}