import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/admin/AdminNav';
import { PostEditor } from '@/components/admin/PostEditor';

export const metadata = { title: 'Edit post' };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('id, slug, tags, cover_image_url, cover_image_url_i18n, status, title_i18n, excerpt_i18n, content_i18n')
    .eq('id', id)
    .single();

  if (!post) { notFound(); return; }

  return (
    <>
      <AdminNav />
      <PostEditor
        initial={{
          id: post.id,
          slug: post.slug,
          tags: post.tags as string[],
          cover_image_url: post.cover_image_url ?? '',
          cover_image_url_i18n: post.cover_image_url_i18n as Record<string, string> | null,
          status: post.status as 'draft' | 'published',
          title_i18n: post.title_i18n as Record<string, string> | null,
          excerpt_i18n: post.excerpt_i18n as Record<string, string> | null,
          content_i18n: post.content_i18n as Record<string, string> | null,
        }}
      />
    </>
  );
}
