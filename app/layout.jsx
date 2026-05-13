import './globals.css'

export const metadata = {
  title: 'Grievance AI',
  description: 'Contract Analysis and Grievance Filing',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
