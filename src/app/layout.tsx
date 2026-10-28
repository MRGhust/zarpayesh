import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StructuredData } from "@/components/seo/StructuredData";

const APP_BASE_URL =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://zarpayesh-five.vercel.app";

const SEO_TITLE = "زرپایش | قیمت لحظه‌ای دلار، طلا ۱۸ عیار و سکه امامی";
const SEO_DESCRIPTION =
  "سامانه هوشمند پایش لحظه‌ای قیمت دلار، طلا ۱۸ عیار، سکه امامی و ارزهای آزاد از TGJU همراه با نمودار تکنیکال شمعی، حباب‌سنج سکه و محاسبه‌گر فاکتور طلا.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#040814",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  title: {
    default: SEO_TITLE,
    template: "%s | زرپایش (ZarPayesh)",
  },
  description: SEO_DESCRIPTION,
  applicationName: "زرپایش | ZarPayesh",
  category: "finance",
  keywords: [
    "قیمت لحظه ای دلار",
    "قیمت دلار امروز",
    "قیمت طلا ۱۸ عیار",
    "قیمت سکه امامی",
    "حباب سکه",
    "محاسبه فاکتور طلا",
    "محاسبه اجرت طلا",
    "قیمت مثقال طلا",
    "انس جهانی طلا",
    "قیمت یورو",
    "قیمت درهم امارات",
    "قیمت لیر ترکیه",
    "قیمت گریونا اوکراین",
    "مبدل ارز به تومان و ریال",
    "نمودار تکنیکال دلار و طلا",
    "شبکه اطلاع رسانی طلا و ارز",
    "TGJU",
    "زرپایش",
    "ZarPayesh",
  ],
  authors: [{ name: "ZarPayesh Financial Terminal", url: APP_BASE_URL }],
  creator: "ZarPayesh Financial Terminal",
  publisher: "ZarPayesh",
  alternates: {
    canonical: "/",
    languages: {
      "fa-IR": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "زرپایش",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: "/",
    siteName: "زرپایش | ZarPayesh",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "زرپایش؛ پایش لحظه‌ای قیمت دلار، طلا ۱۸ عیار، سکه امامی و نمودار تکنیکال",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "زرپایش؛ پایش لحظه‌ای قیمت دلار، طلا ۱۸ عیار و سکه امامی",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="preload"
          href="/fonts/Vazirmatn-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <StructuredData />
      </head>
      <body className="bg-obsidian font-sans text-on-surface antialiased selection:bg-bullion/20 selection:text-bullion-light">
        {children}
      </body>
    </html>
  );
}
