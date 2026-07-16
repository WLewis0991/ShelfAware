import { PricingTable } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { getUserPlan } from '@/lib/plans'
import { PLAN_LIMITS, PlanType } from '@/lib/subscription-constants'
import { Check } from 'lucide-react'

export default async function SubscriptionsPage() {
  const user = await currentUser()
  const plan = await getUserPlan()

  return (
    <div className="wrapper py-18 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="page-title">Choose Your Plan</h1>
        <p className="page-description mt-2">
          {user?.firstName ? `${user.firstName}, you're currently on the ` : 'You\'re currently on the '}
          <span className="font-semibold capitalize">{plan}</span> plan.
        </p>
      </div>

      <PricingTable
        for="user"
        appearance={{
          elements: {
            pricingTable: 'clerk-pricing-table',
            pricingTableCard: 'clerk-pricing-card',
            pricingTableCardPopular: 'clerk-pricing-card-popular',
            pricingTableCardActive: 'clerk-pricing-card-active',
            pricingTablePlanName: 'clerk-pricing-plan-name',
            pricingTablePlanDescription: 'clerk-pricing-plan-description',
            pricingTablePrice: 'clerk-pricing-price',
            pricingTableFeatures: 'clerk-pricing-features',
            pricingTableFeature: 'clerk-pricing-feature',
            pricingTableCTA: 'clerk-pricing-cta',
            pricingTableCTACurrent: 'clerk-pricing-cta-current',
          },
        }}
      />

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="section-title text-center mb-8">Plan Comparison</h2>
        <div className="space-y-3">
          {(['free', 'standard', 'pro'] as PlanType[]).map((tier) => {
            const limits = PLAN_LIMITS[tier]
            return (
              <div key={tier} className={`rounded-xl p-6 ${plan === tier ? 'bg-[var(--accent-light)] border-2 border-[var(--accent-warm)]' : 'bg-[var(--bg-card)]'}`}>
                <h3 className="text-xl font-bold capitalize mb-1">{tier}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Books</p>
                    <p className="text-lg font-semibold">{limits.maxBooks === Infinity ? 'Unlimited' : limits.maxBooks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Sessions / Month</p>
                    <p className="text-lg font-semibold">{limits.maxSessionsPerMonth === Infinity ? 'Unlimited' : limits.maxSessionsPerMonth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Max Session</p>
                    <p className="text-lg font-semibold">{limits.maxSessionDurationMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Session History</p>
                    <p className="text-lg font-semibold">{limits.hasSessionHistory ? <Check className="inline size-5 text-[var(--success)]" /> : '—'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
