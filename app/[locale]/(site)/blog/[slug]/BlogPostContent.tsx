'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Tag, ArrowRight, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '@/lib/i18n/context';
import { pickI18n, pickI18nMedia } from '@/lib/i18n-content';
import type { Locale } from '@/lib/i18n/translations';
import { SITE } from '@/lib/constants';

interface Post {
  id: string;
  slug: string;
  tags: string[];
  cover_image_url: string | null;
  cover_image_url_i18n: Record<string, string> | null;
  published_at: string | null;
  status: string;
  title_i18n: Record<string, string> | null;
  excerpt_i18n: Record<string, string> | null;
  content_i18n: Record<string, string> | null;
}

function formatDate(dateStr: string | null, locale: Locale) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    locale === 'es' ? 'es-UY' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

function readingTime(content: string, locale: Locale): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return locale === 'es' ? `${minutes} min de lectura` : `${minutes} min read`;
}

export function BlogPostContent({
  post,
  relatedPosts,
  isPreview,
  locale,
}: {
  post: Post;
  relatedPosts: Post[];
  isPreview: boolean;
  locale: Locale;
}) {
  const { t } = useTranslation();

  const title = pickI18n(post.title_i18n, locale);
  const excerpt = pickI18n(post.excerpt_i18n, locale);
  const content = pickI18n(post.content_i18n, locale);
  const coverImage = pickI18nMedia(post.cover_image_url_i18n, locale) || post.cover_image_url || '';

  const [copied, setCopied] = useState(false);
  const postUrl = `${SITE.url}/${locale}/blog/${post.slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(title)}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 pt-24 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {isPreview && (
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium text-center">
            Preview mode — this post is not publicly visible
          </div>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href={`/${locale}`} className="hover:text-electric-400 transition-colors">
            {t.nav.home}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/blog`} className="hover:text-electric-400 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-[200px] sm:max-w-xs">{title}</span>
        </nav>

        {coverImage && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-navy-800 mb-8">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}

        <header className="mb-8">
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Tag size={12} className="text-slate-500" />
              {post.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-navy-800/60 text-slate-400 text-xs border border-navy-600/40">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">{title}</h1>

          {excerpt && (
            <p className="text-slate-400 text-lg leading-relaxed mb-4">{excerpt}</p>
          )}

          <div className="flex items-center gap-4 flex-wrap text-slate-500 text-sm">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {t.blog.publishedOn} {formatDate(post.published_at, locale)}
              </span>
            )}
            {content && (
              <span>{readingTime(content, locale)}</span>
            )}
          </div>
        </header>

        <div className="border-t border-navy-700/50 mb-8" />

        <article className="prose dark:prose-invert prose-slate max-w-none prose-headings:font-bold dark:prose-headings:text-white prose-p:leading-relaxed prose-a:text-electric-400 prose-a:no-underline hover:prose-a:underline prose-code:text-electric-400 dark:prose-code:bg-navy-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none dark:prose-pre:bg-navy-800/80 dark:prose-pre:border dark:prose-pre:border-navy-600/40 prose-blockquote:border-l-electric-400 dark:prose-blockquote:text-slate-400 dark:prose-li:text-slate-300 dark:prose-strong:text-white dark:prose-hr:border-navy-700/50">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>

        <div className="mt-10 pt-8 border-t border-navy-700/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.blog.share}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800/60 border border-navy-600/50 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <Copy size={13} />
              {copied ? t.blog.copied : t.blog.copyLink}
            </button>
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800/60 border border-navy-600/50 text-slate-400 hover:text-white text-sm transition-colors"
            >
              {t.blog.shareOnX}
            </a>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-navy-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">{t.blog.relatedPosts}</h2>
            <div className="space-y-3">
              {relatedPosts.map((related) => {
                const relatedTitle = pickI18n(related.title_i18n, locale);
                return (
                  <Link
                    key={related.id}
                    href={`/${locale}/blog/${related.slug}`}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-navy-900/50 border border-navy-700/40 hover:border-electric-400/30 transition-colors group"
                  >
                    <span className="text-slate-300 group-hover:text-white transition-colors text-sm font-medium leading-snug">
                      {relatedTitle}
                    </span>
                    <ArrowRight size={14} className="flex-shrink-0 text-slate-600 group-hover:text-electric-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
