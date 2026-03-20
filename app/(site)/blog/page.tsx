import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';
import { BlogIndex } from './BlogIndex';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts, process, and lessons from building real software at Ceibo Labs.',
  openGraph: {
    title: `Blog | ${SITE.name}`,
    description: 'Thoughts, process, and lessons from building real software at Ceibo Labs.',
    images: [
      {
        url: `/api/og?type=blog&title=Blog&subtitle=Thoughts+from+Ceibo+Labs`,
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: `${SITE.url}/blog`,
  },
};

export default function BlogPage() {
  return <BlogIndex />;
}
