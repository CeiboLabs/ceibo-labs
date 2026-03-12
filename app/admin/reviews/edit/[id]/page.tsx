import { notFound } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { ReviewEditor } from '@/components/admin/ReviewEditor';
import { getReviewById } from '@/lib/reviews';
import { getPublishedProjects } from '@/lib/projects';

export const metadata = { title: 'Edit review' };

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [review, projects] = await Promise.all([
    getReviewById(id),
    getPublishedProjects(100),
  ]);
  if (!review) notFound();

  const publishedProjects = projects.map((p) => ({
    slug: p.slug,
    title: p.title_i18n?.es || p.title_i18n?.en || p.slug,
  }));

  return (
    <>
      <AdminNav />
      <ReviewEditor initial={review} publishedProjects={publishedProjects} />
    </>
  );
}
