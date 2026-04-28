# BE API Spec — Products & Product Categories

**Mục tiêu**: bổ sung resource `Products` (và `ProductCategories`) vào ReXeR Backend để FE triển khai trang quản lý sản phẩm (`/product/[id]/information`) theo mô hình tương tự Shopify.

**Base**: `/v1` (same as current)
**Auth**: `CookieAuth` — giống các endpoint hiện có.
**Convention**: `snake_case` JSON, UUID string IDs, ISO-8601 timestamps, thống nhất với hiện trạng Swagger.
**Error body**: reuse `pkg_http.ErrorBody` `{ code, message, details?, request_id? }`.

---

## 1. Resource: `Product`

### 1.1. Entity

| field              | type                                         | required | ghi chú                                                                 |
|--------------------|----------------------------------------------|:--------:|-------------------------------------------------------------------------|
| `id`               | string (uuid)                                | ✓        | do BE sinh                                                              |
| `name`             | string (≤255)                                | ✓        | tên sản phẩm                                                            |
| `slug`             | string (≤255)                                | —        | auto-generate từ `name` nếu FE không gửi; unique theo `client_id`       |
| `sku`              | string (≤64)                                 | —        | unique nếu có; `null` nếu chưa set                                      |
| `category_id`      | string (uuid)                                | —        | FK → `product_categories.id`                                            |
| `description`      | string (text, ≤5000)                         | —        |                                                                         |
| `sizes`            | `string[]`                                   | —        | ví dụ `["S","M","L","XL"]`                                              |
| `colors`           | `{ name: string, hex: string }[]`            | —        | `hex` theo regex `^#[0-9A-Fa-f]{6}$`                                    |
| `variants`         | `string[]`                                   | —        | list biến thể tự do (có thể mở rộng object sau)                         |
| `ingredients`      | `string[]`                                   | —        | thành phần                                                              |
| `certifications`   | `string[]`                                   | —        | ví dụ `["ISO-9001","FDA"]`                                              |
| `features`         | `{ label: string, description: string }[]`   | —        | do AddCategoryDialog / AddFeatureDialog tạo                             |
| `media_ids`        | `string[]`                                   | —        | FK → `media.id` (resource Media hiện có)                                |
| `status`           | enum `draft \| active \| archived`           | —        | default `draft`                                                         |
| `client_id`        | string (uuid)                                | —        | optional; nếu thiếu = thuộc user đang login                             |
| `created_by`       | string (uuid)                                | ✓        | BE set                                                                  |
| `created_at`       | string (date-time)                           | ✓        |                                                                         |
| `updated_at`       | string (date-time)                           | ✓        |                                                                         |

### 1.2. Endpoints

#### `POST /v1/products` — Create

- **Summary**: Create product
- **Security**: CookieAuth
- **Body** `CreateProductRequest`:
  ```json
  {
    "name": "Samba OG Shoes",
    "slug": "samba-og-shoes",
    "sku": "SKU-0001",
    "category_id": "b2d1...",
    "description": "The Samba OG Shoes by Adidas...",
    "sizes": ["3.5 UK","4 UK","4.5 UK"],
    "colors": [
      {"name":"Black","hex":"#000000"},
      {"name":"White","hex":"#FFFFFF"}
    ],
    "variants": ["Product 01","Product 02"],
    "ingredients": ["Full grain leather","Suede"],
    "certifications": ["ISO-9001"],
    "features": [
      {"label":"Waterproof","description":"Rated IPX4"}
    ],
    "media_ids": ["m_01HXYZ..."],
    "status": "draft",
    "client_id": "c_01HXYZ..."
  }
  ```
- **Required**: `name`. Mọi field khác optional.
- **Responses**:
  - `201` — `ProductResponse` (xem 1.3)
  - `400` — validation (VALIDATION_ERROR, details là field errors)
  - `401` / `403`
  - `409` — `PRODUCT_SKU_DUPLICATE` hoặc `PRODUCT_SLUG_DUPLICATE`

#### `GET /v1/products` — List

- **Query**:
  - `status` — filter enum
  - `client_id` — filter
  - `category_id` — filter
  - `q` — search theo `name`/`sku`/`description` (ILIKE)
  - `page` (int, default `1`)
  - `limit` (int, default `20`, max `100`)
  - `sort` — optional (`-created_at` default)
- **Response** `ProductListResponse`:
  ```json
  {
    "items": [ { /* Product */ } ],
    "pagination": { "page":1, "limit":20, "total":57, "total_pages":3 }
  }
  ```

#### `GET /v1/products/{productId}` — Get by id

- **Response**: `ProductResponse`
- **404**: `PRODUCT_NOT_FOUND`

#### `PATCH /v1/products/{productId}` — Partial update

- **Body** `UpdateProductRequest`: tất cả field của Create đều optional. Chỉ gửi field cần đổi.
- **Response**: `ProductResponse`
- **409** giống Create (duplicate sku/slug).

> **Lưu ý:** prefer `PATCH` hơn `PUT` để tránh vô tình wipe field. Nếu BE muốn dùng `PUT`, document rõ semantics "replace all".

#### `DELETE /v1/products/{productId}` — Soft delete

- **Behaviour**: set `deleted_at`, `status = archived`. Không xoá hẳn.
- **Response**: `200` + `MessageBody` hoặc `204`.

### 1.3. Response shape

```json
// ProductResponse
{
  "product": { /* Product entity - tất cả field tại 1.1 */ },
  "category": { /* ProductCategory nhúng nếu có category_id */ },
  "media": [ { /* MediaAsset ngắn gọn nếu có media_ids */ } ]
}
```

Có thể giữ flat như các entity hiện có (Project trả `{ project, template,... }`) — theo BE style hiện tại.

---

## 2. Resource: `ProductCategory`

UI có dialog **Add new category** (`/components/dialogs/AddCategoryDialog.tsx`) — tạo category kèm danh sách "feature rows" `{label, description}[]`.

### 2.1. Entity

| field         | type                                       | required | ghi chú                  |
|---------------|--------------------------------------------|:--------:|--------------------------|
| `id`          | string (uuid)                              | ✓        |                          |
| `name`        | string (≤128)                              | ✓        | unique theo `client_id`  |
| `features`    | `{ label: string, description: string }[]` | —        | template feature mặc định|
| `client_id`   | string (uuid)                              | —        |                          |
| `created_at`  | date-time                                  | ✓        |                          |
| `updated_at`  | date-time                                  | ✓        |                          |

### 2.2. Endpoints

- `POST /v1/product-categories`
  ```json
  { "name": "Fashion", "features": [ {"label":"Material","description":""} ] }
  ```
- `GET /v1/product-categories?q=&client_id=&page=&limit=`
- `GET /v1/product-categories/{categoryId}`
- `PATCH /v1/product-categories/{categoryId}`
- `DELETE /v1/product-categories/{categoryId}` (soft)

**Errors**: tương tự Product. `409` `CATEGORY_NAME_DUPLICATE` khi trùng name trong cùng client.

---

## 3. Authorization rules (đề xuất)

- User chỉ thấy/sửa product thuộc `client_id` của mình (hoặc không có `client_id`).
- Admin/staff thấy toàn bộ.
- `DELETE` cần role `admin` hoặc chủ sở hữu.
- Nếu bạn có RBAC hiện hữu, áp dụng pattern tương tự `Projects`.

---

## 4. Error codes mới (suggest)

| code                         | status | ý nghĩa                         |
|------------------------------|--------|---------------------------------|
| `PRODUCT_NOT_FOUND`          | 404    | product không tồn tại           |
| `PRODUCT_SKU_DUPLICATE`      | 409    | sku đã tồn tại trong client     |
| `PRODUCT_SLUG_DUPLICATE`     | 409    | slug đã tồn tại trong client    |
| `CATEGORY_NOT_FOUND`         | 404    |                                 |
| `CATEGORY_NAME_DUPLICATE`    | 409    | name trùng trong cùng client    |
| `CATEGORY_IN_USE`            | 409    | xoá category đang được product dùng |
| `PRODUCT_VALIDATION_FAILED`  | 400    | map về `VALIDATION_ERROR`       |

---

## 5. Index / DB gợi ý

- `products`:
  - PK `id`
  - Index `(client_id, status, created_at DESC)`
  - Unique `(client_id, slug)` partial `WHERE deleted_at IS NULL`
  - Unique `(client_id, sku)` partial khi `sku IS NOT NULL`
  - GIN/full-text cho `name`, `description` (cho `q`)
- `product_categories`:
  - Unique `(client_id, name)` partial where `deleted_at IS NULL`

---

## 6. Ví dụ curl (sau khi BE có)

```bash
# 1) Login (đã có)
curl -X POST http://75.119.128.96:9090/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@rexer.ai","password":"***"}' -c cookies.txt

# 2) Create product
curl -X POST http://75.119.128.96:9090/v1/products \
  -H 'Content-Type: application/json' -b cookies.txt \
  -d '{
    "name":"Test Shoe",
    "sku":"SK-1",
    "sizes":["S","M","L"],
    "colors":[{"name":"Red","hex":"#EF4444"}],
    "variants":["V-01"],
    "ingredients":["Leather"],
    "certifications":["ISO-9001"]
  }'

# 3) List / Get / Patch / Delete
curl    http://75.119.128.96:9090/v1/products?q=shoe -b cookies.txt
curl    http://75.119.128.96:9090/v1/products/{id}   -b cookies.txt
curl -X PATCH http://75.119.128.96:9090/v1/products/{id} -b cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"description":"New description"}'
curl -X DELETE http://75.119.128.96:9090/v1/products/{id} -b cookies.txt
```

---

## 7. Open questions cho BE team

1. `client_id` có bắt buộc với `Product` không? (FE hiện không yêu cầu — dùng user-scope.)
2. `features` có nên tách thành bảng riêng hay embed JSON trong product? (FE dùng được cả hai.)
3. `media_ids` dùng chung media resource hiện tại, hay thêm bảng `product_media` (giống `project_media_bindings`)?
4. Có cần publish flow (giống `releases` của Project) cho Product không? — hiện FE chưa yêu cầu.
5. Pagination convention: dùng `total_pages` hay `next_cursor`? FE xử lý được cả hai, nhưng cần thống nhất với các list hiện tại.
6. Category có multi-level (parent/child) không? — FE hiện tại flat.

---

## 8. Deliverable tối thiểu đủ cho FE chạy hiện tại

Mức tối thiểu để FE unblock Save button:
- `POST /v1/products` (chỉ cần `name` required, phần còn lại nhận optional).
- `GET /v1/products/{id}`.
- `PATCH /v1/products/{id}`.
- Không cần list/delete/category ở phase 1.

Phần còn lại có thể ship dần.
