import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

/** The storefront: header, page content and footer; on phones, a bottom tab bar instead of the footer. */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-ink px-4 py-2 font-semibold text-surface focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to main content
      </a>
      <Header />
      {/* At least a screen tall, so the footer never jumps down as content loads in. */}
      <main id="main-content" className="min-h-dvh flex-1">
        {children}
      </main>
      <div className="max-md:hidden">
        <Footer />
        <BackToTop />
      </div>
      <MobileTabBar />
    </>
  );
}
