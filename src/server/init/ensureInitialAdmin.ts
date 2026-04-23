import 'server-only';

import bcrypt from 'bcryptjs';

import { connectDB } from '@/lib/mongodb';
import { AdminModel } from '@/models/Admin';
import { AdminRole } from '@/settings/enums';

export const ensureInitialAdmin = async (): Promise<void> => {
  const username = process.env.INIT_ADMIN_USERNAME?.trim();
  const email = process.env.INIT_ADMIN_EMAIL?.trim();
  const password = process.env.INIT_ADMIN_PASSWORD;
  const name = process.env.INIT_ADMIN_NAME?.trim();

  if (!username || !email || !password) {
    // eslint-disable-next-line no-console
    console.warn(
      '[ensureInitialAdmin] Skipped: set INIT_ADMIN_USERNAME, INIT_ADMIN_EMAIL, INIT_ADMIN_PASSWORD to auto-create the first admin.'
    );
    return;
  }

  try {
    await connectDB();
    const exists = await AdminModel.exists({});
    if (exists) {
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    await AdminModel.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hash,
      name: name || undefined,
      role: AdminRole.ADMIN,
    });
    // eslint-disable-next-line no-console
    console.info('[ensureInitialAdmin] Initial admin account created.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ensureInitialAdmin] Failed:', err);
  }
};
