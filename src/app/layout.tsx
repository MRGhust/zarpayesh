import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#040814",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://zarpayesh-five.vercel.app"),
  title: "زرپایش | قیمت لحظه‌ای دلار، طلا و سکه امامی",
  description:
    "سامانه مانیتورینگ بلادرنگ مظنه طلا، مسکوکات، دلار به ریال و تومان بر پایه TGJU.org همراه با حباب‌سنج سکه، مبدل پیشرفته چندارزی و نمودارهای تکنیکال.",
  keywords: [
    "قیمت دلار",
    "قیمت طلا ۱۸ عیار",
    "سکه امامی",
    "قیمت ارز",
    "حباب سکه",
    "TGJU",
    "مبدل ارز",
    "دلار به ریال",
    "قیمت گریونا",
    "قیمت لیر",
  ],
  authors: [{ name: "ZarPayesh Financial Terminal" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "زرپایش",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "زرپایش | قیمت لحظه‌ای دلار، طلا و سکه امامی",
    description:
      "پایش لحظه‌ای نرخ ارز، طلا، سکه امامی و گریونا بر پایه شبکه اطلاع‌رسانی طلا و ارز (TGJU). مجهز به حباب‌سنج و مبدل پیشرفته.",
    url: "https://zarpayesh-five.vercel.app",
    siteName: "زرپایش (ZarPayesh)",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "زرپایش؛ پایش ارز، طلا و سکه",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "زرپایش | قیمت لحظه‌ای دلار، طلا و سکه",
    description:
      "نرخ لحظه‌ای دلار، یورو، درهم، لیر، طلا ۱۸ عیار و سکه امامی بر پایه TGJU همراه با مبدل چندارزی.",
    images: ["/og-preview.png"],
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-obsidian font-sans text-on-surface antialiased selection:bg-bullion/20 selection:text-bullion-light">
        {children}
      </body>
    </html>
  );
}
