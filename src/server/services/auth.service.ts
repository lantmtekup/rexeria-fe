import 'server-only';

import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

import { connectDB } from '@/lib/mongodb';
import { AdminModel } from '@/models/Admin';
import { HttpException } from '@/server/errors';
import { AdminRole, ErrorCode, HttpStatus } from '@/settings/enums';

const getTokenMaxAgeSec = (): number => {
  const n = Number(process.env.JWT_EXPIRES_IN_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 60 * 60 * 24 * 7;
};

export const authService = {
  async login(username: string, password: string) {
    await connectDB();
    const admin = await AdminModel.findOne({
      username: username.trim().toLowerCase(),
    }).select('+password');

    if (!admin?.password) {
      throw HttpException.unauthorized(ErrorCode.AUTH_CREDENTIALS_INVALID);
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      throw HttpException.unauthorized(ErrorCode.AUTH_CREDENTIALS_INVALID);
    }

    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
      throw HttpException.fail(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.AUTH_JWT_ENV_MISSING,
        { logMessage: 'Missing JWT_SECRET' }
      );
    }

    const maxAge = getTokenMaxAgeSec();
    const token = await new SignJWT({
      sub: String(admin._id),
      role: admin.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${maxAge}s`)
      .sign(new TextEncoder().encode(secret));

    return {
      token,
      maxAge,
      admin: {
        id: String(admin._id),
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  },

  async setup(
    setupKey: string,
    input: {
      username?: string;
      email?: string;
      password?: string;
      name?: string;
    }
  ) {
    const expected = process.env.SETUP_SECRET?.trim();
    if (!expected) {
      throw HttpException.forbidden(ErrorCode.AUTH_SETUP_DISABLED, {
        logMessage: 'SETUP_SECRET not set',
      });
    }
    if (setupKey !== expected) {
      throw HttpException.unauthorized(ErrorCode.AUTH_SETUP_KEY_INVALID);
    }

    const { username, email, password, name } = input;
    if (!username?.trim() || !email?.trim() || !password) {
      throw HttpException.badRequest(ErrorCode.AUTH_SETUP_FIELDS_REQUIRED);
    }

    await connectDB();
    const exists = await AdminModel.exists({});
    if (exists) {
      throw HttpException.conflict(ErrorCode.AUTH_ADMIN_ALREADY_EXISTS);
    }

    const hash = await bcrypt.hash(password, 12);
    await AdminModel.create({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hash,
      name: name?.trim(),
      role: AdminRole.ADMIN,
    });
  },
};
