import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-50 pt-24 pb-20 px-6">
      {/* Soft ambient blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 right-0 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide mb-6">
          Built for Amazon FBA Sellers
        </span>

        <h1 className="text-5xl sm:text-6xl font-bold text-slate-800 leading-tight tracking-tight">
          Stop Bleeding Amazon{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">
            FBA Storage Fees.
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
          Instantly identify the exact inflection point where holding dead stock costs
          more than liquidating it — with a file-in, insight-out simulator.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button size="lg">Launch Free Simulator →</Button>
          </Link>
          <Link href="/dashboard?tab=csv">
            <Button size="lg" variant="ghost">
              Upload Inventory Report
            </Button>
          </Link>
        </div>

        <p className="mt-5 text-xs text-slate-400">
          No credit card required for the free simulator.
        </p>
      </div>
    </section>
  );
}
