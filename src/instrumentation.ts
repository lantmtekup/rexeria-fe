export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { ensureInitialAdmin } =
    await import('@/server/init/ensureInitialAdmin');
  await ensureInitialAdmin();
}
