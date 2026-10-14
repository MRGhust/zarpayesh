import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'زرپایش | مانیتورینگ بلادرنگ طلا، سکه، دلار و ارزهای خارجی',
  description:
    'سامانه حرفه‌ای نمایش قیمت لحظه‌ای دلار به ریال و تومان بر پایه شبکه اطلاع‌رسانی طلا و ارز (TGJU)، سکه امامی، طلای ۱۸ عیار، حباب‌سنج و مبدل پیشرفته چندارزی',
  icons: {
    icon: '/favicon.ico',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-surface font-sans text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
