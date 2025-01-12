"use client";

import { removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import { totalPrice } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import Skeleton from "../loader/Skeleton";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";
import fetchData from "@/lib/fetchDataFromApi";
import { useRouter } from "next/navigation";
import { clearAddresses } from "@/lib/features/address/addressSlice";
import { LuLoader } from "react-icons/lu";

const paymentMethods = [
  {
    title: "cash on delivery",
  },
];

const OrderSummery = () => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { cartItems } = useAppSelector((state) => state.cartSlice);
  const { billingAddress, shippingAddress } = useAppSelector((state) => state.addressSlice);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();

  const handleSelectMethod = (title: string) => {
    setSelectedMethod(title);
  };

  const placeOrder = async () => {
    if (!billingAddress || !shippingAddress) {
      toast({
        title: "Error",
        description: "Please fill both billing and shipping addresses",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.amount,
          price: item.price
        })),
        billingAddress,
        shippingAddress,
        paymentMethod: selectedMethod,
        totalAmount: totalPrice(cartItems) + 20, // Including shipping and tax
        status: "pending"
      };

      const response = await fetchData.post("/orders", orderData);
      
      if (response.data) {
        dispatch(clearCart());
        dispatch(clearAddresses());
        toast({
          title: "Success",
          description: "Order placed successfully!",
          variant: "success",
        });
        router.push("/orders");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <AnimatePresence>
      <div className="order-summery">
        <h2 className="text-2xl font-bold mb-5">Order Summary</h2>
        <div className="pb-4">
          {cartItems.length <= 0 && (
            <div className="text-center py-6">No product selected!</div>
          )}
          {cartItems.map((item) => (
            <motion.div
              layout
              key={item._id}
              className="group flex justify-between items-end py-3 hover:bg-accent px-3 rounded-lg relative"
            >
              <Button
                type="button"
                variant="outline"
                className="absolute top-1 right-2 h-7 w-7 p-0 text-base rounded-full hover:text-primary hover:border-primary hidden group-hover:flex"
                onClick={() => dispatch(removeFromCart(item._id))}
              >
                <HiMiniXMark />
              </Button>
              <div className="flex gap-3">
                <Image
                  src={item.image}
                  width={50}
                  height={50}
                  alt={item.title}
                  className="object-cover rounded-md"
                />
                <div>
                  <Link
                    href={`/products/${item._id}`}
                    className="line-clamp-1 hover:text-primary hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-muted-foreground">
                    {item.amount} {item.unit_of_measure} * ${item.price}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                ${Number(item.price) * (item?.amount || 1)}
              </p>
            </motion.div>
          ))}
        </div>

        {cartItems.length > 0 && (
          <div className="pb-5 pt-3">
            <h3 className="text-xl font-medium text-center">
              Select Payment Method
            </h3>
            <div className="flex gap-4 items-center mt-4">
              {paymentMethods.map((method) => (
                <Card
                  className={`${
                    method.title === selectedMethod
                      ? "text-primary border-primary"
                      : ""
                  } cursor-pointer`}
                  key={method.title}
                  onClick={() => handleSelectMethod(method.title)}
                >
                  <CardHeader>
                    <CardTitle className="text-base capitalize">
                      {method.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-5 border-t pt-4">
          <div className="flex justify-between font-semibold">
            <p>Subtotal</p>
            <p>${totalPrice(cartItems)}</p>
          </div>
          <div className="flex justify-between">
            <p>Shipping</p>
            <p className="text-muted-foreground">$10</p>
          </div>
          <div className="flex justify-between">
            <p>Tax</p>
            <p className="text-muted-foreground">$10</p>
          </div>
          <div className="flex justify-between font-semibold">
            <p>Total</p>
            <p>${totalPrice(cartItems) + 20}</p>
          </div>
        </div>
        <Button
          type="button"
          disabled={cartItems.length <= 0 || selectedMethod === "" || isLoading}
          className="w-full mt-5 capitalize flex items-center gap-2"
          onClick={placeOrder}
        >
          <span>Place Order</span>
          {isLoading && (
            <span className="text-base animate-spin">
              <LuLoader />
            </span>
          )}
        </Button>
      </div>
    </AnimatePresence>
  ) : (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 rounded-2xl w-full max-[200px]" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg w-full" />
      ))}

      <Skeleton className="h-7 rounded-lg w-full max-[150px] mx-auto py-4" />

      {[...Array(4)].map((_, i) => (
        <div className="flex justify-between items-center" key={i}>
          <Skeleton className="h-5 rounded-lg w-16" />
          <Skeleton className="h-5 rounded-lg w-10" />
        </div>
      ))}
    </div>
  );
};

export default OrderSummery;
