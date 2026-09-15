import { cookies } from 'next/headers';

import { constants } from '@/settings/constants';

/**
 * Có cookie phiên hay không, đọc ở server component.
 *
 * CỐ Ý không verify chữ ký JWT ở đây. Middleware đã làm việc đó cho mọi route
 * được bảo vệ; còn `/portal-v2/exchange` nay là route CÔNG KHAI, nên câu hỏi ở
 * đây không phải "người này là ai" mà chỉ là "nên gọi đường có phiên hay đường
 * công khai". Đoán sai không mở ra quyền gì: cookie hỏng thì BE trả 401 và
 * `fetchExchangeCatalog` tự rơi về đường công khai (xem `withPublicFallback`).
 *
 * Nói cách khác giá trị này lái CÁCH GỌI, không lái QUYỀN. Đừng dùng nó để
 * quyết định ai được đọc/ghi cái gì — phần đó thuộc về BE.
 */
export const hasServerSession = async (): Promise<boolean> => {
  const jar = await cookies();
  return Boolean(jar.get(constants.ACCESS_TOKEN)?.value);
};
