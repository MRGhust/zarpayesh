import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://zarpayesh-five.vercel.app";
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "always",
      priority: 1.0,
      alternates: {
        languages: {
          "fa-IR": baseUrl,
        },
      },
    },
  ];
}
