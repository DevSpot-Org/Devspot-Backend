import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "DevSpot Api – Welcome home, Builders",
  description:
    "Where Web3 devs go full send. Join hackathons, win prizes, and unleash your builder brain. Only on DevSpot.",
  applicationName: "DevSpot",
  referrer: "origin-when-cross-origin",
  keywords: ["Web3", "AI", "hackathons", "developer platform", "blockchain", "builders"],
  authors: [{ name: "DevSpot Team" }],
  creator: "DevSpot Team",
  publisher: "DevSpot",
  metadataBase: new URL("https://api.devspot.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DevSpot – Welcome home, Builders",
    description:
      "Where Web3 devs go full send. Join hackathons, win prizes, and unleash your builder brain. Only on DevSpot.",
    url: "https://devspot.app",
    siteName: "DevSpot",
    images: [
      {
        url: "/Logopreview.png",
        width: 1200,
        height: 630,
        alt: "DevSpot Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSpot – Welcome home, Builders",
    description:
      "Where Web3 devs go full send. Join hackathons, win prizes, and unleash your builder brain. Only on DevSpot.",
    site: "@devspot_app",
    creator: "@devspot_app",
    images: {
      url: "/Logopreview.png",
      alt: "DevSpot Logo",
      width: 1200,
      height: 630,
    },
  },

  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileColor": "#ffffff",
    "theme-color": "#ffffff",
  },
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DevSpot",
              url: "https://devspot.app",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://devspot.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
