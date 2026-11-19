import "./globals.css";
import { site } from "../lib/site";

export const metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: "FaunaDex",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "FaunaDex",
    title: site.title,
    description: site.description,
    url: "/",
    images: [
      {
        url: "/static/demo.png",
        width: 3090,
        height: 1282,
        alt: "FaunaDex matching an Amano shrimp photo and exploring nearby animal embeddings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [
      {
        url: "/static/demo.png",
        alt: "FaunaDex animal search and embedding map",
      },
    ],
  },
  icons: {
    icon: { url: "/static/dex-mark.png", type: "image/png" },
    apple: "/static/dex-mark.png",
  },
};

export const viewport = { themeColor: "#edf0ef" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-[15px] bg-[#edf0ef] bg-[radial-gradient(#cbd2d7_2px,transparent_2px)] bg-size-[24px_24px] font-sans text-dex-ink [&_[hidden]]:hidden!">
        {children}
      </body>
    </html>
  );
}
