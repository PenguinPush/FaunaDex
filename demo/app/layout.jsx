import "./globals.css";
export const metadata = {
  title: "FaunaDex",
  icons: { icon: "/static/dex-mark.png" },
};
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
