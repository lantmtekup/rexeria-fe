import { rexerApi } from '@/services/rexer/endpoints';

/**
 * Danh sách chiến dịch THẬT, rút gọn còn `{id, name}` — dùng cho dropdown.
 *
 * Thay `campaignBoard.ts`, thứ dựng nguyên `CampaignView` cho màn Campaigns.
 * Màn đó nay chạy trên `MOCK_CAMPAIGNS` nên không cần nữa, nhưng Automation
 * thì cần id THẬT: `POST /automations` tra `campaign_id` trong DB rồi trả 404
 * nếu không thấy, nên một id mock ở đây là một lỗi 404 lúc bấm nút.
 *
 * Giữ đúng phần Automation dùng thay vì bê nguyên file cũ: `CampaignView` và
 * `mapCampaign` đã bị nhánh journey viết lại, kéo theo cả một chuỗi phụ thuộc
 * mà dropdown này không đụng tới.
 */

const PAGE_LIMIT = 100;

export type CampaignOption = { id: string; name: string };

export type CampaignOptionsResult = {
  items: CampaignOption[];
  /** Hỏng thì dropdown rỗng — nói ra, đừng để đọc như "chưa có chiến dịch nào". */
  error: string | null;
};

export const fetchCampaignOptions = async (
  query: {
    brandId?: string | null;
  } = {}
): Promise<CampaignOptionsResult> => {
  try {
    const res = await rexerApi.campaigns.list({
      page: 1,
      limit: PAGE_LIMIT,
      ...(query.brandId ? { brand_id: query.brandId } : {}),
    });
    return {
      items: (res.items ?? []).map(c => ({
        id: c.id,
        name: c.name ?? c.id,
      })),
      error: null,
    };
  } catch (err) {
    return {
      items: [],
      error: err instanceof Error ? err.message : 'Failed to load campaigns',
    };
  }
};
