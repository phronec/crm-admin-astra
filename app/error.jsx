'use client';
import { useEffect,useState } from 'react';
import { dictionary } from '../lib/languages';
export default function ErrorBoundary({reset}) {
  const [lang,setLang]=useState('cs');
  useEffect(()=>{setLang(document.documentElement.lang);},[]);
  const t=dictionary(lang);
  return <main className="login"><h1>{t.unavailableTitle}</h1><p>{t.failed}</p><button onClick={reset}>{t.retry}</button></main>;
}
