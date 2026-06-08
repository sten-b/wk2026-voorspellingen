export const metadata = {
  title: "Sten's WK 2026 Voorspellingen",
  description: "WK 2026 voorspellingen, model en spelers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
