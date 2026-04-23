'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

export default function GlobalError({ error }: GlobalErrorProps) {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
