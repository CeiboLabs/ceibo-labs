'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';
import Link from 'next/link';

export function ContactForm() {
  const { t, locale } = useTranslation();
  const f = t.form;

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [message,     setMessage]     = useState('');
  const [projectType, setProjectType] = useState('');
  const [budget,      setBudget]      = useState('');
  const [timeline,    setTimeline]    = useState('');
  const [website,     setWebsite]     = useState('');
  const [status,      setStatus]      = useState<'idle' | 'loading' | 'success' | 'error' | 'limit'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, projectType, budget, timeline, website }),
    });

    if (res.status === 429) { setStatus('limit'); return; }
    setStatus(res.ok ? 'success' : 'error');
  };

  const inputCls =
    'w-full bg-navy-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none focus:border-electric-400/60 focus:bg-navy-900 transition-colors';

  const selectCls =
    'w-full bg-navy-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-electric-400/60 focus:bg-navy-900 transition-colors appearance-none cursor-pointer';

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">{f.successTitle}</h2>
        <p className="text-slate-400 max-w-sm">{f.successDesc}</p>
        <Link href={`/${locale}`}
          className="mt-4 text-sm text-electric-400 hover:text-electric-300 transition-colors">
          ← {f.backHome}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-lg mx-auto">

      {/* Name */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
          {f.nameLabel}
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={f.namePlaceholder}
          className={inputCls}
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
          {f.emailLabel}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={f.emailPlaceholder}
          className={inputCls}
        />
      </div>

      {/* Project Type + Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
            {f.projectTypeLabel}
          </label>
          <select
            required
            value={projectType}
            onChange={e => setProjectType(e.target.value)}
            className={`${selectCls} ${projectType ? 'text-white' : 'text-slate-500'}`}
          >
            <option value="" disabled>{f.selectPlaceholder}</option>
            {f.projectTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
            {f.budgetLabel}
          </label>
          <select
            required
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className={`${selectCls} ${budget ? 'text-white' : 'text-slate-500'}`}
          >
            <option value="" disabled>{f.selectPlaceholder}</option>
            {f.budgetOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
          {f.timelineLabel}
        </label>
        <select
          required
          value={timeline}
          onChange={e => setTimeline(e.target.value)}
          className={`${selectCls} ${timeline ? 'text-white' : 'text-slate-500'}`}
        >
          <option value="" disabled>{f.selectPlaceholder}</option>
          {f.timelineOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Current Website (optional) */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
          {f.websiteLabel} <span className="text-slate-600 normal-case font-normal tracking-normal">({f.optional})</span>
        </label>
        <input
          type="url"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          placeholder="https://"
          className={inputCls}
        />
      </div>

      {/* Message */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
          {f.messageLabel}
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={f.messagePlaceholder}
          className={`${inputCls} resize-none`}
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="shrink-0" />
          {f.errorMsg}
        </div>
      )}
      {status === 'limit' && (
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="shrink-0" />
          {f.limitMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex items-center justify-center gap-2 w-full bg-electric-400 hover:bg-electric-300 disabled:opacity-60 disabled:cursor-not-allowed text-navy-950 font-semibold text-sm rounded-xl py-3.5 transition-colors"
      >
        {status === 'loading' ? (
          <span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
        ) : (
          <Send size={14} />
        )}
        {status === 'loading' ? f.sending : f.submit}
      </button>
    </form>
  );
}
