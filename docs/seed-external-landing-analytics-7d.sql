-- =====================================================================
-- SEED analytics 7 ngày cho 1 landing NGOÀI (demo portal Tổng quan + Phễu)
-- ---------------------------------------------------------------------
-- Vì sao phải seed bằng SQL (không qua /v1/track):
--   • Mọi query analytics group theo `created_at` (lúc insert), KHÔNG theo
--     `occurred_at`. /track stamp created_at = now() ⇒ không backdate được
--     ⇒ không trải 7 ngày. Chỉ INSERT thẳng DB mới set được created_at.
--
-- Cách chạy:  psql "$DATABASE_URL" -f seed-external-landing-analytics-7d.sql
-- Idempotent: chạy lại sẽ xoá seed cũ của page rồi seed lại (tag _seed=demo7d).
-- Gỡ sạch:    DELETE FROM analytics_events
--               WHERE page_id = '<PAGE_ID>' AND dimensions->>'_seed' = 'demo7d';
--
-- event_type ↔ card (khớp reader contract internal/repository/analytics_event.go):
--   page_view    → Lượt xem, Khách(unique), visits, timeseries(theo ngày), Nguồn truy cập(utm_source)
--   scroll_depth → Engaged (metrics.scroll_pct ≥ 50)
--   block_view   → Theo section (dimensions.section_id)
--   click        → Click CTA (summary IN block_click,click) + funnel cta_clicks (click + cta_id) + card CTA
--   form_submit  → Chuyển đổi (conversions)
-- LƯU Ý: bảng Sales/Lead đọc bảng `leads` riêng — script này KHÔNG seed leads.
-- =====================================================================

DO $$
DECLARE
  v_page      uuid := '1a69ef99-5773-41e6-8bdf-466fd53e3cc1'; -- ⟵ ĐỔI page_id landing ngoài
  d           int;
  s           int;
  k           int;
  n_sessions  int;
  v_sid       text;
  v_vid       text;
  v_ts        timestamptz;
  v_utm       text;
  v_sec       text;
  v_cta       text;
  sections    text[] := ARRAY['hero','emblem','manifesto','process','services','works'];
  ctas        text[] := ARRAY['buy-now','contact','learn-more'];
  utms        text[] := ARRAY['google','facebook','','zalo']; -- '' ⇒ direct (utm_source vắng mặt)
BEGIN
  -- Idempotent: xoá seed cũ của đúng page này.
  DELETE FROM analytics_events
   WHERE page_id = v_page AND dimensions->>'_seed' = 'demo7d';

  FOR d IN 0..6 LOOP                                  -- d = số ngày trước (0 = hôm nay)
    n_sessions := 8 + d*3 + (random()*4)::int;        -- traffic tăng dần về gần đây
    FOR s IN 1..n_sessions LOOP
      v_sid := 'seed-' || d || '-' || s || '-' || substr(md5(random()::text),1,8);
      v_vid := 'seedv-' || substr(md5(v_sid),1,12);
      v_ts  := (CURRENT_DATE - d) + interval '8 hour' + (random() * interval '12 hour');
      v_utm := utms[1 + (random()*3)::int];

      -- page_view → views / unique / visits / timeseries / sources
      INSERT INTO analytics_events
        (visitor_id, session_id, event_type, page_id, dimensions, metrics, occurred_at, created_at)
      VALUES (v_vid, v_sid, 'page_view', v_page,
        jsonb_build_object('_seed','demo7d','page_path','/')
          || CASE WHEN v_utm = '' THEN '{}'::jsonb
                  ELSE jsonb_build_object('utm_source', v_utm,
                                          'referrer', 'https://'||v_utm||'.com') END,
        '{}'::jsonb, v_ts, v_ts);

      -- scroll_depth → engaged (≈60% cuộn ≥50%)
      INSERT INTO analytics_events
        (visitor_id, session_id, event_type, page_id, dimensions, metrics, occurred_at, created_at)
      VALUES (v_vid, v_sid, 'scroll_depth', v_page,
        jsonb_build_object('_seed','demo7d'),
        jsonb_build_object('scroll_pct', (30 + (random()*70)::int)::text),
        v_ts, v_ts);

      -- block_view × 3 → breakdown theo section
      FOR k IN 1..3 LOOP
        v_sec := sections[1 + (random()*(array_length(sections,1)-1))::int];
        INSERT INTO analytics_events
          (visitor_id, session_id, event_type, page_id, block_key, dimensions, metrics, occurred_at, created_at)
        VALUES (v_vid, v_sid, 'block_view', v_page, v_sec,
          jsonb_build_object('_seed','demo7d','section_id', v_sec),
          '{}'::jsonb, v_ts, v_ts);
      END LOOP;

      -- click CTA (≈40%) → summary clicks + funnel cta + card CTA
      IF random() < 0.40 THEN
        v_cta := ctas[1 + (random()*(array_length(ctas,1)-1))::int];
        INSERT INTO analytics_events
          (visitor_id, session_id, event_type, page_id, dimensions, metrics, occurred_at, created_at)
        VALUES (v_vid, v_sid, 'click', v_page,
          jsonb_build_object('_seed','demo7d','cta_id', v_cta),
          '{}'::jsonb, v_ts, v_ts);
      END IF;

      -- form_submit (≈12%) → conversions
      IF random() < 0.12 THEN
        INSERT INTO analytics_events
          (visitor_id, session_id, event_type, page_id, dimensions, metrics, occurred_at, created_at)
        VALUES (v_vid, v_sid, 'form_submit', v_page,
          jsonb_build_object('_seed','demo7d'),
          '{}'::jsonb, v_ts, v_ts);
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seeded analytics 7 ngày cho page %', v_page;
END $$;

-- Kiểm tra nhanh sau khi seed:
-- SELECT event_type, COUNT(*) FROM analytics_events
--  WHERE page_id = '1a69ef99-5773-41e6-8bdf-466fd53e3cc1' AND dimensions->>'_seed'='demo7d'
--  GROUP BY 1 ORDER BY 2 DESC;
