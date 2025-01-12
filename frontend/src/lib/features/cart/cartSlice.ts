import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
export type CartItem = {
  _id: number | string;
  title: string;
  price: number;
  amount?: number;
  image: string;
  unit_of_measure: string;
  shop_category: string;
  selectedSize?: string | undefined;
  selectedColor?: string | undefined;
};

export interface CartState {
  cartItems: CartItem[];
  wishlists: AllProduct[];
  isCartOpen: boolean;
  countValue: number;
  selectedSize: string | undefined;
  selectedColor: string | undefined;
}

// Define the initial state using that type
const initialState: CartState = {
  cartItems: [],
  isCartOpen: false,
  wishlists: [],
  countValue: 1,
  selectedSize: undefined,
  selectedColor: undefined,
};

// Create the slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    handleCartOpen(state) {
      state.isCartOpen = !state.isCartOpen;
    },

    // add to cart
    addToCart(state, action: PayloadAction<CartItem>) {
      const existingItem = state.cartItems.find(
        (item) => item._id === action.payload._id
      );

      if (existingItem) {
        existingItem.amount = (existingItem.amount || 1) + 1;
      } else {
        state.cartItems.push({ ...action.payload, amount: 1 });
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      }
    },

    // delete
    removeFromCart(state, action: PayloadAction<number | string>) {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      }
    },

    incrementAmount(state, action: PayloadAction<number | string>) {
      const cartItem = state.cartItems.find(
        (item) => item._id === action.payload
      );
      if (cartItem) {
        cartItem.amount = (cartItem.amount || 1) + 1;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      }
    },

    // decrementamount
    decrementAmount(state, action: PayloadAction<number | string>) {
      const cartItem = state.cartItems.find(
        (item) => item._id === action.payload
      );
      if (cartItem) {
        cartItem.amount = Math.max((cartItem.amount || 1) - 1, 1);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      }
    },

    // add to wishlist
    toggleToWishlists(state, action: PayloadAction<AllProduct>) {
      const existingItem = state.wishlists.find(
        (item) => item._id === action.payload._id
      );

      if (existingItem) {
        state.wishlists = state.wishlists.filter(
          (item) => item._id !== action.payload._id
        );
      } else {
        state.wishlists.push(action.payload);
      }
    },

    // counter
    handleCountValue(
      state,
      action: PayloadAction<"increment" | "decrement" | "none">
    ) {
      if (action.payload === "increment") {
        state.countValue += 1;
      } else if (action.payload === "decrement") {
        state.countValue = Math.max(state.countValue - 1, 1);
      } else {
        state.countValue = 1;
      }
    },

    // selected color
    handleColorChange(state, action: PayloadAction<string | undefined>) {
      state.selectedColor = action.payload;
    },

    // selected Sizes
    handleSizeChange(state, action: PayloadAction<string | undefined>) {
      state.selectedSize = action.payload;
    },

    // Hydrate cart from localStorage
    hydrateCart(state) {
      if (typeof window !== "undefined") {
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart) {
          state.cartItems = JSON.parse(savedCart);
        }
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementAmount,
  decrementAmount,
  toggleToWishlists,
  handleCartOpen,
  handleCountValue,
  handleColorChange,
  handleSizeChange,
  hydrateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
