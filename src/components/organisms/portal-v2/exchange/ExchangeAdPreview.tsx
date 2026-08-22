'use client';

import { useTranslations } from 'next-intl';
import { useLayoutEffect, useState } from 'react';

import type { Device } from '@/components/modules/block-editor/types';
import { ExchangeDeviceStage } from '@/components/organisms/portal-v2/exchange/ExchangeDeviceStage';
import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';
import { adFormatPreviewSrc } from '@/lib/portal-v2/exchange/adFormats';

type ExchangeAdPreviewProps = {
  adFormatId: string;
  device: Device;
};

/**
 * Xem trước một định dạng quảng cáo bằng chính route công khai của nó,
 * `/rexer/ads/{id}?embed=1`.
 *
 * Dùng CHUNG `ExchangeDeviceStage` với block và landing page — một khung máy
 * duy nhất cho cả ba loại. `?embed=1` bảo trang ads bỏ chrome VÀ bỏ
 * `DeviceFrame` của riêng nó, nếu không sẽ là máy lồng trong máy. Device vẫn
 * phải truyền xuống vì `dv-mode-*` bên trong đổi layout của mấy format.
 *
 * Khác `ExchangeBlockPreview` một chỗ: trang đó không phát
 * `rexer-preview-ready`, nên lớp phủ tắt theo `onLoad`. Chấp nhận được vì nội
 * dung là JSX tĩnh cùng bundle — không có lượt gọi API nào chạy sau khi tải
 * để mà nhấp nháy như block.
 */
export const ExchangeAdPreview = ({
  adFormatId,
  device,
}: ExchangeAdPreviewProps) => {
  const t = useTranslations('portalV2.preview');
  const tExchange = useTranslations('portalV2.exchange');
  // `Device` của block-editor rộng hơn (có 'tablet'); trang ads chỉ biết hai
  // chế độ, nên mọi thứ không phải mobile đi về desktop.
  const frame = device === 'mobile' ? 'mobile' : 'desktop';
  const sessionKey = `${adFormatId}:${frame}`;
  const [loaded, setLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useLayoutEffect(() => {
    setLoaded(false);
    setShowOverlay(true);
  }, [sessionKey]);

  return (
    <ExchangeDeviceStage device={device} urlLabel={`/ads/${adFormatId}`}>
      <div className='absolute inset-0 overflow-hidden'>
        {showOverlay ? (
          <PreviewStageLoading
            className='absolute inset-0'
            label={t('previewLoading')}
            complete={loaded}
            onFinished={() => setShowOverlay(false)}
          />
        ) : null}
        <iframe
          key={sessionKey}
          title={tExchange('kindAd')}
          src={adFormatPreviewSrc(adFormatId, frame)}
          onLoad={() => setLoaded(true)}
          sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
          className='absolute inset-0 block size-full border-0 bg-transparent'
        />
      </div>
    </ExchangeDeviceStage>
  );
};
