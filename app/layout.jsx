import './globals.css';

export const metadata = {
  title: 'GRIEVANCE AI',
  description: 'Contract Analysis & Grievance Filing'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
