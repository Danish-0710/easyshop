import ProductGrid from "@/components/ProductGrid";
import SelectedFilters from "@/components/filters/SelectedFilters";
import ProductLoader from "@/components/loader/ProductLoader";
import { Suspense, useSearchParams } from "react";

export const dynamic = 'force-dynamic';

type ShopPageProps = {
  params: {
    shop: string;
    category: string;
  };
};

const ShopPage = ({ params }: ShopPageProps) => {
  const [searchParams] = useSearchParams();
  
  const suspenseKey = `${params.shop}-${searchParams.get('q') || ''}-${searchParams.get('page') || '1'}`;
  
  return (
    <section className="shop-page">
      <SelectedFilters />
      <Suspense
        key={suspenseKey}
        fallback={<ProductLoader />}
      >
        <ProductGrid searchParams={searchParams} params={params} />
      </Suspense>
    </section>
  );
};

export default ShopPage;
