import mongoose, { Model, Schema } from 'mongoose';

/** Use when defining models so HMR does not re-register the same model name. */
export const getOrCreateModel = <TDoc>(
  name: string,
  schema: Schema<TDoc>
): Model<TDoc> =>
  (mongoose.models[name] as Model<TDoc> | undefined) ??
  mongoose.model<TDoc>(name, schema);
