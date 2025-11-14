
export interface Product {
  id: string;
  name: string;
  cost: number;
  price: number;
  stock: number;
  promotion: number; // e.g., 0.1 for 10% discount
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  saleDate: Date;
  pricePerUnit: number;
  promotionApplied: number;
}
