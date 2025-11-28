// productMixin.ts
import { toggleWishlist } from './productItemSlice';
import { toggleBasketItem, updateBasketItemAmount } from '../basket/basketSlice';

export const addProductHandlers = (builder: any, getProductsSelector: (state: any) => any[]) => {
  builder
    .addCase(toggleWishlist.fulfilled, (state: any, action: any) => {
      const id = action.meta.arg.id;
      const products = getProductsSelector(state);
      const index = products.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        products[index].in_wishlist = !products[index].in_wishlist;
      }
    })
    .addCase(toggleBasketItem.fulfilled, (state: any, action: any) => {
      const { id, enable } = action.meta.arg;
      const products = getProductsSelector(state);
      const index = products.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        products[index].cart_count = enable ? 1 : 0;
      }
    })
    .addCase(updateBasketItemAmount.fulfilled, (state: any, action: any) => {
      const update = action.payload;
      const products = getProductsSelector(state);
      
      if (!update) {
        const { id } = action.meta.arg;
        const index = products.findIndex((item: any) => item.id === id);
        if (index !== -1) {
          products[index].cart_count = 0;
        }
        return;
      }

      const index = products.findIndex((item: any) => item.id === update.item.id);
      if (index !== -1) {
        products[index].cart_count = update.amount;
      }
    });
};