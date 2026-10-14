'use client';
import Link from 'next/link';
import {LanguageSwitcher,useLanguage} from '@/lib/i18n';
export default function NotFound(){const {t}=useLanguage();return <main className="activation-shell"><div className="auth-language"><LanguageSwitcher/></div><div className="activation-card"><div className="brand-mark">R</div><p className="eyebrow">REPIW</p><h1>{t('notFoundTitle')}</h1><p className="muted">{t('notFoundDescription')}</p><Link href="/" className="button">{t('goHome')}</Link></div></main>}
