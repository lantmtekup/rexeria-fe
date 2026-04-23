import 'server-only';

import { NextRequest } from 'next/server';

import { sendError, sendSuccess, sendZodError } from '@/server/response';
import { authService } from '@/server/services/auth.service';
import { loginBodySchema, setupBodySchema } from '@/server/validation/auth';
import { constants } from '@/settings/constants';
import { HttpStatus } from '@/settings/enums';

export const authController = {
  async login(req: NextRequest) {
    try {
      const raw = await req.json();
      const parsed = loginBodySchema.safeParse(raw);
      if (!parsed.success) {
        return sendZodError(parsed.error);
      }

      const { username, password } = parsed.data;
      const { token, maxAge, admin } = await authService.login(
        username,
        password
      );

      const response = sendSuccess(admin, 'Đăng nhập thành công');
      response.cookies.set(constants.ACCESS_TOKEN, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
      return response;
    } catch (err) {
      return sendError(err);
    }
  },

  async logout() {
    try {
      const response = sendSuccess(null, 'Đăng xuất thành công');
      response.cookies.set(constants.ACCESS_TOKEN, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    } catch (err) {
      return sendError(err);
    }
  },

  async setup(req: NextRequest) {
    try {
      const raw = await req.json();
      const parsed = setupBodySchema.safeParse(raw);
      if (!parsed.success) {
        return sendZodError(parsed.error);
      }

      const { setupKey, username, email, password, name } = parsed.data;
      await authService.setup(setupKey, { username, email, password, name });

      return sendSuccess(null, 'Admin đã được tạo thành công', {
        status: HttpStatus.CREATED,
      });
    } catch (err) {
      return sendError(err);
    }
  },
};
