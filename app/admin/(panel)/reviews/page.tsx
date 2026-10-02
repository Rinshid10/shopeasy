import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReviewsList } from "@/components/admin/reviews/ReviewsList";
import { getAdminReviews } from "@/lib/admin/queries";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Ratings from customers whose orders were delivered. Hide any that are abusive or fake."
      />
      <ReviewsList reviews={reviews} />
    </>
  );
}
