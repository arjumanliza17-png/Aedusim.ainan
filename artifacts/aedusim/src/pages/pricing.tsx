import { useState } from "react";
import {
  Check, X, Crown, Zap, Shield, Lock, Smartphone, Copy, CheckCircle2,
  Tag, Loader2, PartyPopper, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProfileQueryKey, useGetProfile } from "@workspace/api-client-react";

const BKASH_NUMBER = "01936234094";

const PLANS = [
  {
    key: "free",
    name: "Starter",
    price: null,
    priceLabel: "Free",
    period: "",
    desc: "A focused starting point for consistent learning.",
    icon: <Shield className="w-5 h-5 text-muted-foreground" />,
    color: "border-border/50",
    highlight: false,
    cta: "Current Plan",
    ctaVariant: "outline" as const,
    features: [
      { label: "Physics Mechanics starter path", ok: true },
      { label: "Foundations-level lessons", ok: true },
      { label: "Falcoa AI chat (10 msg/day)", ok: true },
      { label: "Up to 3 saved documents", ok: true },
      { label: "Daily challenges and XP", ok: true },
      { label: "Personal progress profile", ok: true },
      { label: "All other subjects and chapters", ok: false },
      { label: "Unlimited AI messages", ok: false },
      { label: "Unlimited document library", ok: false },
      { label: "Advanced lessons and simulations", ok: false },
    ],
  },
  {
    key: "pro",
    name: "Pro Matrix",
    price: 99,
    priceLabel: "99",
    period: "BDT / month",
    desc: "The complete curriculum for serious learners.",
    icon: <Zap className="w-5 h-5 text-primary" />,
    color: "border-primary/60",
    highlight: true,
    cta: "Upgrade to Pro",
    ctaVariant: "default" as const,
    features: [
      { label: "All subjects and chapters", ok: true },
      { label: "Foundations, Intermediate, Advanced", ok: true },
      { label: "Unlimited Falcoa AI messages", ok: true },
      { label: "Unlimited document library", ok: true },
      { label: "Interactive simulations", ok: true },
      { label: "Real-life problem scenarios", ok: true },
      { label: "Advanced AI study modes", ok: true },
      { label: "Priority support", ok: true },
    ],
  },
  {
    key: "elite",
    name: "Elite Override",
    price: 1100,
    priceLabel: "1100",
    period: "BDT / year",
    desc: "Everything in Pro with the best annual value.",
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    color: "border-amber-500/40",
    highlight: false,
    cta: "Go Elite",
    ctaVariant: "outline" as const,
    features: [
      { label: "Everything in Pro", ok: true },
      { label: "Annual billing and 10% savings", ok: true },
      { label: "Early access to new learning features", ok: true },
      { label: "Priority support queue", ok: true },
      { label: "All subjects and chapters", ok: true },
      { label: "Unlimited AI and documents", ok: true },
      { label: "Interactive simulations and advanced lessons", ok: true },
    ],
  },
];

type CouponData = {
  code: string;
  description: string;
  discount: number;
  type: "percentage" | "flat";
  plan: string;
  isFree: boolean;
};

function calcDiscountedPrice(originalPrice: number | null, coupon: CouponData): number | null {
  if (!originalPrice) return null;
  if (coupon.type === "percentage") {
    return Math.max(0, Math.round(originalPrice * (1 - coupon.discount / 100)));
  }
  return Math.max(0, originalPrice - coupon.discount);
}

// ─── bKash Payment Modal ──────────────────────────────────────────────────────

function BkashModal({
  open,
  onClose,
  plan,
  coupon,
}: {
  open: boolean;
  onClose: () => void;
  plan: typeof PLANS[0] | null;
  coupon: CouponData | null;
}) {
  const [copied, setCopied] = useState(false);
  if (!plan) return null;

  const discountedPrice = coupon && coupon.plan === plan.key
    ? calcDiscountedPrice(plan.price, coupon)
    : null;

  const displayPrice = discountedPrice !== null ? discountedPrice : plan.price;

  const handleCopy = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Smartphone className="w-5 h-5 text-pink-500" />
            Pay via bKash
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Follow the steps below to upgrade to <span className="font-semibold text-foreground">{plan.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan summary */}
          <div className={`p-3 rounded-xl border ${plan.color} bg-card/30 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {plan.icon}
              <span className="font-semibold text-sm">{plan.name}</span>
            </div>
            <div className="text-right">
              {discountedPrice !== null && discountedPrice < (plan.price ?? 0) ? (
                <div>
                  <p className="text-xs line-through text-muted-foreground">৳{plan.priceLabel}</p>
                  <p className="font-bold text-lg text-green-400">৳{discountedPrice}</p>
                  <p className="text-[10px] text-muted-foreground">{plan.period}</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-lg">৳{plan.priceLabel}</p>
                  <p className="text-[10px] text-muted-foreground">{plan.period}</p>
                </div>
              )}
            </div>
          </div>

          {/* Coupon applied badge */}
          {coupon && coupon.plan === plan.key && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
              <Tag className="w-3.5 h-3.5 shrink-0" />
              Coupon <span className="font-bold">{coupon.code}</span> applied —{" "}
              {coupon.type === "percentage" ? `${coupon.discount}% off` : `৳${coupon.discount} off`}
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {[
              {
                step: "1",
                title: "Send Payment",
                desc: (
                  <span>
                    Open your bKash app and send{" "}
                    <span className="font-bold text-foreground">৳{displayPrice}</span> to the number below.
                  </span>
                ),
              },
              {
                step: "2",
                title: "Add Your Name as Reference",
                desc: "In the payment reference/note field, write your name so the admin can identify you.",
              },
              {
                step: "3",
                title: "Wait for Admin Approval",
                desc: "The admin will verify your payment and activate your plan within 24 hours.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* bKash number */}
          <div className="rounded-xl border border-pink-500/30 bg-pink-500/5 p-4">
            <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-medium">bKash Number (Personal)</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold tracking-wider text-pink-400">{BKASH_NUMBER}</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              After payment, your plan will be activated by the admin. If you don't receive approval within 24 hours, contact support.
            </p>
          </div>

          <Button className="w-full" onClick={onClose}>
            I've Sent the Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Coupon Section ───────────────────────────────────────────────────────────

function CouponSection({
  onCouponApplied,
}: {
  onCouponApplied: (coupon: CouponData | null) => void;
}) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [redeemed, setRedeemed] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setCoupon(null);
    onCouponApplied(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid coupon"); return; }
      setCoupon(data);
      onCouponApplied(data);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!coupon) return;
    setRedeemLoading(true);
    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to redeem"); return; }
      setRedeemed(data.message);
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    } catch {
      setError("Network error — please try again");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setCoupon(null);
    setError(null);
    setRedeemed(null);
    onCouponApplied(null);
  };

  if (redeemed) {
    return (
      <div className="max-w-lg mx-auto mb-10 p-5 rounded-2xl border border-green-500/30 bg-green-500/5 flex flex-col items-center gap-2 text-center">
        <PartyPopper className="w-8 h-8 text-green-400" />
        <p className="font-bold text-green-400 text-base">{redeemed}</p>
        <p className="text-xs text-muted-foreground">Your plan has been updated. Refresh the page to see your new features.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mb-10">
      <div className="p-5 rounded-2xl border border-border/40 bg-card/20">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Have a coupon code?</h3>
        </div>

        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleValidate()}
            placeholder="Enter code e.g. WELCOME50"
            className="bg-background/50 font-mono tracking-wider uppercase"
            disabled={!!coupon}
          />
          {coupon ? (
            <Button variant="outline" onClick={handleClear} className="shrink-0">
              Clear
            </Button>
          ) : (
            <Button onClick={handleValidate} disabled={!code.trim() || loading} className="shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <X className="w-3.5 h-3.5 shrink-0" /> {error}
          </p>
        )}

        {/* Valid coupon info */}
        {coupon && (
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-400">
                  {coupon.isFree
                    ? `Free ${coupon.plan.charAt(0).toUpperCase() + coupon.plan.slice(1)} upgrade!`
                    : coupon.type === "percentage"
                    ? `${coupon.discount}% off ${coupon.plan} plan`
                    : `৳${coupon.discount} off ${coupon.plan} plan`}
                </p>
                {coupon.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{coupon.description}</p>
                )}
              </div>
            </div>

            {coupon.isFree ? (
              <Button
                onClick={handleRedeem}
                disabled={redeemLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {redeemLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Activating…</>
                  : <><PartyPopper className="w-4 h-4 mr-2" /> Activate Free {coupon.plan.charAt(0).toUpperCase() + coupon.plan.slice(1)} Plan</>}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                Discount applies when you click Upgrade below — the reduced price will show in the payment window.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { data: profile } = useGetProfile();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<CouponData | null>(null);
  const currentPlan = profile?.plan ?? "free";

  const handleUpgrade = (plan: typeof PLANS[0]) => {
    if (plan.key === "free") return;
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const getDiscountedLabel = (plan: typeof PLANS[0]) => {
    if (!activeCoupon || activeCoupon.plan !== plan.key || plan.price === null) return null;
    const dp = calcDiscountedPrice(plan.price, activeCoupon);
    if (dp === null || dp === plan.price) return null;
    return dp;
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" /> UPGRADE YOUR PLAN
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Unlock the full Aedusim experience
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Three clear tiers. Upgrade when you need more depth, breadth, and capacity.
          </p>
        </div>

        {/* Coupon section */}
        <CouponSection onCouponApplied={setActiveCoupon} />

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => {
            const discountedPrice = getDiscountedLabel(plan);
            const isCurrentPlan = plan.key === currentPlan;
            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-3xl border p-6 ${plan.color} ${
                  plan.highlight ? "shadow-[0_0_40px_rgba(59,130,246,0.15)] bg-card/60" : "bg-card/30"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute right-4 top-4 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Current
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    {plan.icon}
                    <span className="font-bold text-base">{plan.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    {plan.key === "free" ? (
                      <span className="text-3xl font-bold">Free</span>
                    ) : discountedPrice !== null ? (
                      <>
                        <span className="text-2xl font-bold text-muted-foreground">৳</span>
                        <span className="text-xl line-through text-muted-foreground/50 mr-1">{plan.priceLabel}</span>
                        <span className="text-3xl font-bold text-green-400">{discountedPrice}</span>
                        <span className="text-xs text-muted-foreground mb-1">{plan.period}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-muted-foreground">৳</span>
                        <span className="text-3xl font-bold">{plan.priceLabel}</span>
                        <span className="text-xs text-muted-foreground mb-1">{plan.period}</span>
                      </>
                    )}
                  </div>
                  {discountedPrice !== null && activeCoupon && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 mt-1">
                      <Tag className="w-2.5 h-2.5" /> {activeCoupon.code} applied
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2 text-xs">
                      {f.ok
                        ? <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        : <X className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />}
                      <span className={f.ok ? "text-foreground/80" : "text-muted-foreground/50"}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full font-semibold ${
                    plan.highlight
                      ? "bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : plan.key === "elite"
                      ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                      : ""
                  }`}
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrentPlan || plan.key === "free"}
                >
                  {isCurrentPlan ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Current plan</>
                  ) : plan.key === "free" ? (
                    <><Lock className="w-4 h-4 mr-2" /> Starter plan</>
                  ) : plan.key === "pro" ? (
                    <><Zap className="w-4 h-4 mr-2" /> {plan.cta}</>
                  ) : (
                    <><Crown className="w-4 h-4 mr-2" /> {plan.cta}</>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* bKash info banner */}
        <div className="p-5 rounded-2xl border border-pink-500/20 bg-pink-500/5 flex items-center gap-4 mb-8">
          <Smartphone className="w-6 h-6 text-pink-400 shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-0.5">Payment via bKash</p>
            <p className="text-xs text-muted-foreground">
              Send payment to <span className="font-bold text-pink-400">{BKASH_NUMBER}</span> (Personal). Include your name as reference. Admin will verify and activate your plan within 24 hours.
            </p>
          </div>
        </div>

        {/* Feature comparison note */}
        <div className="mt-4 p-5 rounded-2xl border border-border/40 bg-card/20">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">Choose the right learning lane</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">📚 Subjects</p>
              <p>Starter includes a focused Physics Mechanics path. Pro and Elite open the complete subject library.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">🎯 Levels</p>
              <p>Starter is designed for foundations. Pro and Elite unlock the full foundations-to-advanced progression.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">🎬 Rich content</p>
              <p>Interactive simulations, richer scenarios, and unlimited study capacity are included with Pro and Elite.</p>
            </div>
          </div>
        </div>
      </div>

      {/* bKash Modal */}
      <BkashModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
        coupon={activeCoupon}
      />
    </div>
  );
}
