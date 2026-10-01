import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CouponsManager } from "@/components/admin/coupons/CouponsManager";
import { getCoupons } from "@/lib/admin/queries";

export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Discount codes customers can use at checkout. Turn them on or off any time."
      />
      <CouponsManager coupons={coupons} />
    </>
  );
}
