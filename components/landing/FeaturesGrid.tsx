import Card from "@/components/ui/Card";

const features = [
  {
    icon: "📂",
    title: "CSV Ingestion",
    desc: "Upload any Amazon Inventory Health or Recommended Removal report. Map columns yourself — works with every Amazon market.",
    badge: "Premium",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },
  {
    icon: "📈",
    title: "Multi-Scenario Analysis",
    desc: "Compare Do Nothing, Aggressive Discount, Amazon Outlet, and Removal Order strategies side-by-side on a single interactive Plotly chart.",
    badge: "Premium",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },
  {
    icon: "💳",
    title: "Simple One-Click Unlock",
    desc: "No annual contracts. Subscribe monthly via Razorpay, unlock all premium features instantly, and cancel anytime.",
    badge: "₹999/mo",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-16 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-semibold text-indigo-500 tracking-widest uppercase mb-2">
          What You Get
        </p>
        <h2 className="text-center text-3xl font-bold text-slate-800 mb-12">
          Everything a seller needs to liquidate smarter.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="text-4xl">{f.icon}</div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-800">{f.title}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.badgeColor}`}>
                  {f.badge}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
