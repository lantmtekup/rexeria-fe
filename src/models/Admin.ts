import { Schema, type Types } from 'mongoose';

import { getOrCreateModel } from '@/models/registry';
import { AdminRole } from '@/settings/enums';

export interface AdminDoc {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  name?: string;
  role: AdminRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const adminSchema = new Schema<AdminDoc>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.ADMIN,
    },
  },
  { timestamps: true }
);

export const AdminModel = getOrCreateModel<AdminDoc>('Admin', adminSchema);
