import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
        <script src="https://cdn.tailwindcss.com" />
      </Head>
      <body className="bg-slate-50 text-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
