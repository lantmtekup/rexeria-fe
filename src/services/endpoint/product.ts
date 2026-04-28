const prefix = '/api/products';

export const productEndpoint = {
  LIST: prefix,
  CREATE: prefix,
  byId: (id: string) => `${prefix}/${id}`,
};
