# BE Spec — Collections (Data Collection Builder)

**Mục tiêu**: bổ sung 2 resource `data_collections` và `data_collection_records` vào ReXeR Backend để FE module Collection (Airtable-like data table) chuyển từ `localStorage` adapter sang BE thật.

**Base**: `/v1` (giống các endpoint hiện có)
**Auth**: `CookieAuth` — giống `/v1/products`, `/v1/projects`.
**Convention**: `snake_case` JSON, UUID string IDs, ISO-8601 timestamps.
**Error body**: reuse `pkg_http.ErrorBody` `{ code, message, details?, request_id? }`.

> FE đã wire vào service interface trong `src/services/dataCollection.local.ts`. Khi BE ship, FE chỉ thay 1 import — toàn bộ logic UI giữ nguyên.
>
> File này gộp **API contract** + **implementation guide** + **test matrix** + **sprint plan** vào 1 chỗ.

---

## 0. Mục lục

1. [Scope MVP](#1-scope-mvp)
2. [Định vị trong codebase BE](#2-định-vị-trong-codebase-be)
3. [Resource `data_collections`](#3-resource-data_collections)
4. [Resource `data_collection_records`](#4-resource-data_collection_records)
5. [Endpoints + curl examples](#5-endpoints--curl-examples)
6. [Response shape envelope](#6-response-shape-envelope)
7. [Validation rules](#7-validation-rules)
8. [Authorization](#8-authorization)
9. [Error code catalog](#9-error-code-catalog)
10. [SQL DDL (PostgreSQL)](#10-sql-ddl-postgresql)
11. [Go struct sketches](#11-go-struct-sketches)
12. [Service-layer logic](#12-service-layer-logic)
13. [Handler routes](#13-handler-routes)
14. [Test matrix](#14-test-matrix)
15. [Acceptance criteria](#15-acceptance-criteria)
16. [Sprint plan](#16-sprint-plan)
17. [Phase 2 backlog](#17-phase-2-backlog)
18. [Open questions](#18-open-questions)
19. [FE migration plan](#19-fe-migration-plan)
20. [References](#20-references)

---

## 1. Scope MVP

| Phase | Phạm vi |
|---|---|
| **MVP** (3 ngày 1 dev) | Collections CRUD + Records CRUD + soft-delete collection + unique-field validate + optimistic locking |
| **Phase 2** (2 ngày) | Bulk import / export, relation field validate, full-text search jsonb data, file/image upload binding, realtime |

---

## 2. Định vị trong codebase BE

Theo pattern các resource hiện có (`Project`, `Product`, `Campaign`):

```
internal/
├── domain/
│   └── models/
│       ├── data_collection.go            ← entity
│       └── data_collection_record.go     ← entity
├── repository/
│   ├── data_collection.go                ← Postgres CRUD
│   └── data_collection_record.go
├── service/
│   ├── data_collection.go                ← business logic
│   └── data_collection_record.go
└── http/
    └── handler/
        ├── data_collection.go            ← HTTP handler + Swagger annotations
        └── data_collection_record.go

migrations/
├── XXXX_create_data_collections.sql
└── XXXX_create_data_collection_records.sql
```

---

## 3. Resource: `data_collections`

### 3.1 Entity

| field | type | required | ghi chú |
|---|---|:---:|---|
| `id` | string (uuid) | ✓ | BE sinh |
| `client_id` | string (uuid) | — | scope theo client (nullable cho global template) |
| `name` | string (≤255) | ✓ | tên collection |
| `slug` | string (≤255) | — | auto-generate từ `name`, unique theo `client_id`, partial WHERE `is_active = true` |
| `description` | text (≤2000) | — | |
| `icon` | string (≤64) | — | tên icon (lucide hoặc enum) — default `Table` |
| `color` | string (≤16) | — | hex color — default `#4f46e5` |
| `fields` | `CollectionFieldConfig[]` (jsonb) | — | schema động (xem 3.2) |
| `is_active` | boolean | ✓ | default `true`. Soft-delete = false |
| `is_template` | boolean | ✓ | default `false`. Template có thể clone |
| `record_count` | int | ✓ | denormalize, BE bump khi create/delete record |
| `version` | int | ✓ | optimistic-lock counter, default `1`, +1 mỗi update |
| `created_by` | string (uuid) | ✓ | BE set từ session |
| `updated_by` | string (uuid) | ✓ | |
| `created_at` | date-time | ✓ | |
| `updated_at` | date-time | ✓ | |

### 3.2 `CollectionFieldConfig` (jsonb item)

```jsonc
{
  "id": "f_01HXYZ",                // uuid hoặc client-side id
  "fieldKey": "customer_email",    // [a-z0-9_]+, unique trong cùng collection
  "type": "email",                 // enum (xem 3.3)
  "label": "Customer email",
  "placeholder": "you@company.com",
  "description": "Primary contact",
  "required": true,
  "order": 0,                      // BE re-normalize lại 0..N khi save
  "options": ["VIP","Regular"],    // dùng cho dropdown/radio/checkbox
  "defaultValue": null,
  "validation": {                  // optional, BE/FE đều tôn trọng
    "minLength": 3, "maxLength": 100,
    "min": 0, "max": 999999,
    "pattern": "^[A-Z]+$",
    "maxRating": 5
  },
  "isUnique": false,
  "isPrimary": false,              // 1 collection chỉ nên có 0-1 primary (BE warn nếu > 1)
  "referenceCollectionId": null    // dùng cho type=relation (Phase 2)
}
```

### 3.3 `CollectionFieldType` enum (17 values)

```
text | paragraph | number | currency | email | url | phone |
date | time | dropdown | radio | checkbox | toggle | rating |
file | image | relation
```

> **Lưu ý**: `relation` cần BE validate `referenceCollectionId` tồn tại + active + không tự reference (xem §7).

---

## 4. Resource: `data_collection_records`

### 4.1 Entity

| field | type | required | ghi chú |
|---|---|:---:|---|
| `id` | string (uuid) | ✓ | |
| `collection_id` | string (uuid) | ✓ | FK |
| `data` | jsonb (Record\<string, unknown\>) | ✓ | nội dung record — key là `fieldKey` |
| `display_name` | string (≤200) | — | computed bởi FE từ field `is_primary`; BE giữ as-is |
| `is_archived` | boolean | ✓ | default `false`, dùng để soft-delete record |
| `created_by` | string (uuid) | ✓ | |
| `updated_by` | string (uuid) | ✓ | |
| `created_at` | date-time | ✓ | |
| `updated_at` | date-time | ✓ | |

---

## 5. Endpoints + curl examples

### 5.1 Collections

#### `GET /v1/collections`
Query params:
- `is_active` (bool, default `true` để skip soft-deleted)
- `is_template` (bool)
- `q` — search `name` / `description` (ILIKE)
- `page` (int, default `1`)
- `limit` (int, default `50`, max `200`)
- `sort` — default `-updated_at`

#### `POST /v1/collections`
Body `CreateCollectionRequest`:
```json
{
  "name": "Customers",
  "description": "VIP customer database",
  "icon": "Users",
  "color": "#059669",
  "fields": [
    { "id":"f1","fieldKey":"name","type":"text","label":"Name","order":0,"required":true,"isPrimary":true }
  ],
  "is_template": false
}
```
- Required: `name`. Mọi field khác optional.
- BE auto-generate `slug` từ `name` (collision retry với suffix `-2`, `-3`…).
- BE set `version = 1`, `record_count = 0`, `is_active = true`.
- Validate: nếu có `relation` field → check `referenceCollectionId` tồn tại + active.

Responses:
- `201` — `CollectionResponse`
- `400` `VALIDATION_ERROR` (vd field type không hợp lệ, isUnique không được áp lên paragraph/file)
- `409` `COLLECTION_SLUG_DUPLICATE` (sau retry vẫn duplicate)

#### `GET /v1/collections/{collectionId}`
- `200` — `CollectionResponse`
- `404` `COLLECTION_NOT_FOUND`

#### `PATCH /v1/collections/{collectionId}`
Body `UpdateCollectionRequest`: tất cả field optional, **trừ `version` REQUIRED** (optimistic lock).
```json
{
  "name": "Customers (renamed)",
  "fields": [ /* ... */ ],
  "version": 3
}
```
- BE check `WHERE id = ? AND version = 3`. Nếu không match → 409 `COLLECTION_VERSION_CONFLICT`.
- Sau update: BE bump `version + 1`, set `updated_at` + `updated_by`.
- Validate `fields[]` (xem §7).

Responses:
- `200` — `CollectionResponse`
- `400` `VALIDATION_ERROR`
- `404` `COLLECTION_NOT_FOUND`
- `409` `COLLECTION_VERSION_CONFLICT`

#### `DELETE /v1/collections/{collectionId}` — Soft delete
- Set `is_active = false`, `updated_at`, `updated_by`. Records vẫn giữ để khôi phục.
- Response: `200` + `MessageBody`

### 5.2 Records

#### `GET /v1/collections/{collectionId}/records`
Query params:
- `q` — search `display_name` + `data` (jsonb full-text)
- `sort_field` — tên field hoặc cột meta (`created_at`, `updated_at`, `display_name`)
- `sort_direction` — `asc | desc` (default `desc` cho `created_at`)
- `filters` — JSON encoded `Record<fieldKey, value>` để filter `data->>fieldKey = value`
- `page` (default 1), `limit` (default 20, max 200)

#### `POST /v1/collections/{collectionId}/records`
Body `CreateRecordRequest`:
```json
{
  "data": { "name": "Acme", "email": "hi@acme.com", "tier": "VIP" },
  "display_name": "Acme"
}
```
- BE check collection tồn tại + `is_active`.
- Validate `data` against `collection.fields[].validation`.
- Unique field check: nếu `field.isUnique && data[fieldKey]` đã tồn tại → 409 `RECORD_UNIQUE_VIOLATION` với `details: { field: "email" }`.
- BE bump `data_collections.record_count + 1`.

Responses:
- `201` — `RecordResponse`
- `400` `VALIDATION_ERROR`
- `404` `COLLECTION_NOT_FOUND`
- `409` `RECORD_UNIQUE_VIOLATION`

#### `GET /v1/records/{recordId}`
- Hoặc `GET /v1/collections/{collectionId}/records/{recordId}` — tuỳ BE; FE hỗ trợ cả 2.
- `200` — `RecordResponse`
- `404` `RECORD_NOT_FOUND`

#### `PATCH /v1/records/{recordId}`
Body `UpdateRecordRequest` — partial:
```json
{
  "data": { "tier": "Regular" },
  "display_name": "Acme",
  "is_archived": false
}
```
- Server merge `data` vào `data` cũ (shallow). Không deep-merge.
- Validate giống create.
- Khi `is_archived = true` → bump `record_count - 1`. Khi unarchive → +1.

#### `DELETE /v1/records/{recordId}` — Hard delete
- Hard delete. Bump `record_count - 1`.
- Response `200` + `MessageBody`.

### 5.3 Phase 2 endpoints

#### `POST /v1/collections/{collectionId}/records/bulk`
Body:
```json
{
  "records": [
    { "data": { "name": "A" }, "display_name": "A" },
    { "data": { "name": "B" }, "display_name": "B" }
  ]
}
```
- BE chunk insert (recommend 500 records / batch).
- Response: `{ "created": 487, "failed": 13, "errors": [{ "index": 4, "code": "VALIDATION_ERROR", "field": "email" }] }`

#### `GET /v1/collections/{collectionId}/records/export`
- Query: same as list + `format=csv|xlsx|json`
- Response: streaming download. Cap 10000 records/request.

### 5.4 Curl examples

```bash
# 1) Login
curl -X POST $BE/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@rexer.ai","password":"Admin1234"}' -c c.txt

# 2) Create collection
COLL=$(curl -s -X POST $BE/v1/collections -H 'Content-Type: application/json' -b c.txt \
  -d '{"name":"Customers","color":"#059669","fields":[
    {"id":"f1","fieldKey":"name","type":"text","label":"Name","order":0,"required":true,"isPrimary":true},
    {"id":"f2","fieldKey":"email","type":"email","label":"Email","order":1,"isUnique":true},
    {"id":"f3","fieldKey":"tier","type":"dropdown","label":"Tier","order":2,"options":["VIP","Regular"]}
  ]}' | jq -r .collection.id)

# 3) Add record
curl -X POST $BE/v1/collections/$COLL/records -H 'Content-Type: application/json' -b c.txt \
  -d '{"data":{"name":"Acme","email":"hi@acme.com","tier":"VIP"},"display_name":"Acme"}'

# 4) Try duplicate email → 409 RECORD_UNIQUE_VIOLATION
curl -X POST $BE/v1/collections/$COLL/records -H 'Content-Type: application/json' -b c.txt \
  -d '{"data":{"name":"Acme #2","email":"hi@acme.com"}}'

# 5) List with search
curl -b c.txt "$BE/v1/collections/$COLL/records?q=acme&page=1&limit=20"

# 6) Patch with version
curl -X PATCH $BE/v1/collections/$COLL -H 'Content-Type: application/json' -b c.txt \
  -d '{ "name": "Customers (renamed)", "version": 1 }'
```

---

## 6. Response shape envelope

```jsonc
// CollectionResponse
{ "collection": { /* DataCollection */ } }

// CollectionListResponse
{ "items": [ /* DataCollection[] */ ], "page":1, "limit":50, "total":12, "total_pages":1 }

// RecordResponse
{ "record": { /* DataCollectionRecord */ } }

// RecordListResponse
{ "items": [ /* DataCollectionRecord[] */ ], "page":1, "limit":20, "total":134, "total_pages":7 }
```

> Pattern `{ resource: ... }` envelope thống nhất với các endpoint hiện có (`{ project }`, `{ campaign }`, `{ release }`).

---

## 7. Validation rules

### 7.1 Field schema (khi create/update collection)

| Rule | Action khi vi phạm | Error code |
|---|---|---|
| `fieldKey` regex `^[a-z][a-z0-9_]{0,63}$` | reject | `FIELD_KEY_INVALID` |
| `fieldKey` không trùng trong cùng collection | reject | `FIELD_KEY_DUPLICATE` |
| `fieldKey` không phải reserved word (`id`, `data`, `created_at`, `updated_at`) | reject | `FIELD_KEY_RESERVED` |
| `type = relation` → `referenceCollectionId` required, tồn tại, active, không self-ref | reject | `RELATION_REF_INVALID` |
| `isUnique = true` chỉ cho `text \| number \| currency \| email \| url \| phone` | reject | `UNIQUE_NOT_SUPPORTED` |
| `isPrimary = true` nhiều hơn 1 field | warn (200 + `X-Warnings`) | `MULTIPLE_PRIMARY_FIELDS` |
| Đổi `type` khi `record_count > 0` | warn (200 + `X-Warnings`) | `FIELD_TYPE_CHANGE_RISK` |

Sau validate: re-normalize `order` về `0..N-1` theo thứ tự FE gửi.

### 7.2 Record data (khi create/update record)

Port pure function từ FE — `src/services/dataCollection.local.ts:96-178` (function `validateRecordData`):

```go
func ValidateRecordData(fields []CollectionFieldConfig, data JSONMap) (errs map[string]string, ok bool) {
    errs = map[string]string{}
    for _, f := range fields {
        v, has := data[f.FieldKey]

        if f.Required && (!has || isEmpty(v)) {
            errs[f.FieldKey] = fmt.Sprintf("%s is required", f.Label)
            continue
        }
        if !has || isEmpty(v) { continue }

        switch f.Type {
        case FieldTypeEmail:
            if !emailRegex.MatchString(toString(v)) {
                errs[f.FieldKey] = "Invalid format"
            }
        case FieldTypeNumber, FieldTypeCurrency:
            n, ok := toFloat(v)
            if !ok { errs[f.FieldKey] = "Must be a number"; break }
            if min, ok := readNum(f.Validation, "min"); ok && n < min {
                errs[f.FieldKey] = fmt.Sprintf("Minimum value is %v", min)
            }
            // ... max, etc.
        case FieldTypeDropdown, FieldTypeRadio:
            if len(f.Options) > 0 && !contains(f.Options, toString(v)) {
                errs[f.FieldKey] = fmt.Sprintf("Value must be one of: %s", strings.Join(f.Options, ", "))
            }
        // ... checkbox, rating, text length, etc.
        }
    }
    return errs, len(errs) == 0
}
```

Khi fail → `400 VALIDATION_ERROR` với `details: { field_errors: errs }`.

---

## 8. Authorization

- User chỉ thấy/sửa collection thuộc `client_id` của mình hoặc `client_id IS NULL` (global template).
- Admin/staff (role check qua middleware) bypass filter.
- `is_template = true` collection: read-only cho non-owner. Clone qua endpoint riêng (Phase 2).
- `DELETE` cần `created_by = user.id` HOẶC role = `admin`.

Pattern repo:

```go
func (r *Repo) ListCollections(ctx context.Context, userClientID *uuid.UUID, filters Filters) (...) {
    q := `SELECT * FROM data_collections WHERE is_active = TRUE`
    if userClientID != nil {
        q += ` AND (client_id = $1 OR client_id IS NULL)`
    }
    // ...
}
```

---

## 9. Error code catalog

| code | status | trigger |
|---|:---:|---|
| `COLLECTION_NOT_FOUND` | 404 | id không tồn tại hoặc archived |
| `COLLECTION_SLUG_DUPLICATE` | 409 | sau 50 retry vẫn duplicate |
| `COLLECTION_VERSION_CONFLICT` | 409 | optimistic lock fail |
| `RECORD_NOT_FOUND` | 404 | |
| `RECORD_UNIQUE_VIOLATION` | 409 | duplicate trên field `isUnique` — `details.field` |
| `RELATION_REF_INVALID` | 400 | reference collection không tồn tại / inactive / self |
| `FIELD_KEY_INVALID` | 400 | regex không khớp |
| `FIELD_KEY_DUPLICATE` | 400 | trùng `fieldKey` trong cùng collection |
| `FIELD_KEY_RESERVED` | 400 | dùng `id`, `data`, etc. |
| `UNIQUE_NOT_SUPPORTED` | 400 | `isUnique` áp lên type không hợp lệ |
| `VALIDATION_ERROR` | 400 | record data fail validate (`details.field_errors`) |

Warnings (status 200 + header `X-Warnings`):
- `MULTIPLE_PRIMARY_FIELDS`
- `FIELD_TYPE_CHANGE_RISK`

---

## 10. SQL DDL (PostgreSQL)

### 10.1 Migration `XXXX_create_data_collections.sql`

```sql
CREATE TABLE data_collections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID            NULL REFERENCES clients(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL,
    slug            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    icon            VARCHAR(64)     NULL DEFAULT 'Table',
    color           VARCHAR(16)     NULL DEFAULT '#4f46e5',
    fields          JSONB           NOT NULL DEFAULT '[]'::jsonb,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    is_template     BOOLEAN         NOT NULL DEFAULT FALSE,
    record_count    INT             NOT NULL DEFAULT 0,
    version         INT             NOT NULL DEFAULT 1,
    created_by      UUID            NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by      UUID            NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_data_collections_client_active
    ON data_collections (client_id, is_active, updated_at DESC);

CREATE UNIQUE INDEX uq_data_collections_slug_per_client
    ON data_collections (client_id, slug)
    WHERE is_active = TRUE;

CREATE INDEX idx_data_collections_template
    ON data_collections (is_template)
    WHERE is_template = TRUE;

CREATE INDEX idx_data_collections_fields_gin
    ON data_collections USING GIN (fields jsonb_path_ops);

COMMENT ON COLUMN data_collections.version IS
    'Optimistic-lock counter. Bumped +1 on every UPDATE. Used in WHERE clause for safe writes.';
COMMENT ON COLUMN data_collections.fields IS
    'Array of CollectionFieldConfig — see §3.2';
```

### 10.2 Migration `XXXX_create_data_collection_records.sql`

```sql
CREATE TABLE data_collection_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id   UUID            NOT NULL REFERENCES data_collections(id) ON DELETE CASCADE,
    data            JSONB           NOT NULL DEFAULT '{}'::jsonb,
    display_name    VARCHAR(200)    NULL,
    is_archived     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_by      UUID            NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by      UUID            NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_records_collection_active_created
    ON data_collection_records (collection_id, is_archived, created_at DESC);

CREATE INDEX idx_records_display_name
    ON data_collection_records (collection_id, display_name)
    WHERE is_archived = FALSE;

CREATE INDEX idx_records_data_gin
    ON data_collection_records USING GIN (data jsonb_path_ops);

COMMENT ON COLUMN data_collection_records.data IS
    'jsonb object keyed by CollectionFieldConfig.fieldKey';
```

### 10.3 Trigger giữ `record_count` đồng bộ

```sql
CREATE OR REPLACE FUNCTION sync_collection_record_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE data_collections
        SET record_count = record_count + 1, updated_at = now()
        WHERE id = NEW.collection_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE data_collections
        SET record_count = GREATEST(record_count - 1, 0), updated_at = now()
        WHERE id = OLD.collection_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.is_archived = FALSE AND NEW.is_archived = TRUE) THEN
            UPDATE data_collections SET record_count = GREATEST(record_count - 1, 0) WHERE id = NEW.collection_id;
        ELSIF (OLD.is_archived = TRUE AND NEW.is_archived = FALSE) THEN
            UPDATE data_collections SET record_count = record_count + 1 WHERE id = NEW.collection_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_record_count
AFTER INSERT OR UPDATE OR DELETE ON data_collection_records
FOR EACH ROW EXECUTE FUNCTION sync_collection_record_count();
```

> Nếu BE-team prefer app-level bump, bỏ trigger và bump trong service. Spec FE chấp nhận cả hai.

### 10.4 Index ghi chú

> Khi BE implement unique field check, cân nhắc dùng partial unique index trên `((data->>fieldKey))` cho mỗi unique field — nhưng phải dynamic theo schema. Đơn giản nhất: app-level check trong service (như Supabase impl ở 360-admin-cms).

---

## 11. Go struct sketches

> Theo pattern hiện có (`internal/domain/models/project.go` etc.). Tags `json` + `db` + `swaggertype` follow convention codebase.

### 11.1 `data_collection.go`

```go
package models

import (
    "encoding/json"
    "time"

    "github.com/google/uuid"
)

type CollectionFieldType string

const (
    FieldTypeText      CollectionFieldType = "text"
    FieldTypeParagraph CollectionFieldType = "paragraph"
    FieldTypeNumber    CollectionFieldType = "number"
    FieldTypeCurrency  CollectionFieldType = "currency"
    FieldTypeEmail     CollectionFieldType = "email"
    FieldTypeURL       CollectionFieldType = "url"
    FieldTypePhone     CollectionFieldType = "phone"
    FieldTypeDate      CollectionFieldType = "date"
    FieldTypeTime      CollectionFieldType = "time"
    FieldTypeDropdown  CollectionFieldType = "dropdown"
    FieldTypeRadio     CollectionFieldType = "radio"
    FieldTypeCheckbox  CollectionFieldType = "checkbox"
    FieldTypeToggle    CollectionFieldType = "toggle"
    FieldTypeRating    CollectionFieldType = "rating"
    FieldTypeFile      CollectionFieldType = "file"
    FieldTypeImage     CollectionFieldType = "image"
    FieldTypeRelation  CollectionFieldType = "relation"
)

type CollectionFieldConfig struct {
    ID                    string              `json:"id"`
    FieldKey              string              `json:"fieldKey"`
    Type                  CollectionFieldType `json:"type"`
    Label                 string              `json:"label"`
    Placeholder           string              `json:"placeholder,omitempty"`
    Description           string              `json:"description,omitempty"`
    Required              bool                `json:"required,omitempty"`
    Order                 int                 `json:"order"`
    Options               []string            `json:"options,omitempty"`
    DefaultValue          interface{}         `json:"defaultValue,omitempty"`
    Validation            JSONMap             `json:"validation,omitempty"`
    IsUnique              bool                `json:"isUnique,omitempty"`
    IsPrimary             bool                `json:"isPrimary,omitempty"`
    ReferenceCollectionID *uuid.UUID          `json:"referenceCollectionId,omitempty"`
}

type DataCollection struct {
    ID           uuid.UUID                `json:"id" db:"id"`
    ClientID     *uuid.UUID               `json:"client_id,omitempty" db:"client_id"`
    Name         string                   `json:"name" db:"name"`
    Slug         string                   `json:"slug" db:"slug"`
    Description  *string                  `json:"description,omitempty" db:"description"`
    Icon         *string                  `json:"icon,omitempty" db:"icon"`
    Color        *string                  `json:"color,omitempty" db:"color"`
    Fields       []CollectionFieldConfig  `json:"fields" db:"fields"`
    IsActive     bool                     `json:"is_active" db:"is_active"`
    IsTemplate   bool                     `json:"is_template" db:"is_template"`
    RecordCount  int                      `json:"record_count" db:"record_count"`
    Version      int                      `json:"version" db:"version"`
    CreatedBy    *uuid.UUID               `json:"created_by,omitempty" db:"created_by"`
    UpdatedBy    *uuid.UUID               `json:"updated_by,omitempty" db:"updated_by"`
    CreatedAt    time.Time                `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time                `json:"updated_at" db:"updated_at"`
}

// Implement sql.Scanner cho Fields (jsonb)
func (f *[]CollectionFieldConfig) Scan(src interface{}) error {
    if src == nil {
        *f = nil
        return nil
    }
    data, ok := src.([]byte)
    if !ok {
        if s, ok := src.(string); ok {
            data = []byte(s)
        } else {
            return fmt.Errorf("unsupported type for fields: %T", src)
        }
    }
    return json.Unmarshal(data, f)
}
```

### 11.2 `data_collection_record.go`

```go
type DataCollectionRecord struct {
    ID           uuid.UUID  `json:"id" db:"id"`
    CollectionID uuid.UUID  `json:"collection_id" db:"collection_id"`
    Data         JSONMap    `json:"data" db:"data"`
    DisplayName  *string    `json:"display_name,omitempty" db:"display_name"`
    IsArchived   bool       `json:"is_archived" db:"is_archived"`
    CreatedBy    *uuid.UUID `json:"created_by,omitempty" db:"created_by"`
    UpdatedBy    *uuid.UUID `json:"updated_by,omitempty" db:"updated_by"`
    CreatedAt    time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}
```

### 11.3 Request/Response DTOs

```go
type CreateCollectionRequest struct {
    Name        string                  `json:"name" validate:"required,max=255"`
    Description *string                 `json:"description,omitempty" validate:"omitempty,max=2000"`
    Icon        *string                 `json:"icon,omitempty" validate:"omitempty,max=64"`
    Color       *string                 `json:"color,omitempty" validate:"omitempty,max=16"`
    Fields      []CollectionFieldConfig `json:"fields,omitempty"`
    IsTemplate  bool                    `json:"is_template,omitempty"`
}

type UpdateCollectionRequest struct {
    Name        *string                 `json:"name,omitempty" validate:"omitempty,max=255"`
    Description *string                 `json:"description,omitempty"`
    Icon        *string                 `json:"icon,omitempty"`
    Color       *string                 `json:"color,omitempty"`
    Fields      []CollectionFieldConfig `json:"fields,omitempty"`
    IsActive    *bool                   `json:"is_active,omitempty"`
    IsTemplate  *bool                   `json:"is_template,omitempty"`
    Version     int                     `json:"version" validate:"required,min=1"`
}

type CollectionResponse struct {
    Collection DataCollection `json:"collection"`
}

type CollectionListResponse struct {
    Items      []DataCollection `json:"items"`
    Page       int              `json:"page"`
    Limit      int              `json:"limit"`
    Total      int64            `json:"total"`
    TotalPages int              `json:"total_pages"`
}

type CreateRecordRequest struct {
    Data        JSONMap `json:"data" validate:"required"`
    DisplayName *string `json:"display_name,omitempty" validate:"omitempty,max=200"`
}

type UpdateRecordRequest struct {
    Data        JSONMap `json:"data,omitempty"`
    DisplayName *string `json:"display_name,omitempty"`
    IsArchived  *bool   `json:"is_archived,omitempty"`
}

type RecordResponse struct {
    Record DataCollectionRecord `json:"record"`
}

type RecordListResponse struct {
    Items      []DataCollectionRecord `json:"items"`
    Page       int                    `json:"page"`
    Limit      int                    `json:"limit"`
    Total      int64                  `json:"total"`
    TotalPages int                    `json:"total_pages"`
}
```

---

## 12. Service-layer logic

### 12.1 Slug generation (auto + collision retry)

```go
func generateSlug(name string) string {
    s := strings.ToLower(name)
    s = regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(s, "-")
    s = strings.Trim(s, "-")
    if s == "" {
        return "collection"
    }
    return s
}

func (s *Service) findUniqueSlug(ctx context.Context, clientID *uuid.UUID, base string) (string, error) {
    slug := base
    for attempt := 0; attempt < 50; attempt++ {
        if attempt > 0 {
            slug = fmt.Sprintf("%s-%d", base, attempt+1)
        }
        exists, err := s.repo.SlugExists(ctx, clientID, slug)
        if err != nil { return "", err }
        if !exists {
            return slug, nil
        }
    }
    return "", ErrSlugExhaustion
}
```

### 12.2 Update collection — optimistic lock pattern

```sql
UPDATE data_collections
SET name = $1, fields = $2, ..., version = version + 1, updated_at = now(), updated_by = $userid
WHERE id = $collectionID AND version = $expectedVersion
RETURNING *;
```

Nếu trả 0 row affected → check `SELECT id FROM data_collections WHERE id = $1`:
- Không có → `404 COLLECTION_NOT_FOUND`
- Có → `409 COLLECTION_VERSION_CONFLICT`

### 12.3 Unique field check (record)

Khi create/update record:

```sql
SELECT 1 FROM data_collection_records
WHERE collection_id = $1
  AND is_archived = FALSE
  AND data ->> $fieldKey = $value
  AND id <> $excludeID  -- only on update
LIMIT 1;
```

Nếu có match → `409 RECORD_UNIQUE_VIOLATION` với `details: { field: $fieldKey }`.

### 12.4 Search records (jsonb)

```sql
SELECT * FROM data_collection_records
WHERE collection_id = $1
  AND is_archived = FALSE
  AND (
    display_name ILIKE '%' || $q || '%'
    OR data::text ILIKE '%' || $q || '%'
  )
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

Phase 2 nâng cấp: dùng `tsvector` + GIN cho full-text proper.

---

## 13. Handler routes

Route mount tại `internal/http/router.go` (theo pattern `RegisterProjectRoutes`):

```go
collections := v1.Group("/collections", authMiddleware)
collections.GET("",        h.ListCollections)
collections.POST("",       h.CreateCollection)
collections.GET("/:id",    h.GetCollection)
collections.PATCH("/:id",  h.UpdateCollection)
collections.DELETE("/:id", h.DeleteCollection)

records := v1.Group("/collections/:collectionId/records", authMiddleware)
records.GET("",       h.ListRecords)
records.POST("",      h.CreateRecord)
records.GET("/:id",   h.GetRecord)
records.PATCH("/:id", h.UpdateRecord)
records.DELETE("/:id", h.DeleteRecord)

// Phase 2 — bulk + export
records.POST("/bulk", h.BulkCreateRecords)
records.GET("/export", h.ExportRecords)
```

### 13.1 Swagger annotations

Theo pattern `// @Summary`, `// @Param`, `// @Success`, `// @Failure` của các handler hiện có. Mỗi method 1 swagger block. Sau khi xong chạy `swag init` để regenerate `docs/swagger.json`.

---

## 14. Test matrix

### 14.1 Unit tests — `service`

| # | Test case | Expected |
|---|---|---|
| U1 | `generateSlug("Hello World!")` | `"hello-world"` |
| U2 | `generateSlug("@@@")` | `"collection"` (fallback) |
| U3 | Slug retry: existing `customers`, `customers-2` → next | `"customers-3"` |
| U4 | `ValidateRecordData` — required missing | error map có entry |
| U5 | `ValidateRecordData` — email regex | reject `"abc"`, accept `"a@b.c"` |
| U6 | Optimistic lock: stale version | `COLLECTION_VERSION_CONFLICT` |
| U7 | Field validate: relation self-ref | `RELATION_REF_INVALID` |
| U8 | Field validate: `isUnique` on `paragraph` | `UNIQUE_NOT_SUPPORTED` |

### 14.2 Integration tests — `handler`

| # | Method + path | Setup | Expected |
|---|---|---|---|
| I1 | `POST /v1/collections` body `{name:"Customers"}` | logged-in user | 201, slug = `customers` |
| I2 | Same again | duplicate name | 201, slug = `customers-2` |
| I3 | `POST` body `{}` | no name | 400 `VALIDATION_ERROR` |
| I4 | `GET /v1/collections?q=cust` | 1 collection exists | items contains it |
| I5 | `PATCH /v1/collections/{id}` body `{version: 1, fields: [...]}` | collection v1 | 200, version = 2 |
| I6 | Same body, version = 1 again | DB now v2 | 409 `COLLECTION_VERSION_CONFLICT` |
| I7 | `DELETE /v1/collections/{id}` | own collection | 200, `is_active = false` |
| I8 | `GET /v1/collections` after I7 | | item not in list (filtered by `is_active = true`) |
| I9 | `POST /v1/collections/{id}/records` body w/ required missing | schema có required field | 400, `details.field_errors[name]` |
| I10 | `POST` records — duplicate unique value | unique field exists | 409 `RECORD_UNIQUE_VIOLATION` |
| I11 | `GET /v1/collections/{id}/records?q=acme` | 2 records, 1 matches | 1 item returned |
| I12 | `DELETE /v1/records/{id}` | own record | 200, count -1 |

### 14.3 FE e2e (sau khi BE deploy staging)

Chạy `node scripts/visual-tests/verify-collection-flow.mjs` sau khi swap import — phải đạt 14/14 PASS:

```
✅ tab Data shows "New collection" button
✅ collection "Customers" appears in list
✅ detail page header shows "Customers"
✅ schema saved (Save button → Saved)
✅ Records tab shows "New record" button
✅ record "Acme Corp" appears in table
✅ duplicate email rejected with toast
✅ missing required field surfaces inline error
✅ search "Acme" filters to 1 row
✅ records persist after reload
✅ localStorage rexer.collections has 1 item(s)
✅ localStorage rexer.collection_records has 2 item(s)
✅ record count dropped from 2 → 1
✅ collection archived → no longer in active list
```

---

## 15. Acceptance criteria

> Định nghĩa "done" cho phase MVP. FE đã wire localStorage adapter cùng shape; sau khi BE pass tất cả AC, FE swap 1 import.

### AC-1 · DDL & migration
- [ ] 2 migration files apply sạch trên DB trống.
- [ ] `record_count` đồng bộ chính xác sau insert/delete record (qua trigger hoặc app-level).
- [ ] Unique partial index `(client_id, slug) WHERE is_active = true` chặn duplicate.

### AC-2 · Endpoints (10 cái MVP)
- [ ] `GET/POST /v1/collections` — pagination + search work.
- [ ] `GET/PATCH/DELETE /v1/collections/{id}` — CRUD + soft-delete.
- [ ] `GET/POST /v1/collections/{id}/records` — pagination + search + filter.
- [ ] `GET/PATCH/DELETE /v1/records/{id}` — CRUD record (hard-delete).
- [ ] Tất cả wrap response `{ collection: ... }` / `{ record: ... }`.
- [ ] Pagination response có cả `total` + `total_pages`.

### AC-3 · Validation & errors
- [ ] Required field missing → `400 VALIDATION_ERROR` với `details.field_errors`.
- [ ] Email/URL/phone regex check.
- [ ] Number min/max check.
- [ ] Unique field violation → `409 RECORD_UNIQUE_VIOLATION` + `details.field`.
- [ ] Version conflict → `409 COLLECTION_VERSION_CONFLICT`.
- [ ] Reserved fieldKey reject.

### AC-4 · Auth
- [ ] Cookie session required (401 nếu thiếu).
- [ ] User chỉ thấy collection thuộc `client_id` mình hoặc `client_id IS NULL`.
- [ ] Non-owner DELETE → 403 (trừ admin).

### AC-5 · Swagger
- [ ] `swag init` regenerate sạch, không lỗi.
- [ ] Mỗi endpoint có `@Summary`, `@Param`, `@Success`, `@Failure`.
- [ ] FE chạy `verify-collection-flow.mjs` sau khi swap → 14/14 PASS.

### AC-6 · Tests
- [ ] Unit tests cover `validateRecordData`, slug gen, version conflict.
- [ ] Integration tests cover I1–I12 ở §14.2.
- [ ] Coverage ≥ 70% cho service + handler.

### AC-7 · Tránh API issues đã ghi trong `docs/be-issues-master.md`
- [ ] **Không** dùng `localhost:9090` hard-code trong response (BUG-01 / BUG-02 pattern).
- [ ] Date fields trả ISO-8601 string trực tiếp, **không** wrap `SimpleDate { "time.Time": "..." }` (BUG-04 pattern).
- [ ] List response có `total_pages` (DX-01).

---

## 16. Sprint plan

| Day | Task | Owner |
|---|---|---|
| **D1** | Migration + entity Go struct + repo CRUD collection | BE-1 |
| **D1** | Service layer collection (slug + optimistic lock) + handler + swagger | BE-1 |
| **D2** | Migration record + entity + repo + service + handler | BE-1 |
| **D2** | Validation pipeline (port `validateRecordData` từ FE) | BE-1 |
| **D3** | Auth filter + role check + unit tests | BE-1 |
| **D3** | Integration tests I1–I12 | BE-1 |
| **D3** | Deploy staging, FE swap import + e2e verify | FE + BE |

**Estimate**: 3 ngày 1 dev. Phase 2 thêm 2 ngày.

---

## 17. Phase 2 backlog

| # | Item | Effort |
|---|---|---|
| P2-1 | `POST /v1/collections/{id}/records/bulk` (chunked insert) | 0.5d |
| P2-2 | `GET /v1/collections/{id}/records/export?format=csv\|xlsx` (streaming) | 1d |
| P2-3 | `relation` field type — full validate + populate trên list | 1d |
| P2-4 | `POST /v1/collections/{id}/clone` — clone từ template | 0.5d |
| P2-5 | Realtime subscribe (websocket / SSE) khi record update | 2d |
| P2-6 | Granular permissions per-collection (vd field-level mask) | 2d |

---

## 18. Open questions

Cần BE-team confirm trước khi code:

1. **`record_count` qua trigger hay app-level?** Trigger an toàn hơn race nhưng khó test.
2. **`display_name`** BE compute (đọc primary field từ `data`) hay FE pass thẳng? FE hiện compute và gửi.
3. **Soft-delete vs hard-delete record**: hiện đề xuất hard-delete + bump count. Có cần soft-delete với `is_archived = true` để recover được? FE đã có field nhưng UI không expose archive.
4. **File / image field type**: trỏ vào `media_assets` (có sẵn) hay store URL string? Đề xuất: lưu `media_id`, FE hydrate giống flow Project media.
5. **Realtime**: cần subscribe khi record được update bởi user khác cùng collection không? (Supabase ở 360 có nhưng FE rexerai chưa có WebSocket layer.)
6. **Permissions per collection**: cần granular (vd field-level read/write) hay collection-level đủ? MVP chỉ collection-level.
7. **Quota**: limit số collection / records per client? Cần config trong Admin Settings.
8. **`/auth/me` mở rộng `client`**: trùng với GAP-02 trong `be-issues-master.md` — nên fix luôn đợt này.

---

## 19. FE migration plan khi BE ready

1. Tạo `src/services/dataCollection.remote.ts` — implement cùng interface như `dataCollection.local.ts` nhưng dùng `rexerApi`.

2. Add endpoints vào `src/services/rexer/endpoints.ts`:
   ```ts
   collections: {
     list:  (q?) => rx<CollectionListResponse>('/collections', { query: q }),
     get:   (id) => rx<CollectionResponse>(`/collections/${id}`).then(r => r.collection),
     create:(b)  => rx<CollectionResponse>('/collections', { method:'POST', body: b }).then(r => r.collection),
     update:(id, b) => rx<CollectionResponse>(`/collections/${id}`, { method:'PATCH', body: b }).then(r => r.collection),
     remove:(id) => rx<{ message?: string }>(`/collections/${id}`, { method:'DELETE' }),
     records: { /* same shape */ },
   }
   ```

3. Swap import trong `CollectionList.tsx` / `CollectionDetail.tsx` / `RecordTable.tsx` / `RecordEditor.tsx`:
   ```diff
   - import { dataCollectionLocal } from '@/services/dataCollection.local';
   + import { dataCollectionRemote as dataCollectionLocal } from '@/services/dataCollection.remote';
   ```

4. (Optional) Migrate localStorage data sang BE qua bulk import (Phase 2).

---

## 20. References

- **Source clone**: `360-admin-cms/src/containers/DataCollections/` (~6000 LOC) — adapted xuống ~1500 LOC FE-only cho rexerai.
- **Validation logic origin**: `360-admin-cms/src/services/dataCollection.service.ts:643-733` (pure function `validateRecordData`).
- **FE adapter mockup**: `src/services/dataCollection.local.ts` (port logic 1:1, BE có thể tham khảo cách validate).
- **E2E test**: `scripts/visual-tests/verify-collection-flow.mjs` (14 checks, 100% pass khi BE ready).
- **BE pattern reference**: `internal/http/handler/project.go`, `service/project.go`, `repository/project.go` (theo cùng style).
- **Master BE issues log**: `docs/be-issues-master.md` (cần tránh repeat các issue cũ).

---

**Câu hỏi / blocker** ping FE team — file FE đã sẵn sàng swap.
