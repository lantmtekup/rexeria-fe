import AuthenticationLayout from '@/components/templates/AuthenticationLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthenticationLayout>{children}</AuthenticationLayout>;
}
