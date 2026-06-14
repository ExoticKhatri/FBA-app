import Link from "next/link";

export default function PrivacyPage() {
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

      <article className="max-w-3xl mx-auto px-6 py-12 prose prose-slate">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Effective date: June 1, 2026</p>

        <div className="space-y-8 text-slate-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Who We Are</h2>
            <p>
              FBA Liquidator (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a web-based SaaS tool that helps
              Amazon FBA sellers simulate liquidation strategies. Our application is accessible at{" "}
              <a href="https://fba-flax.vercel.app" className="text-indigo-600 hover:underline">
                https://fba-flax.vercel.app
              </a>
              . For privacy questions, contact us at{" "}
              <a href="mailto:prakashgour453@gmail.com" className="text-indigo-600 hover:underline">
                prakashgour453@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account information:</strong> When you sign in with Google, we receive your
                name, email address, and profile picture from Google. We do not store your Google
                password.
              </li>
              <li>
                <strong>Payment information:</strong> When you subscribe, Razorpay processes your
                payment. We receive only a subscription status confirmation — no raw card or bank
                details are ever stored on our servers.
              </li>
              <li>
                <strong>Simulation data:</strong> CSV files you upload and simulation inputs you
                enter are processed in your browser session and are not permanently stored on our
                servers beyond what is required to display results.
              </li>
              <li>
                <strong>Usage data:</strong> We may collect anonymized usage analytics (pages
                visited, feature usage) to improve the service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. How We Store Your Data</h2>
            <p>
              Account and subscription data is stored in{" "}
              <strong>Supabase</strong> (hosted on AWS). Row-Level Security (RLS) policies ensure
              you can only access your own data. We retain your account data for as long as your
              account is active.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services, each with their own privacy policies:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Google OAuth</strong> — sign-in identity provider.{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <strong>Razorpay</strong> — payment processing.{" "}
                <a
                  href="https://razorpay.com/privacy/"
                  className="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Razorpay Privacy Policy
                </a>
              </li>
              <li>
                <strong>OpenAI</strong> — AI-powered analysis features. Prompts sent to our AI
                endpoint may include your simulation data.{" "}
                <a
                  href="https://openai.com/policies/privacy-policy"
                  className="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenAI Privacy Policy
                </a>
              </li>
              <li>
                <strong>Vercel</strong> — application hosting and edge delivery.{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  className="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel Privacy Policy
                </a>
              </li>
              <li>
                <strong>Supabase</strong> — database and authentication infrastructure.{" "}
                <a
                  href="https://supabase.com/privacy"
                  className="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To authenticate you and maintain your session</li>
              <li>To track your subscription status and grant access to premium features</li>
              <li>To provide AI-powered simulation analysis when you use those features</li>
              <li>To send transactional emails related to your account (e.g., subscription receipts)</li>
              <li>To improve and debug our service</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Cookies and Sessions</h2>
            <p>
              We use HTTP-only cookies to manage your authentication session (via Supabase SSR).
              These cookies are strictly necessary for the application to function and are not used
              for advertising tracking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for data processing at any time</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:prakashgour453@gmail.com" className="text-indigo-600 hover:underline">
                prakashgour453@gmail.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Data Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption in
              transit, Row-Level Security on the database, and environment-variable-only secret
              management. No system is 100% secure; we will notify you of any breach as required
              by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              FBA Liquidator is not directed at children under 13. We do not knowingly collect
              personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes will be communicated
              by updating the effective date above and, where appropriate, by email notification.
              Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">11. Contact</h2>
            <p>
              For any privacy-related questions or requests, please contact:{" "}
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
