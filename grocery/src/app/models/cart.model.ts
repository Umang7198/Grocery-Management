import { Product } from "./product.model";

  export interface Cart{
    id:number;
    userId:number;
    items: Product [];
  };