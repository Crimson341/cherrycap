import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giveaway Rules",
  description: "Official giveaway rules and terms for Cherry Capital promotions.",
  alternates: {
    canonical: "/giveaway-rules",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function GiveawayRulesPage() {
  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Official Giveaway Rules</h1>
      
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Sponsor</h2>
          <p>
            This giveaway is sponsored by Cherry Capital, located in Michigan, United States.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. No Purchase Necessary</h2>
          <p>
            No purchase or payment is necessary to enter or win. A purchase will not improve your chances of winning.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Eligibility</h2>
          <p>
            Open to legal residents of the United States who are 18 years of age or older at the time of entry. 
            Employees of Cherry Capital and their immediate family members are not eligible to participate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Entry Period</h2>
          <p>
            Entries will be accepted from the date this giveaway is announced through October 31, 2025 at 11:59 PM EST. 
            All entries must be received by this deadline to be eligible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. How to Enter</h2>
          <p>
            To enter, complete the entry form on our website at cherrycapitalweb.com. Provide your name, email, 
            profession, skills, and optional portfolio/LinkedIn URLs. Limit one entry per person. Multiple entries 
            from the same person will be disqualified.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Winner Selection</h2>
          <p>
            One (1) winner will be selected via random drawing from all eligible entries received. The drawing 
            will take place on or after November 1, 2025. Odds of winning depend on the number of eligible entries received.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Prize</h2>
          <p>One (1) prize will be awarded consisting of:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Custom-built portfolio website designed and developed by Cherry Capital</li>
            <li>Professional design optimized for the winner&apos;s profession</li>
            <li>Mobile-responsive design</li>
            <li>SEO optimization</li>
            <li>3 months of web hosting (starting from project launch date)</li>
            <li>3 months of technical support (starting from project launch date)</li>
          </ul>
          <p className="mt-2">
            Prize is provided as a professional service with no cash value. Prize is non-transferable. 
            No substitution or cash equivalent permitted except at sponsor&apos;s discretion. Website will 
            include a small &quot;Built by Cherry Capital&quot; credit link in the footer as part of the agreement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">8. Winner Notification</h2>
          <p>
            The winner will be notified by email within 7 days of the drawing. If the winner does not respond 
            within 7 days of notification, the prize may be forfeited and an alternate winner may be selected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">9. Privacy</h2>
          <p>
            Information collected from entrants will be used solely for the purpose of administering this giveaway 
            and contacting the winner. We will not sell, share, or distribute your information to third parties. 
            See our privacy practices in the entry form disclosure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">10. Limitation of Liability</h2>
          <p>
            By entering, participants agree to release and hold harmless Cherry Capital, its owners, employees, 
            and agents from any and all liability for any injuries, losses, or damages of any kind arising from 
            participation in this giveaway or acceptance/use of the prize.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">11. General Conditions</h2>
          <p>
            Sponsor reserves the right to cancel, suspend, or modify the giveaway if fraud, technical failures, 
            or any other factor beyond sponsor&apos;s reasonable control impairs the integrity or proper functioning 
            of the giveaway. Sponsor reserves the right to disqualify any individual found to be tampering with 
            the entry process or violating these rules.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">12. Governing Law</h2>
          <p>
            This giveaway is governed by the laws of the State of Michigan, without regard to conflicts of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">13. Contact Information</h2>
          <p>
            For questions about this giveaway, contact:<br />
            Cherry Capital<br />
            Email: hello@cherrycapitalweb.com<br />
            Phone: (616) 260-9863
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t">
        <p className="text-xs text-muted-foreground">
          Last updated: October 18, 2025
        </p>
      </div>
    </div>
  );
}
