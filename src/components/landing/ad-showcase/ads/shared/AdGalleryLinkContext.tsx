'use client';

import * as React from 'react';

/** Khi ad render trong gallery, CTA trỏ tới trang chi tiết thay vì landing. */
export const AdGalleryLinkContext = React.createContext<string | null>(null);

export const useAdGalleryLink = () => React.useContext(AdGalleryLinkContext);
