# BE Spec — Alpha Test Bundle

**Mục tiêu**: Chuẩn hoá toàn bộ tính năng BE cần triển khai cho giai đoạn **Alpha test** của ReXeR, bao gồm:

1. **Đăng ký bằng email/password** (`POST /v1/auth/register`) — FE đã có form, cần BE chuẩn hoá contract.
2. **Đăng nhập bằng Google (OAuth 2.0 + PKCE)** — UI placeholder đã có, BE & FE chưa nối handler.
3. **Feedback của user trong app** — kênh thu thập bug/đề xuất từ user Alpha; chưa có code BE/FE.

Tài liệu này là 1 nguồn duy nhất cho team BE implement; FE & QA cũng dùng làm chuẩn đối chiếu.

---

## 0. Quy ước chung

- **Base URL**: `/v1`
- **Convention**: `snake_case` JSON, UUID string IDs, ISO-8601 timestamps
- **Error body**: reuse `pkg_http.ErrorBody` `{ code, message, details?, request_id? }`
- **Session**: cookie httpOnly, `secure` (production), `sameSite=lax`, max-age 7 ngày
- **Public endpoints** (không yêu cầu cookie trước khi gọi): `/auth/register`, `/auth/google/start`, `/auth/google/callback`
- **Rate limit chung**: trừ khi nói khác, áp dụng theo IP qua API gateway

### 0.1. Resource: `User` (chung cho cả 2 flow)

| field             | type                                              | required | ghi chú                                                                  |
|-------------------|---------------------------------------------------|:--------:|--------------------------------------------------------------------------|
| `id`              | string (uuid)                                     |    ✓     | BE sinh                                                                  |
| `email`           | string (≤255, RFC 5322)                           |    ✓     | unique, trim, **lowercase**                                              |
| `display_name`    | string (≤120)                                     |    ✓     | hiển thị trong UI                                                        |
| `password_hash`   | string                                            |    —     | bcrypt cost ≥ 10 (ưu tiên 12); null nếu user chỉ dùng OAuth              |
| `principal_type`  | enum `user \| admin \| client_user`               |    ✓     | Alpha mặc định `user`                                                    |
| `status`          | enum `active \| pending \| suspended`             |    ✓     | Alpha: `active` ngay sau register/Google login                           |
| `created_at`      | string (date-time)                                |    ✓     |                                                                          |
| `updated_at`      | string (date-time)                                |    ✓     |                                                                          |

### 0.2. Resource: `Session`

| field          | type               | required | ghi chú                                          |
|----------------|--------------------|:--------:|--------------------------------------------------|
| `id`           | string (uuid)      |    ✓     | session id                                       |
| `expires_at`   | string (date-time) |    ✓     | mặc định 7 ngày                                  |
| `last_seen_at` | string (date-time) |    ✓     |                                                  |
| `created_at`   | string (date-time) |    ✓     |                                                  |

### 0.3. Resource: `AuthIdentity` (multi-provider)

Bảng tách giúp 1 user có thể link nhiều phương thức đăng nhập (password + Google + Apple…).

| field              | type                                              | required | ghi chú                                          |
|--------------------|---------------------------------------------------|:--------:|--------------------------------------------------|
| `id`               | string (uuid)                                     |    ✓     |                                                  |
| `user_id`          | string (uuid)                                     |    ✓     | FK → `users.id`                                  |
| `provider`         | enum `password \| google \| apple \| facebook`    |    ✓     | Alpha dùng `password` + `google`                |
| `provider_user_id` | string                                            |    ✓     | với `password` = user.id; với `google` = `sub`   |
| `email`            | string                                            |    —     | snapshot lúc link                                |
| `created_at`       | string (date-time)                                |    ✓     |                                                  |

**Unique constraints**:
- `(provider, provider_user_id)` unique
- `(user_id, provider)` unique

---

# Phần A — Đăng ký bằng email/password

## A.1. Tổng quan flow

```
┌──────────────┐    POST /api/rexer/auth/register   ┌──────────────┐
│  FE (Next)   │ ──────────────────────────────────►│  Next proxy  │
│  SignUpForm  │                                     │              │
└──────────────┘                                     └───────┬──────┘
                                                             │ POST /v1/auth/register
                                                             ▼
                                                     ┌──────────────┐
                                                     │  BE (Rexer)  │
                                                     │  - hash pass │
                                                     │  - create    │
                                                     │    user +    │
                                                     │    identity  │
                                                     │    (password)│
                                                     │  - issue     │
                                                     │    session   │
                                                     │  - (opt)     │
                                                     │    create    │
                                                     │    client    │
                                                     └──────────────┘
```

- FE submit `{ display_name, email, password, confirm_password }` → form validate → gọi `rexerApi.auth.register({ full_name, email, password })` (xem `src/components/modules/Auth/RexerSignUpForm.tsx:62`).
- Sau khi đăng ký thành công, FE redirect sang `/sign-in?registered=1&email=…` để user đăng nhập lần đầu (KHÔNG auto-login trong Alpha — xem A.4).

## A.2. Endpoint `POST /v1/auth/register`

- **Summary**: Tạo tài khoản end-user bằng email/password.
- **Security**: Public (no auth).
- **Rate limit**: 5 request / IP / phút (chống spam).
- **Body** `RegisterRequest`:

  ```json
  {
    "full_name": "Nguyễn Văn A",
    "email": "alpha.user@example.com",
    "password": "P@ssw0rd!",
    "company_name": "Acme JSC"
  }
  ```

- **Validation**:
  - `full_name`: required, 1–120 ký tự, trim.
  - `email`: required, RFC 5322, ≤ 255 ký tự, lowercase trước khi lưu.
  - `password`: required, **min 8 ký tự** (FE hiện validate min 6 — sẽ nâng lên 8 trước Alpha; xem checklist phần C).
  - `company_name`: optional, ≤ 200 ký tự.

- **Server logic**:
  1. Validate body.
  2. Check email tồn tại (case-insensitive). Nếu có → `AUTH_EMAIL_ALREADY_EXISTS`.
  3. Hash password bằng bcrypt cost 12.
  4. Tạo `User` (status=`active`) + `AuthIdentity (provider='password', provider_user_id=user.id)`.
  5. Nếu `company_name` có giá trị → tạo `Client` rỗng, `owner_id=user.id`.
  6. Tạo `Session` (expires +7d), trả về body. **Không** set cookie ở proxy (xem A.4).

- **Responses**:
  - `201` — `RegisterResponse`:
    ```json
    {
      "user": {
        "id": "u_01HX…",
        "email": "alpha.user@example.com",
        "display_name": "Nguyễn Văn A",
        "principal_type": "user",
        "status": "active",
        "created_at": "2026-05-07T03:00:00Z",
        "updated_at": "2026-05-07T03:00:00Z"
      },
      "session": {
        "id": "s_01HX…",
        "expires_at": "2026-05-14T03:00:00Z",
        "last_seen_at": "2026-05-07T03:00:00Z",
        "created_at": "2026-05-07T03:00:00Z"
      },
      "client": {
        "id": "c_01HX…",
        "name": "Acme JSC",
        "owner_id": "u_01HX…"
      }
    }
    ```
    - `client` **chỉ trả khi** có `company_name`.
  - `400` — `VALIDATION_ERROR`, `details` là field errors `[{ field, code, message }]`.
  - `409` — `AUTH_EMAIL_ALREADY_EXISTS`.
  - `429` — `RATE_LIMITED`.
  - `500` — `INTERNAL_ERROR`.

## A.3. Error codes (register)

| code                          | http | khi nào                                            |
|-------------------------------|:----:|----------------------------------------------------|
| `VALIDATION_ERROR`            | 400  | thiếu field / sai format                           |
| `AUTH_EMAIL_ALREADY_EXISTS`   | 409  | email trùng (so sánh sau khi lowercase + trim)     |
| `AUTH_PASSWORD_TOO_WEAK`      | 400  | < 8 ký tự, hoặc không đạt policy (sau Alpha)       |
| `RATE_LIMITED`                | 429  | quá ngưỡng IP                                      |
| `INTERNAL_ERROR`              | 500  | lỗi không xác định                                 |

## A.4. Cookie & Session (proxy layer)

- Proxy `POST /api/rexer/auth/register` (Next.js route) chuyển request sang BE và **không** set cookie session — khác với `/api/auth/login` đang set httpOnly cookie.
- Lý do: trong Alpha muốn ép user trải nghiệm flow login để kiểm thử cả 2 endpoint.
- Sau khi user đăng ký xong, FE redirect `/sign-in?registered=1&email=…` để hiển thị banner "Tạo tài khoản thành công, đăng nhập để tiếp tục".

> Khác biệt so với Google login (Phần B): Google flow **có** set cookie sau exchange vì user đã consent qua Google, không cần ép login lại.

---

# Phần B — Đăng nhập bằng Google qua Firebase Auth

## B.1. Quyết định thiết kế

Dự án đã bật **Firebase Authentication** (project `Rexer-AI`, provider Google = Enabled). Thay vì BE tự handle OAuth Authorization Code + PKCE, chúng ta để **Firebase lo phần OAuth với Google**, BE chỉ verify ID token Firebase trả về.

**Lợi ích**:
- Bỏ được toàn bộ logic state/PKCE/code-exchange/JWKS bên BE.
- Thêm Apple/Facebook về sau ≈ bật 1 toggle trên Firebase + map provider trong code.
- Refresh token, multi-device, password reset của Firebase free.

**Trade-off**: phụ thuộc Firebase (Google) — nhưng với Alpha/MVP là chấp nhận được.

## B.2. Tổng quan flow

```
┌────────────┐  1. signInWithPopup(GoogleAuthProvider)  ┌──────────────┐
│  FE        │ ────────────────────────────────────────►│  Firebase    │
│  (button)  │  ← UserCredential                         │  Auth        │
└─────┬──────┘                                            └──────────────┘
      │ 2. user.getIdToken()  → Firebase ID token (JWT)
      ▼
┌────────────┐  3. POST /v1/auth/firebase/login   ┌──────────────┐
│  FE        │  { id_token, provider, redirect_after}│  BE          │
│            │ ─────────────────────────────────────►│  - verifyIdToken
│            │  ← { user, session, is_new_user, … }  │  - upsert user
└────────────┘                                        │  - issue session
                                                      └──────────────┘
```

- **Bước 1–2**: hoàn toàn FE + Firebase SDK, BE không can thiệp.
- **Bước 3**: BE verify Firebase ID token bằng **Firebase Admin SDK**, đọc claims (`uid`, `email`, `email_verified`, `name`, `picture`, `firebase.identities`), upsert user trong DB chính, tạo session cookie.

## B.3. Provider config

### B.3.1. Firebase project

- Console: Firebase project `Rexer-AI` → **Authentication → Sign-in method**.
- **Google** provider: Enabled ✓ (đã có).
- **Authorized domains**: thêm `localhost` (dev), `<fe-host-staging>`, `<fe-host-prod>`.

### B.3.2. ENV BE

| ENV (BE)                              | mô tả                                                                  |
|---------------------------------------|------------------------------------------------------------------------|
| `FIREBASE_PROJECT_ID`                 | `rexer-ai` (lấy từ Firebase console → Project settings → General)      |
| `FIREBASE_SERVICE_ACCOUNT_JSON`       | nội dung service account JSON (string) HOẶC path tới file              |
| `FIREBASE_ALLOWED_DOMAINS`            | (tùy chọn) CSV domain whitelist email cho Alpha (vd. `tekup.vn,...`)   |

> Service account JSON: Firebase console → Project settings → **Service accounts** → Generate new private key. KHÔNG commit file này; deploy qua secret manager.

### B.3.3. ENV FE

| ENV (FE) — `.env.local`                          | nguồn                                                  |
|--------------------------------------------------|--------------------------------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY`                   | Firebase console → Project settings → General → Web app |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`               | `<project>.firebaseapp.com`                            |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`                | `rexer-ai`                                             |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`            | `<project>.firebasestorage.app` (hoặc `<project>.appspot.com` với project cũ) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`       | (numeric)                                              |
| `NEXT_PUBLIC_FIREBASE_APP_ID`                    | `1:…:web:…`                                            |

> Tất cả `NEXT_PUBLIC_FIREBASE_*` an toàn để ship browser — Firebase API key không phải secret; phía bảo mật là verify ID token ở BE + Authorized domains.

## B.4. Endpoint `POST /v1/auth/firebase/login`

- **Summary**: FE gửi Firebase ID token (lấy từ `signInWithPopup`); BE verify, upsert user, tạo session.
- **Security**: Public.
- **Rate limit**: 20 req / IP / phút.
- **Body** `FirebaseLoginRequest`:
  ```json
  {
    "id_token": "eyJhbGciOiJSUzI1NiIs…",
    "provider": "google.com",
    "redirect_after": "/home"
  }
  ```
- **Required**: `id_token`. `provider` & `redirect_after` optional (analytics + UX hint).

- **Server logic**:
  1. Verify token: `await admin.auth().verifyIdToken(id_token, /*checkRevoked*/ true)`. Sai/expired → `AUTH_FIREBASE_TOKEN_INVALID`.
  2. Đọc claims:
     - `uid` (Firebase UID — dùng làm `provider_user_id`)
     - `email`, `email_verified`
     - `name`, `picture`
     - `firebase.sign_in_provider` (vd. `google.com`)
     - `firebase.identities['google.com']` → mảng email/sub Google nếu cần verify lại nguồn.
  3. Nếu `email_verified == false` → `AUTH_OAUTH_EMAIL_NOT_VERIFIED`.
  4. Nếu `FIREBASE_ALLOWED_DOMAINS` set & domain của `email` không thuộc → `AUTH_OAUTH_DOMAIN_NOT_ALLOWED`.
  5. Upsert theo `email` (case-insensitive):
     - User chưa tồn tại → tạo mới: `display_name = name`, `status = active`, link `auth_identities (provider='firebase', provider_user_id=uid)`.
     - User đã tồn tại với cùng email & chưa link Firebase → tự link, trả `is_new_user=false, linked=true`.
     - User đã link Firebase → trả thẳng.
  6. Tạo `Session`, set cookie httpOnly qua proxy.

- **Responses**:
  - `200` — `FirebaseLoginResponse`:
    ```json
    {
      "user": {
        "id": "u_01HX…",
        "email": "alpha.user@example.com",
        "display_name": "Nguyễn Văn A",
        "principal_type": "user",
        "status": "active",
        "created_at": "2026-05-07T03:00:00Z",
        "updated_at": "2026-05-07T03:00:00Z"
      },
      "session": {
        "id": "s_01HX…",
        "expires_at": "2026-05-14T03:00:00Z",
        "last_seen_at": "2026-05-07T03:00:00Z",
        "created_at": "2026-05-07T03:00:00Z"
      },
      "is_new_user": true,
      "linked": false,
      "redirect_after": "/home"
    }
    ```
  - `400` — `VALIDATION_ERROR` (thiếu `id_token`)
  - `401` — `AUTH_FIREBASE_TOKEN_INVALID` (signature sai / expired / revoked)
  - `403` — `AUTH_OAUTH_EMAIL_NOT_VERIFIED`, `AUTH_OAUTH_DOMAIN_NOT_ALLOWED`
  - `409` — `AUTH_OAUTH_PROVIDER_CONFLICT`
  - `429` — `RATE_LIMITED`
  - `503` — `FIREBASE_NOT_CONFIGURED` (BE thiếu service account)

## B.5. Endpoint `POST /v1/auth/firebase/unlink` (skip Alpha)

- **Summary**: Gỡ liên kết Firebase khỏi tài khoản; chỉ cho phép nếu còn ≥ 1 phương thức đăng nhập khác.
- **Security**: CookieAuth.
- **Responses**: `200 { message }`; `409 AUTH_LAST_IDENTITY`.

> Trong Alpha có thể skip endpoint này. Bảng `auth_identities` đã có `provider='firebase'` thì tương lai chỉ cần thêm logic.

## B.6. Error codes (Firebase / OAuth)

| code                                  | http | khi nào                                              |
|---------------------------------------|:----:|------------------------------------------------------|
| `FIREBASE_NOT_CONFIGURED`             | 503  | BE thiếu service account / project ID                |
| `AUTH_FIREBASE_TOKEN_INVALID`         | 401  | ID token sai signature, expired hoặc đã revoke       |
| `AUTH_OAUTH_EMAIL_NOT_VERIFIED`       | 403  | `email_verified=false` từ Firebase                   |
| `AUTH_OAUTH_DOMAIN_NOT_ALLOWED`       | 403  | email không thuộc whitelist Alpha                    |
| `AUTH_OAUTH_PROVIDER_CONFLICT`        | 409  | email đã link provider khác (sau Alpha)              |
| `RATE_LIMITED`                        | 429  | quá ngưỡng                                           |

## B.7. Bảo mật

- BE **bắt buộc** verify ID token bằng Firebase Admin SDK (`verifyIdToken`) — không tin client.
- Bật `checkRevoked=true` để phát hiện token bị revoke (vd. user đổi password).
- `redirect_after` phải là same-origin path (`^\/(?!\/)` ); reject URL tuyệt đối.
- Session cookie: `httpOnly`, `secure` (production), `sameSite=lax`, max-age 7 ngày.
- Authorized domains trong Firebase console = whitelist origin được phép gọi popup; cập nhật khi thêm host mới.
- Log `request_id` + Firebase `uid` cho mọi exchange fail để debug.

---

# Phần C — User Feedback (trong app)

## C.1. Bối cảnh & mục tiêu

- Số user Alpha: ~20–50, dùng nhiều module (Auth, Products, Canvas, Campaign).
- Cần kênh **trong sản phẩm** để user phản hồi nhanh — không phải mở Slack/email riêng.
- Yêu cầu phi chức năng:
  - Đính kèm context tự động: `page_url`, `user_agent`, `app_version`, `user_id`, `session_id`.
  - Cho phép đính kèm **screenshot** (1 ảnh, ≤ 5 MB).
  - Team có thể export feedback ra CSV để triage ngoài tool (Linear/Notion).
- Không yêu cầu real-time notify trong Alpha (Slack webhook là **stretch goal** — xem D.4).

## C.2. Resource: `Feedback`

| field            | type                                                          | required | ghi chú                                                                          |
|------------------|---------------------------------------------------------------|:--------:|----------------------------------------------------------------------------------|
| `id`             | string (uuid)                                                 |    ✓     | BE sinh                                                                          |
| `user_id`        | string (uuid)                                                 |    ✓     | từ session; null nếu mở public anonymous (chưa bật Alpha)                        |
| `client_id`      | string (uuid)                                                 |    —     | client đang active (nếu user thuộc workspace)                                    |
| `category`       | enum `bug \| improvement \| question \| praise \| other`      |    ✓     | user chọn từ dropdown                                                            |
| `severity`       | enum `low \| medium \| high \| critical`                      |    —     | chỉ áp dụng khi `category=bug`; default `medium`                                 |
| `title`          | string (≤140)                                                 |    —     | optional; nếu thiếu BE sinh từ `message[0:80] + "…"`                             |
| `message`        | string (≤4000)                                                |    ✓     | nội dung chính                                                                   |
| `rating`         | int (1–5)                                                     |    —     | NPS-style; chỉ hiện khi `category ∈ {praise, improvement}`                       |
| `page_url`       | string (≤2048)                                                |    ✓     | URL nơi user submit                                                              |
| `user_agent`     | string (≤512)                                                 |    ✓     | `navigator.userAgent`                                                            |
| `app_version`    | string (≤32)                                                  |    —     | git sha hoặc package.json `version`                                              |
| `screenshot_id`  | string (uuid)                                                 |    —     | FK → `media.id` (reuse module Media hiện có)                                     |
| `meta`           | object (≤4 KB JSON)                                           |    —     | extra free-form (project_id đang xem, feature flag, …)                           |
| `status`         | enum `new \| triaged \| in_progress \| resolved \| wontfix`   |    ✓     | BE default `new`; admin update sau                                               |
| `internal_note`  | string (≤2000)                                                |    —     | admin only; không trả cho user thường                                            |
| `created_at`     | string (date-time)                                            |    ✓     |                                                                                  |
| `updated_at`     | string (date-time)                                            |    ✓     |                                                                                  |

**Index gợi ý**:
- `(status, created_at DESC)` cho admin list
- `(user_id, created_at DESC)` cho query "feedback tôi đã gửi"
- `(category, severity, created_at DESC)` cho triage bug

## C.3. Endpoints

### C.3.1. `POST /v1/feedback` — Submit feedback

- **Summary**: User gửi 1 feedback.
- **Security**: CookieAuth.
- **Rate limit**: 10 req / user / giờ.
- **Body** `CreateFeedbackRequest`:
  ```json
  {
    "category": "bug",
    "severity": "high",
    "title": "Canvas không lưu khi reload",
    "message": "Sau khi mình kéo block ảnh và reload page, layout mất hết...",
    "rating": null,
    "page_url": "https://app.rexer.ai/canvas/abcd-1234",
    "user_agent": "Mozilla/5.0 ...",
    "app_version": "0.4.2-1ee47a2",
    "screenshot_id": "m_01HX…",
    "meta": {
      "project_id": "p_01HX…",
      "canvas_template_id": "ct_01HX…"
    }
  }
  ```
- **Required**: `category`, `message`, `page_url`, `user_agent`. Mọi field khác optional.
- **Server-derived**:
  - `user_id`, `client_id`: lấy từ session.
  - `status` mặc định `new`.
  - `title`: nếu FE không gửi → BE auto-generate.
- **Responses**:
  - `201` — `FeedbackResponse` `{ feedback: Feedback }` (không trả `internal_note`)
  - `400` — `VALIDATION_ERROR`
  - `401` — chưa đăng nhập
  - `413` — `FEEDBACK_PAYLOAD_TOO_LARGE` (`message > 4000` hoặc `meta > 4 KB`)
  - `429` — `RATE_LIMITED`

### C.3.2. `GET /v1/feedback/me` — Feedback của tôi

- **Summary**: User xem lại các feedback đã gửi.
- **Security**: CookieAuth.
- **Query**: `status`, `category`, `page` (default 1), `limit` (default 20, max 100), `sort` (default `-created_at`).
- **Responses**: `200` — `FeedbackListResponse` `{ items: Feedback[], page, limit, total }` (không kèm `internal_note`).

### C.3.3. `GET /v1/admin/feedback` — Admin list

- **Summary**: Triage list cho team Alpha.
- **Security**: CookieAuth, role `admin`.
- **Query**: `status`, `category`, `severity`, `q` (full-text trên `title` + `message` ILIKE), `from`, `to` (ISO date filter trên `created_at`), `page`, `limit`, `sort`.
- **Responses**: `200` — `FeedbackListResponse` (kèm `internal_note`); `403` — `FORBIDDEN`.

### C.3.4. `PATCH /v1/admin/feedback/{id}` — Update status / note

- **Summary**: Admin đổi `status` hoặc thêm `internal_note`.
- **Security**: CookieAuth, role `admin`.
- **Body** `UpdateFeedbackRequest`:
  ```json
  {
    "status": "in_progress",
    "internal_note": "Linear ENG-412"
  }
  ```
- **Responses**: `200` — `FeedbackResponse`; `404` — `FEEDBACK_NOT_FOUND`.

### C.3.5. `GET /v1/admin/feedback/export.csv` — Export CSV

- **Summary**: Export filtered list cho triage offline.
- **Security**: CookieAuth, role `admin`.
- **Query**: cùng C.3.3.
- **Responses**: `200` — `text/csv`; cột: `id, created_at, user_email, category, severity, status, title, message, page_url, app_version`.

## C.4. Error codes (feedback)

| code                            | http | khi nào                                       |
|---------------------------------|:----:|-----------------------------------------------|
| `VALIDATION_ERROR`              | 400  | sai format / thiếu field                      |
| `FEEDBACK_PAYLOAD_TOO_LARGE`    | 413  | `message > 4000` ký tự, `meta > 4 KB`         |
| `FEEDBACK_NOT_FOUND`            | 404  | id không tồn tại                              |
| `RATE_LIMITED`                  | 429  | quá ngưỡng                                    |
| `FORBIDDEN`                     | 403  | không phải admin (C.3.3, C.3.4, C.3.5)        |

---

# Phần D — Phạm vi Alpha & Action items

## D.1. Bao gồm trong Alpha

**Auth**:
- Đăng ký bằng email/password (Phần A).
- Đăng nhập / đăng ký bằng Google qua **Firebase Auth** (1 nút, auto-detect new vs returning user).
- Tự link Firebase identity vào tài khoản email/password đã tồn tại (cùng email, case-insensitive).
- Domain whitelist (optional, qua env `FIREBASE_ALLOWED_DOMAINS`).

**Feedback**:
- Submit + list feedback (user & admin).
- Đính kèm 1 screenshot.
- Export CSV.
- Auto-context (page_url, user_agent, app_version, meta).

## D.2. Loại trừ trong Alpha

**Auth**:
- Email verification (gửi link xác thực, set `status = pending` trước khi `active`).
- Captcha / reCAPTCHA.
- **Facebook & Apple sign-in** (UI ẩn — chỉ hiển thị nút Google; bật sau Alpha qua Firebase console + map provider).
- Unlink Firebase identity (endpoint B.5) — chỉ migrate schema sẵn.
- Đa workspace / mời đồng đội — chỉ tạo 1 `Client` duy nhất từ `company_name`.
- Password policy phức tạp (chỉ kiểm min length).
- Re-authentication / step-up auth.

**Feedback**:
- Anonymous feedback (chưa login) — sẽ thêm sau Alpha nếu cần.
- Comment / threading — admin trả lời user trong app.
- Email notification cho user khi `status` đổi.
- In-app inbox cho user (chỉ có list `/feedback/me` cơ bản).
- Voting / upvote feedback (Canny-style).
- Tự động tạo Linear issue.

## D.3. Action items

| #  | Hạng mục                                                                          | Owner   | Trạng thái |
|----|-----------------------------------------------------------------------------------|:-------:|:----------:|
| 1  | BE: implement `POST /v1/auth/register` đúng contract A.2                          |  BE     |     ☑      |
| 2  | BE: rate-limit register 5/min/IP                                                  |  BE     |     ☑      |
| 3  | BE: bảng migration `auth_identities` (đầy đủ unique constraints)                  |  BE     |     ☑      |
| 4  | BE: implement `POST /v1/auth/firebase/login` (verify Firebase ID token)        |  BE     |     ☑      |
| 5  | BE: install Firebase Admin SDK + load service account; bảng `auth_identities` thêm `provider='firebase'` | BE | ☑ |
| 6  | BE: schema migration `feedback` + 5 endpoints C.3                                 |  BE     |     ☑      |
| 7  | BE: rate-limit feedback 10/h/user                                                 |  BE     |     ☑      |
| 8  | BE: role-based middleware cho `/admin/feedback*`                                  |  BE     |     ☑      |
| 9  | DevOps: tạo service account Firebase, set `FIREBASE_PROJECT_ID` + service account JSON | DevOps  |     ☐      |
| 10 | DevOps: set ENV `NEXT_PUBLIC_FIREBASE_*` cho FE; thêm authorized domains trên Firebase | DevOps  |     ☐      |
| 11 | DevOps: set `NEXT_PUBLIC_ALPHA=1` cho env Alpha (gate FAB feedback)               | DevOps  |     ☐      |
| 12 | FE: nâng `password.min` từ 6 → 8 (`RexerSignUpForm.tsx:38`)                       |  FE     |     ☑      |
| 13 | FE: thêm field `company_name` (optional) vào sign-up form                         |  FE     |     ☑      |
| 14 | FE: handler trên `SocialLoginButtons` dùng `signInWithPopup`, **ẩn Facebook & Apple** |  FE     |     ☑      |
| 15 | FE: init Firebase SDK ở `src/lib/firebase.ts`                                     |  FE     |     ☑      |
| 16 | FE: thêm `firebaseLogin`, `feedback.*`, `adminFeedback.*` vào `endpoints.ts` + types | FE | ☑ |
| 17 | FE: `<FeedbackDialog />` + FAB (gate qua `NEXT_PUBLIC_ALPHA`)                     |  FE     |     ☑      |
| 18 | FE: tích hợp upload Media (init/raw/complete) cho screenshot feedback             |  FE     |     ☑      |
| 19 | FE: Admin Triage page `/admin/feedback`                                           |  FE     |     ☑      |
| 20 | FE: dịch error code mới (`AUTH_EMAIL_ALREADY_EXISTS`, `AUTH_OAUTH_*`, `FEEDBACK_*`) |  FE   |     ☑      |
| 21 | QA: test plan auth (register + Firebase Google: new/returning/link/error/domain block/popup blocked) |  QA  | ☐ |
| 22 | QA: test plan feedback (submit, screenshot, rate-limit, CSV export, admin patch)  |  QA     |     ☐      |

## D.4. Stretch goals (sau Alpha hoặc nếu kịp)

| # | Hạng mục                                                                            | Ưu tiên |
|---|-------------------------------------------------------------------------------------|:-------:|
| 1 | Slack webhook khi có feedback `category=bug, severity ∈ {high, critical}`           |   P1    |
| 2 | Auto-screenshot (`html2canvas`) cho desktop                                         |   P2    |
| 3 | Tag feedback bằng feature flag (vd. `flag:canvas-v2`)                               |   P2    |
| 4 | Linear bridge: tạo issue từ admin UI                                                |   P3    |
| 5 | Unlink Firebase identity (endpoint B.5) khi user có ≥ 2 phương thức đăng nhập       |   P2    |
| 6 | Bật Facebook + Apple trên Firebase console + thêm provider mapping ở FE             |   P2    |

---

# Phần E — Frontend integration (tham khảo)

## E.1. Init Firebase SDK

`src/lib/firebase.ts` (singleton):

```ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const getFirebaseApp = () =>
  getApps()[0] ?? initializeApp(firebaseConfig);
export const getFirebaseAuth = () => getAuth(getFirebaseApp());
```

## E.2. Wiring nút Google trong `SocialLoginButtons`

```ts
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

async function handleGoogle() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const cred = await signInWithPopup(auth, provider);
  const idToken = await cred.user.getIdToken();

  const res = await rexerApi.auth.firebaseLogin({
    id_token: idToken,
    provider: 'google.com',
    redirect_after: '/home',
  });

  await fetch('/api/auth/session-set', { method: 'POST', credentials: 'include' });
  router.replace(res.redirect_after ?? (res.is_new_user ? '/onboarding' : '/home'));
}
```

> **Không cần callback page** — Firebase popup tự đóng và trả `UserCredential` trực tiếp về JS.

## E.3. Endpoints client (TS)

Bổ sung vào `src/services/rexer/endpoints.ts`:

```ts
// block `auth`
firebaseLogin: (body: FirebaseLoginRequest) =>
  rx<FirebaseLoginResponse>('/auth/firebase/login', { method: 'POST', body }),

// block mới `feedback`
feedback: {
  create: (body: CreateFeedbackRequest) =>
    rx<FeedbackResponse>('/feedback', { method: 'POST', body }),
  myList: (query?: { status?: string; category?: string; page?: number; limit?: number }) =>
    rx<FeedbackListResponse>('/feedback/me', { query }),
},
adminFeedback: {
  list: (query?: AdminFeedbackQuery) =>
    rx<FeedbackListResponse>('/admin/feedback', { query }),
  update: (id: string, body: UpdateFeedbackRequest) =>
    rx<FeedbackResponse>(`/admin/feedback/${id}`, { method: 'PATCH', body }),
  exportCsv: (query?: AdminFeedbackQuery) =>
    rx<Blob>('/admin/feedback/export.csv', { query, responseType: 'blob' }),
},
```

Types vào `src/services/rexer/types.ts`:

```ts
export interface FirebaseLoginRequest {
  id_token: string;
  provider?: 'google.com' | 'apple.com' | 'facebook.com';
  redirect_after?: string;
}

export interface FirebaseLoginResponse {
  user: RxUser;
  session: RxSession;
  is_new_user: boolean;
  linked: boolean;
  redirect_after?: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  client_id?: string;
  category: 'bug' | 'improvement' | 'question' | 'praise' | 'other';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  message: string;
  rating?: number;
  page_url: string;
  user_agent: string;
  app_version?: string;
  screenshot_id?: string;
  meta?: Record<string, unknown>;
  status: 'new' | 'triaged' | 'in_progress' | 'resolved' | 'wontfix';
  internal_note?: string; // admin only
  created_at: string;
  updated_at: string;
}
export type CreateFeedbackRequest = Omit<Feedback, 'id' | 'user_id' | 'client_id' | 'status' | 'internal_note' | 'created_at' | 'updated_at'>;
export interface UpdateFeedbackRequest { status?: Feedback['status']; internal_note?: string; }
export interface FeedbackResponse { feedback: Feedback; }
export interface FeedbackListResponse { items: Feedback[]; page: number; limit: number; total: number; }
```

## E.4. Cookie session

| Endpoint                                  | Proxy set cookie?                          |
|-------------------------------------------|--------------------------------------------|
| `POST /api/rexer/auth/register`           | **Không** — ép user login lại sau register |
| `POST /api/auth/login`                    | Có (đã có sẵn)                             |
| `POST /api/rexer/auth/firebase/login`  | **Có** — user đã consent qua Firebase popup |

## E.5. Feedback FAB & Dialog

- **Floating Feedback Button** ở góc phải-dưới mọi page (trừ public canvas viewer):
  - Chỉ hiển thị khi `process.env.NEXT_PUBLIC_ALPHA === '1'` hoặc `user.email` thuộc whitelist domain Alpha.
  - Click → mở `<FeedbackDialog />`.
- **Dialog** gồm:
  - Dropdown `category` (default `bug`).
  - Slider/Radio `severity` (chỉ hiện khi `category=bug`).
  - Textarea `message` (≥ 20 ký tự client validate).
  - Star rating 1–5 (chỉ khi `praise|improvement`).
  - Nút "Đính kèm screenshot" → reuse `useUploadAndBind` từ `src/services/rexer/use-upload-and-bind.ts` để init upload Media, lấy `screenshot_id`.
  - Nút "Chụp màn hình hiện tại" (stretch — `html2canvas` hoặc `getDisplayMedia`).
  - Submit → `rexerApi.feedback.create({...})`.
- **Auto-collected context** (FE tự thêm vào body):
  ```ts
  {
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
    meta: {
      project_id: routeParams.projectId,
      canvas_template_id: routeParams.canvasTemplateId,
      locale: i18n.locale,
    }
  }
  ```

---

# Phần F — References

- FE form đăng ký: `src/components/modules/Auth/RexerSignUpForm.tsx`
- FE page đăng ký: `src/app/(auth)/sign-up/page.tsx`
- FE Social UI placeholder: `src/components/modules/Auth/SocialLoginButtons.tsx`
- FE login flow tham chiếu (cookie set): `src/app/api/auth/login/route.ts`
- API client: `src/services/rexer/endpoints.ts:127` (block `auth`)
- Types: `src/services/rexer/types.ts:34` (`RegisterRequest`, `RegisterResponse`)
- Firebase init: `src/lib/firebase.ts`
- Media upload reuse cho screenshot feedback: `src/services/rexer/use-upload-and-bind.ts`
- QA test plan (cập nhật khi triển khai): `docs/qa-test-plan.md`
- MVP spec gốc: `docs/rexerai-mvp-spec.md` (UC-01 Auth)
- Firebase Auth web: <https://firebase.google.com/docs/auth/web/google-signin>
- Firebase Admin verify ID token: <https://firebase.google.com/docs/auth/admin/verify-id-tokens>
