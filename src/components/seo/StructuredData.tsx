import React from "react";

export function StructuredData() {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://zarpayesh-five.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "زرپایش | قیمت لحظه‌ای دلار، طلا ۱۸ عیار و سکه امامی",
        alternateName: [
          "ZarPayesh",
          "زرپایش",
          "ترمینال طلا و ارز زرپایش",
          "نرخ لحظه‌ای طلا و سکه TGJU",
        ],
        description:
          "سامانه هوشمند پایش لحظه‌ای قیمت دلار، طلا ۱۸ عیار، سکه امامی و ارزهای آزاد از TGJU همراه با نمودار تکنیکال شمعی، حباب‌سنج سکه و محاسبه‌گر فاکتور طلا.",
        inLanguage: "fa-IR",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "زرپایش (ZarPayesh)",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/pwa-512x512.png`,
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://t.me/az_be_ma_mabot",
          "https://github.com/MRGhust/zarpayesh",
        ],
      },
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/#webapp`,
        name: "زرپایش | قیمت لحظه‌ای دلار، طلا ۱۸ عیار و سکه امامی",
        url: baseUrl,
        applicationCategory: "FinanceApplication",
        applicationSubCategory: "Currency & Gold Market Terminal",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. HTML5 PWA compatible.",
        inLanguage: "fa-IR",
        image: `${baseUrl}/og-preview.png`,
        screenshot: `${baseUrl}/og-preview.png`,
        description:
          "پایش بلادرنگ نرخ دلار، یورو، درهم، لیر، گریونا، طلای ۱۸ عیار، مثقال طلا و سکه امامی بر پایه شبکه اطلاع‌رسانی طلا و ارز (TGJU) همراه با نمودار تکنیکال شمعی، حباب‌سنج سکه و ماشین‌حساب فاکتور طلا.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IRR",
        },
        featureList: [
          "قیمت لحظه‌ای دلار، یورو، درهم امارات، پوند، لیر ترکیه و گریونا به تومان و ریال",
          "نرخ زنده طلای ۱۸ عیار، طلای ۲۴ عیار، مظنه مثقال و انس جهانی طلا",
          "حباب‌سنج تحلیلی و محاسبه ارزش ذاتی سکه تمام امامی، بهار آزادی، نیم‌سکه، ربع‌سکه و سکه گرمی",
          "ماشین‌حساب برآورد فاکتور طلا شامل وزن، اجرت ساخت، سود فروشنده و مالیات",
          "نمودار تکنیکال شمعی (OHLC)، خطی و میله‌ای با میانگین متحرک (SMA) و کانال بولینگر",
          "مبدل چندارزی پیشرفته و محاسبه‌گر ارزش سبد دارایی شخصی",
          "وب‌اپلیکیشن قابل نصب (PWA) همراه با هشدار قیمت مرورگر و بات تلگرام",
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "بازار ارز و اسکناس",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "قیمت طلا و حباب سکه",
            item: `${baseUrl}/#gold`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "دیده‌بان و نمودار تکنیکال",
            item: `${baseUrl}/#watchlist`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "مبدل ارز و سبد دارایی",
            item: `${baseUrl}/#converter`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "قیمت لحظه‌ای دلار، طلا و سکه در زرپایش از چه منبعی دریافت می‌شود؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "تمامی نرخ‌های ارز، طلای ۱۸ عیار، مثقال و مسکوکات طلا در زرپایش به صورت زنده از شبکه اطلاع‌رسانی طلا، سکه و ارز (TGJU.org) دریافت و پس از اعتبارسنجی به تومان و ریال نمایش داده می‌شوند.",
            },
          },
          {
            "@type": "Question",
            name: "حباب سکه امامی و ارزش ذاتی سکه چگونه محاسبه می‌شود؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "ارزش ذاتی هر مسکوک بر پایه وزن استاندارد سکه (مثلاً ۸.۱۳۳ گرم برای سکه تمام با عیار ۲۱.۶) و قیمت لحظه‌ای طلای عیار کامل محاسبه می‌شود. اختلاف قیمت بازار سکه با ارزش ذاتی طلای آن، میزان حباب اسمی و درصد حباب سکه را مشخص می‌کند.",
            },
          },
          {
            "@type": "Question",
            name: "فرمول محاسبه فاکتور طلای ۱۸ عیار با اجرت و مالیات چیست؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "در ماشین‌حساب فاکتور طلای زرپایش، ابتدا وزن طلا در قیمت روز یک گرم طلای ۱۸ عیار ضرب می‌شود تا ارزش طلای خام به دست آید. سپس مبلغ اجرت ساخت، سود فروشنده روی جمع طلا و اجرت، و مالیات بر ارزش افزوده (صرفاً روی جمع اجرت و سود فروشنده) محاسبه و جمع کل فاکتور نمایش داده می‌شود.",
            },
          },
          {
            "@type": "Question",
            name: "چگونه می‌توانم هشدار قیمت دلار و طلا را در موبایل و تلگرام دریافت کنم؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "شما می‌توانید زرپایش را به عنوان وب‌اپلیکیشن (PWA) روی صفحه اصلی موبایل خود نصب کنید و از بخش «هشدار قیمت» سقف یا کف هدف را ثبت نمایید، یا از طریق بات تلگرام زرپایش (@az_be_ma_mabot) گزارش‌های زمان‌بندی‌شده و نمودارهای قیمت را دریافت کنید.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
