'use client';

import { useActionState, useRef, useState } from 'react';
import Image from 'next/image';
import { saveSettingsAction } from './actions';
import type { SiteSettings } from '@/types/settings';

interface Props {
  settings: SiteSettings;
}

const initialState = { error: null, ok: false };

function Toggle({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 rounded-full bg-slate-200 dark:bg-navy-700 peer-checked:bg-electric-400 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}

function Field({ label, name, defaultValue, placeholder, type = 'text' }: {
  label: string; name: string; defaultValue?: string | null; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-navy-600/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-electric-400/60 focus:ring-1 focus:ring-electric-400/30 transition-colors"
      />
    </div>
  );
}

function Textarea({ label, name, defaultValue, placeholder }: {
  label: string; name: string; defaultValue?: string | null; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={2}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-navy-600/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-electric-400/60 focus:ring-1 focus:ring-electric-400/30 transition-colors resize-none"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-navy-700/40 overflow-hidden">
      <div className="bg-slate-100 dark:bg-navy-900/60 px-5 py-3 border-b border-slate-200 dark:border-navy-700/40">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="bg-white dark:bg-transparent p-5 space-y-4">{children}</div>
    </div>
  );
}

export function SettingsForm({ settings }: Props) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(settings.banner_image_url ?? null);
  // Tracks the persisted Supabase URL (not the local blob preview) for the hidden form field
  const [currentImageUrl, setCurrentImageUrl] = useState(settings.banner_image_url ?? '');
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(settings.maintenance_enabled);
  const [bannerEnabled, setBannerEnabled] = useState(settings.banner_enabled);
  const [takingClients, setTakingClients] = useState(settings.taking_clients);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.ok && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm">
          Settings saved successfully.
        </div>
      )}
      {state.error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <Section title="Maintenance Mode">
        <Toggle name="maintenance_enabled" label="Enable maintenance mode" checked={maintenanceEnabled} onChange={setMaintenanceEnabled} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Textarea
            name="maintenance_message_es"
            label="Message — ES"
            defaultValue={settings.maintenance_message_i18n?.es ?? settings.maintenance_message ?? ''}
            placeholder="Estamos haciendo mejoras. Volvemos pronto."
          />
          <Textarea
            name="maintenance_message_en"
            label="Message — EN"
            defaultValue={settings.maintenance_message_i18n?.en ?? ''}
            placeholder="We're doing some upgrades. Back soon."
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Admin sessions bypass maintenance mode.{' '}
            <span className="text-slate-400 dark:text-slate-500">Use incognito to test the visitor experience.</span>
          </p>
          <a
            href="/es/maintenance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 ml-4 text-xs font-medium text-electric-500 dark:text-electric-400 hover:underline"
          >
            Preview page ↗
          </a>
        </div>
      </Section>

      <Section title="Global Banner (Modal)">
        <Toggle name="banner_enabled" label="Show banner on site" checked={bannerEnabled} onChange={setBannerEnabled} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field name="banner_title_es" label="Title — ES" defaultValue={settings.banner_title_i18n?.es ?? ''} placeholder="¡Nuevo proyecto disponible!" />
          <Field name="banner_title_en" label="Title — EN" defaultValue={settings.banner_title_i18n?.en ?? ''} placeholder="New project available!" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field name="banner_subtitle_es" label="Subtitle — ES" defaultValue={settings.banner_subtitle_i18n?.es ?? ''} placeholder="Mirá lo que construimos." />
          <Field name="banner_subtitle_en" label="Subtitle — EN" defaultValue={settings.banner_subtitle_i18n?.en ?? ''} placeholder="Check out what we built." />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field name="banner_text_es" label="Text (fallback) — ES" defaultValue={settings.banner_text_i18n?.es ?? settings.banner_text ?? ''} placeholder="🚀 ¡Lanzamos algo nuevo!" />
          <Field name="banner_text_en" label="Text (fallback) — EN" defaultValue={settings.banner_text_i18n?.en ?? ''} placeholder="🚀 We just launched something new!" />
        </div>
        <Field name="banner_link_url" label="Link URL (optional)" defaultValue={settings.banner_link_url} placeholder="https://..." />

        {/* Image upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Banner Image (optional)
          </label>
          {previewUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 border border-slate-200 dark:border-navy-600/50">
              <Image src={previewUrl} alt="Banner preview" fill className="object-cover" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            name="banner_image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-electric-500/10 file:text-electric-600 dark:file:text-electric-400 hover:file:bg-electric-500/20 transition-colors cursor-pointer"
          />
          {previewUrl && (
            <button
              type="button"
              onClick={() => { setPreviewUrl(null); setCurrentImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="mt-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              Remove image
            </button>
          )}
          <input type="hidden" name="banner_image_remove" value={previewUrl ? '' : '1'} />
          <input type="hidden" name="banner_image_url_current" value={currentImageUrl} />
        </div>
      </Section>

      <Section title="Business State">
        <Toggle name="taking_clients" label="Currently taking new clients" checked={takingClients} onChange={setTakingClients} />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          When off, the hero CTA changes to &ldquo;Join the waiting list&rdquo;.
        </p>
      </Section>

      <Section title="Homepage Limits">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="home_projects_limit" label="Max projects shown" type="number" defaultValue={String(settings.home_projects_limit)} placeholder="6" />
          <Field name="home_reviews_limit" label="Max reviews shown" type="number" defaultValue={String(settings.home_reviews_limit)} placeholder="4" />
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
