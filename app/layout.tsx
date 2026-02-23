import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2026 除夕许愿墙",
  description: "写下你的新年愿望，愿所有美好如期而至。"
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
