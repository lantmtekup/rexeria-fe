import { ListSkeleton } from '@/components/molecules/skeletons/page-skeletons';

export default function Loading() {
  return (
    <div className='mx-auto w-full max-w-6xl p-6'>
      <ListSkeleton />
    </div>
  );
}
