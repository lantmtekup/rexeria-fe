import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function Redirector({ params }: PageProps) {
  const { productId } = await params;
  redirect(`/ai-agents/${productId}/marketing/m1/discovery`);
}
