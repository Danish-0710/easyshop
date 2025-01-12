import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AddressType {
  title: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  streetAddress: string;
}

interface AddressState {
  billingAddress: AddressType | null;
  shippingAddress: AddressType | null;
}

const initialState: AddressState = {
  billingAddress: null,
  shippingAddress: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setBillingAddress: (state, action: PayloadAction<AddressType>) => {
      state.billingAddress = action.payload;
    },
    setShippingAddress: (state, action: PayloadAction<AddressType>) => {
      state.shippingAddress = action.payload;
    },
    clearAddresses: (state) => {
      state.billingAddress = null;
      state.shippingAddress = null;
    },
  },
});

export const { setBillingAddress, setShippingAddress, clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;
