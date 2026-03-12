import { AdminNav } from '@/components/admin/AdminNav';
import { ReviewEditor } from '@/components/admin/ReviewEditor';
import { getPublishedProjects } from '@/lib/projects';

export const metadata = { title: 'New review' };

export default async function NewReviewPage() {
  const projects = await getPublishedProjects(100);
  const publishedProjects = projects.map((p) => ({
    slug: p.slug,
    title: p.title_i18n?.es || p.title_i18n?.en || p.slug,
  }));

  return (
    <>
      <AdminNav />
      <ReviewEditor publishedProjects={publishedProjects} />
    </>
  );
}
