import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${site.name} - Scan Your Magento Store for Speed, Security & SEO`,
  description: site.description,
  alternates: { canonical: `https://www.${site.domain}/` },
  openGraph: {
    type: "website",
    url: `https://www.${site.domain}/`,
    title: `${site.name} - Scan Your Magento Store for Speed, Security & SEO`,
    description: site.description,
  },
  twitter: { card: "summary" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  url: `https://www.${site.domain}`,
  description: site.description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  creator: {
    "@type": "Organization",
    name: site.name,
    url: `https://www.${site.domain}`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior lets Next 16 suspend the CSS smooth-scroll during
    // route transitions, so new pages snap to the top instead of animating.
    <html lang="en" data-scroll-behavior="smooth" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white font-sans text-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
