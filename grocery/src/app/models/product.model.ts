export interface Product {
    id: number;
    name: string;
    price: number;
    movedToCart:boolean;
    imgLink: string;
    description: string;
    quantity: number; // Assuming this is stock
    category: string;
  }