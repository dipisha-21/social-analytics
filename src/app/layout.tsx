import "./globals.css";
import { ReactNode } from "react";
import { ReactQueryProvider } from "dipisha/app/providers";
import { NextAuthSessionProvider } from "dipisha/app/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "dipisha/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export const metadata = {
  title: "Social Analytics Dashboard",
  description: "Unified analytics for YouTube, Pinterest, Instagram",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session: any = await getServerSession(authOptions as any);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <ReactQueryProvider>
          <NextAuthSessionProvider>
            <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
              <h1 className="text-lg font-semibold">Creator Analytics</h1>
              <nav className="flex gap-4 text-sm">
                <Link href="/">Dashboard</Link>
              </nav>
              <div className="text-xs text-slate-300">
                {session?.user ? (
                  <span>{session.user.email}</span>
                ) : (
                  <Link href="/api/auth/signin">Sign in</Link>
                )}
              </div>
            </header>
            <main className="max-w-5xl mx-auto p-4">{children}</main>
          </NextAuthSessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
