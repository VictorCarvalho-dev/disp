import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./_components/sidebar/sidebar";
import { getSession } from "./_server-actions/session";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "WhatsApp Disparo - Plataforma de Marketing Digital",
  description: "Sua plataforma completa para campanhas de WhatsApp e marketing digital",
};

export default async function RootLayout({ children }) {


  const session = await getSession();

  if (!session) {
    return redirect("/");
  }

  return (
    <html lang="pt_BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
          <Sidebar permission={session.permissao} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
