import { TRPCProvider } from "../trpc";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dim">
      <TRPCProvider>
        <body>{children}</body>
      </TRPCProvider>
    </html>
  );
}
