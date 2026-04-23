import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { EmptyState } from '@/components/molecules/EmptyState';

function AiOrb() {
  return (
    <div
      aria-hidden
      className='relative mx-auto size-64'
      style={{
        background:
          'radial-gradient(circle at 30% 30%, #c9f0ff 0%, #b9d8ff 30%, #d9c4ff 55%, transparent 70%)',
        filter: 'blur(8px)',
        borderRadius: '9999px',
      }}
    />
  );
}

export default function AiAgentsStartPage() {
  return (
    <div className='flex h-full flex-1 items-center justify-center'>
      <div className='flex flex-col items-center gap-8'>
        <AiOrb />
        <EmptyState
          title='AI-Agents'
          description={
            <>
              Select your product or create a new
              <br />
              one to get started with AI-Agents.
            </>
          }
          actions={
            <>
              <Button asChild variant='pill-light' size='md'>
                <Link href='/product'>Select product</Link>
              </Button>
              <Button asChild variant='pill' size='md'>
                <Link href='/ai-agents/new-product/information'>
                  <Plus className='size-4' /> Create new product
                </Link>
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}
