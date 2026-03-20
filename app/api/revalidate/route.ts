import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { slug, type } = await request.json();

  if (!slug || !type) {
    return NextResponse.json({ error: 'Missing slug or type' }, { status: 400 });
  }

  if (type === 'blog') {
    revalidatePath(`/es/blog/${slug}`);
    revalidatePath(`/en/blog/${slug}`);
    revalidatePath('/es/blog');
    revalidatePath('/en/blog');
  } else if (type === 'project') {
    revalidatePath(`/es/projects/${slug}`);
    revalidatePath(`/en/projects/${slug}`);
  }

  return NextResponse.json({ revalidated: true, slug, type });
}
