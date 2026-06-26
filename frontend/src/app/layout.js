import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "The Study Point Library | Premium Reading Hall & Cabin Booking System",
  description: "Distraction-free fully air-conditioned study environment at Khatangi Kothi, Gaya-Fatehpur State Highway. Reserve study cabins, access high speed Wi-Fi, lock lockers, and view seat availability.",
  keywords: "library, study hall, cabin booking, seat availability, Gaya library, study point, reading room"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <AppProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
