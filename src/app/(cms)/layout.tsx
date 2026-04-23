import CmsLayout from '@/components/templates/CMSLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CmsLayout>{children}</CmsLayout>;
}
