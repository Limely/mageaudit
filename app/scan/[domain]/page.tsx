import type { Metadata } from "next";
import { getReport } from "@/lib/scanner/store";
import { bareDomain } from "@/lib/domain";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StoreReport from "@/components/StoreReport";

// Per-store report pages are private/unlisted: reachable by URL but never
// indexed, so we don't publish third-party stores' findings to search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Reads the report store at request time.
export const dynamic = "force-dynamic";

export default async function StoreScanPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const decoded = bareDomain(decodeURIComponent(domain));
  const initialReport = await getReport(decoded);

  return (
    <>
      <Nav />
      <main className="flex-1 pt-24 md:pt-28 pb-20 px-4 bg-gray-50/60">
        <StoreReport domain={decoded} initialReport={initialReport} />
      </main>
      <Footer />
    </>
  );
}
