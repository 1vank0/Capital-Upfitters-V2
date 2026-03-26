import React from 'react'

export const metadata = {
  title: 'Capital Upfitters — Premium Vehicle Upfitting',
  description:
    "DMV's most trusted vehicle upfitting shop. Bedliners, ceramic coatings, hitches, and full fleet solutions.",
}

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
