import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';
export const metadata:Metadata={title:'REPIW · Review made simple',description:'Manage NFC and QR Google Review cards with REPIW.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><LanguageProvider>{children}</LanguageProvider></body></html>}
