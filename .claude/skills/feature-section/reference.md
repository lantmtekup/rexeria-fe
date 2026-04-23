# Reference: Feature Section Templates

## Checklist

- [ ] `src/types/featureName.ts` — IDoc, DTOs
- [ ] `src/models/featureName.model.ts` — schema + getOrCreateModel + indexes
- [ ] `src/server/services/featureName.service.ts` — CRUD methods
- [ ] `src/server/controllers/featureName.controller.ts` — thin delegation layer
- [ ] `src/app/api/db/featureSlug/route.ts` — GET + POST
- [ ] `src/app/api/db/featureSlug/[id]/route.ts` — GET + PUT + DELETE
- [ ] `src/services/endpoint/featureName.ts` + re-exported in `index.ts`
- [ ] `src/services/logic/featureName.ts` + re-exported in `index.ts`
- [ ] `src/settings/constants/featureName.ts`
- [ ] `schema.ts` + FormDialog + DeleteDialog + Table + Management + `index.ts`
- [ ] `src/app/(cms)/cms/featureSlug/page.tsx`

---

## Service method signatures

```ts
export const featureNameService = {
  async getAllItems(): Promise<IFeatureName[]>,     // sort: { order: 1 }
  async getActiveItems(): Promise<IFeatureName[]>,  // filter: { isActive: true }, sort: { order: 1 }
  async getItemById(id: string): Promise<IFeatureName>,
  async createItem(dto: CreateFeatureNameDto): Promise<IFeatureName>,
  async updateItem(id: string, dto: UpdateFeatureNameDto): Promise<IFeatureName>,
  async deleteItem(id: string): Promise<IFeatureName>,
};
```

**Error handling rules:**
- Always `import 'server-only'` as the very first line
- `validateId(id)` using `mongoose.Types.ObjectId.isValid` — throw `HttpException.badRequest(...)` if invalid
- `await connectDB()` before every Mongoose operation
- Wrap DB calls in `try/catch`: rethrow `HttpException` as-is, wrap unknown with `HttpException.internal(...)`
- `createItem`: check order uniqueness — `Model.exists({ order })` before creating → throw `HttpException.conflict(...)`
- `updateItem`: check order conflict excluding self — `Model.exists({ _id: { $ne: id }, order })`
- `updateItem`: use `findByIdAndUpdate(id, dto, { new: true, runValidators: true })`
- Cast `Number(dto.order)` before saving — DTO value may arrive as string from JSON

---

## Controller `getAll` pattern

```ts
async getAll(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get('all') === 'true';
    const items = all
      ? await featureNameService.getAllItems()
      : await featureNameService.getActiveItems();
    return sendSuccess(items);
  } catch (err) {
    return sendError(err);
  }
},
```

---

## API route — async params pattern (Next.js 15)

```ts
// [id]/route.ts
import { NextRequest } from 'next/server';
import { featureNameController } from '@/server/controllers/featureName.controller';

type RouteContext = { params: Promise<{ id: string }> };

// TODO: wrap PUT, DELETE with withAuth middleware once auth is implemented
export const GET = async (req: NextRequest, { params }: RouteContext) => {
  const { id } = await params;
  return featureNameController.getById(req, id);
};

export const PUT = async (req: NextRequest, { params }: RouteContext) => {
  const { id } = await params;
  return featureNameController.update(req, id);
};

export const DELETE = async (req: NextRequest, { params }: RouteContext) => {
  const { id } = await params;
  return featureNameController.remove(req, id);
};
```

> `params` in Next.js 15 is a **Promise** — always `await params` before destructuring `id`.

---

## Endpoint registry pattern

```ts
const prefix = '/api/db/featureSlug';

const featureNameEndpoint = {
  GET_ACTIVE_FEATURE_UPPER:   prefix,
  GET_ALL_FEATURE_UPPER:      prefix,
  GET_FEATURE_UPPER_BY_ID:   (id: string) => `${prefix}/${id}`,
  CREATE_FEATURE_UPPER:       prefix,
  UPDATE_FEATURE_UPPER:      (id: string) => `${prefix}/${id}`,
  DELETE_FEATURE_UPPER:      (id: string) => `${prefix}/${id}`,
};

export default featureNameEndpoint;
```

---

## Logic service pattern

```ts
import { errorResponse, successResponse } from '@/helpers/transformation';
import { fetchInstance } from '@/services/base/fetchInstance';
import featureNameEndpoint from '@/services/endpoint/featureName';
import type { ClientApiResponse } from '@/types/common';
import type { CreateFeatureNameDto, IFeatureName, UpdateFeatureNameDto } from '@/types/featureName';

export const featureNameService = {
  async getAll(): Promise<ClientApiResponse<IFeatureName[]>> {
    try {
      const res = await fetchInstance<{ data: IFeatureName[] }>(
        featureNameEndpoint.GET_ALL_FEATURE_UPPER,
        { queryString: { all: true } }
      );
      return successResponse(res.data);
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Failed to get items');
    }
  },

  // getActive: same but NO queryString param
  // getById:   fetchInstance(endpoint.GET_FEATURE_UPPER_BY_ID(id))
  // create:    { method: 'POST', variables: dto }
  // update:    { method: 'PUT', variables: dto }
  // remove:    { method: 'DELETE' } → return successResponse(null, 'Deleted successfully')
};
```

---

## Zod schema patterns

```ts
import { z } from 'zod';

// Plain required string
fieldName: z.string().min(1, 'Vui lòng nhập ...'),

// Optional URL
linkUrl: z.string().optional(),

// Optional image URL (allow empty string)
imageUrl: z.string().default(''),

// LocalizedText field
title: z.object({
  vi: z.string().min(1, 'Vui lòng nhập tiêu đề tiếng Việt'),
  en: z.string().min(1, 'Vui lòng nhập tiêu đề tiếng Anh'),
}),

// Always include these two
order:    z.number().int().min(0, 'Thứ tự phải ≥ 0'),
isActive: z.boolean({ message: 'Vui lòng chọn trạng thái' }),
```

---

## FormDialog — number input pattern

```tsx
<FormField
  control={form.control}
  name="order"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Thứ tự hiển thị</FormLabel>
      <FormControl>
        <Input
          type="number"
          min={0}
          {...field}
          onChange={e => field.onChange(e.target.valueAsNumber)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## FormDialog — LocalizedText field pattern

```tsx
<FormField
  control={form.control}
  name="title.vi"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tiêu đề (Tiếng Việt)</FormLabel>
      <FormControl><Input placeholder="..." {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
<FormField
  control={form.control}
  name="title.en"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tiêu đề (English)</FormLabel>
      <FormControl><Input placeholder="..." {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Table — image thumbnail pattern

Use `next/image` `<Image>` — never a raw `<img>` tag:

```tsx
import Image from 'next/image';

<TableCell>
  {item.imageUrl ? (
    <div className="relative h-12 w-20 overflow-hidden rounded-md">
      <Image
        src={item.imageUrl}
        alt="Thumbnail"
        fill
        className="object-cover"
        sizes="80px"
      />
    </div>
  ) : (
    <div className="bg-muted flex h-12 w-20 items-center justify-center rounded-md">
      <ImageIcon className="text-muted-foreground size-4" />
    </div>
  )}
</TableCell>
```

---

## Management — loadData pattern

```ts
const loadData = async (silent = false) => {
  if (!silent) setLoading(true);
  const [itemsRes] = await Promise.allSettled([
    featureNameService.getAll(),
  ]);
  const itemsData = getValueSettled(itemsRes);
  if (itemsData?.data) setItems(itemsData.data);
  if (!silent) setLoading(false);
};
```

**After CRUD actions:**
```ts
// always call loadData(true) — never reload the page
await featureNameService.create(values);
toast.success('Thêm thành công');
setFormOpen(false);
loadData(true);
```
