// Product workspace `[id]` — uses client component leaf layouts per section
// because the workspace shell depends on the current path.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
