/**
 * Minimal chrome-free layout for Exchange device-frame iframes.
 * No Portal Shell — the parent stage supplies the phone / desktop chrome.
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
