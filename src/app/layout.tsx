import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "River Guard",
  description: "一个基于 NestJS 和 Next.js 的全栈后端服务平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <QueryProvider>
          {children}
          <Toaster position="top-right" expand={false} />
        </QueryProvider>
      </body>
    </html>
  );
}
