import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 인테리어 큐레이션",
  description: "방 사진과 조건을 바탕으로 실제 구매 가능한 가구 조합을 추천합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
