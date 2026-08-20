export interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

/** The editable fields of an item (everything except server-managed metadata). */
export type ItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
