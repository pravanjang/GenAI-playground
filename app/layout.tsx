import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Model Playground",
  description: "Interactive AI playground for multiple language models",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
