import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "زرپایش | پایش لحظه‌ای طلا، سکه و ارز",
    short_name: "زرپایش",
    description:
      "ترمینال بلادرنگ قیمت دلار، ارزهای آزاد، طلای ۱۸ عیار، سکه امامی، حباب‌سنج و نمودار تکنیکال بر پایه TGJU.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    dir: "rtl",
    lang: "fa-IR",
    background_color: "#040814",
    theme_color: "#040814",
    orientation: "portrait-primary",
    categories: ["finance", "business", "utilities"],
    icons: [
      {
        src: "/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
