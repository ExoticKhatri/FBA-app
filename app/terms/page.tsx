import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-slate-800">
            FBA <span className="text-indigo-600">Liquidator</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Effective date: June 1, 2026</p>

        <div className="space-y-8 text-slate-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using FBA Liquidator (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree, you may not use the Service. These terms
              constitute a legally binding agreement between you and FBA Liquidator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Description of Service</h2>
            <p>
              FBA Liquidator is a web-based SaaS tool that helps Amazon FBA sellers model and
              simulate inventory liquidation strategies. The Service provides simulation outputs for
              informational purposes only and does not constitute financial, investment, or business
              advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Account Registration</h2>
            <p>
              You must sign in using a valid Google account. You are responsible for maintaining the
              security of your Google account. You agree to provide accurate information and to
              notify us immediately of any unauthorized use at{" "}
              <a href="mailto:prakashgour453@gmail.com" className="text-indigo-600 hover:underline">
                prakashgour453@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Subscription and Billing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The premium plan is priced at <strong>$19 USD per month</strong> (approximately
                ₹1,817 INR, subject to exchange rate fluctuation at the time of billing).
              </li>
              <li>
                Subscriptions renew automatically on a monthly basis. By subscribing, you authorize
                recurring charges through Razorpay.
              </li>
              <li>
                You may cancel your subscription at any time from your Account page. Cancellation
                takes effect at the end of the current billing period — no further charges will
                occur.
              </li>
              <li>
                All payments are processed securely by Razorpay. We do not store your payment card
                or bank details.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Refund Policy</h2>
            <p>
              We offer a <strong>7-day refund window</strong> for new subscribers who are
              unsatisfied with the Service. To request a refund, contact us at{" "}
              <a href="mailto:prakashgour453@gmail.com" className="text-indigo-600 hover:underline">
                prakashgour453@gmail.com
              </a>{" "}
              within 7 days of your initial payment. Refunds are not available for subsequent
              billing cycles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code</li>
              <li>Share your account credentials with third parties</li>
              <li>Use the Service to scrape, crawl, or harvest data at scale</li>
              <li>Attempt to overwhelm the Service with automated requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Intellectual Property</h2>
            <p>
              All content, algorithms, and software comprising the Service are the property of FBA
              Liquidator. You retain ownership of any data you upload (e.g., CSV files). By
              uploading data, you grant us a limited, non-exclusive license to process that data
              solely to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind, express or implied.
              Simulation results are estimates based on the inputs you provide. FBA Liquidator does
              not guarantee the accuracy, completeness, or profitability of any simulation output.
              You should independently verify any financial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, FBA Liquidator shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of the
              Service, including but not limited to financial losses resulting from decisions made
              based on simulation outputs. Our total liability to you shall not exceed the amount
              you paid for the Service in the three months preceding any claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">10. Service Availability</h2>
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted access.
              We may perform maintenance, updates, or suspend the Service with reasonable notice
              where possible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms.
              You may delete your account at any time by contacting us. Upon termination, your right
              to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India.
              Any disputes shall be subject to the exclusive jurisdiction of courts located in India.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">13. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Material changes will be communicated by
              updating the effective date above. Continued use of the Service after changes
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">14. Contact</h2>
            <p>
              For questions about these Terms, contact us at:{" "}
              <a href="mailto:prakashgour453@gmail.com" className="text-indigo-600 hover:underline">
                prakashgour453@gmail.com
              </a>
            </p>
          </section>
        </div>
      </article>

      <footer className="py-8 border-t border-slate-100 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="hover:text-slate-600">Home</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} FBA Liquidator</p>
      </footer>
    </main>
  );
}
