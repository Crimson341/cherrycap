"use client";

import { useState } from 'react';
import { Check, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { WEB_DESIGN_PRICING, MONTHLY_SERVICES } from '@/utils/constants';

const Pricing = () => {
  const [showMonthly, setShowMonthly] = useState(false);

  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-40">
      {/* Background effects - slate/silver tones */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-neutral-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-slate-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-neutral-300 font-medium">Transparent Pricing</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight"
          >
            No hidden fees.{" "}
            <span className="bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              Just honest pricing.
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Unlike most agencies, we tell you exactly what it costs upfront. No surprises, no scope creep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center bg-muted/50 border border-border rounded-full p-1"
          >
            <button
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${!showMonthly
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
              onClick={() => setShowMonthly(false)}
            >
              Website Packages
            </button>
            <button
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${showMonthly
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
              onClick={() => setShowMonthly(true)}
            >
              Monthly Support
            </button>
          </motion.div>
        </div>

        {/* Website Packages */}
        {!showMonthly && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {WEB_DESIGN_PRICING.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className={`relative rounded-2xl border ${plan.highlighted
                    ? 'border-neutral-600/50 bg-gradient-to-b from-neutral-800/50 to-transparent scale-[1.02] shadow-xl shadow-neutral-500/10'
                    : 'border-border bg-card/50 hover:border-border/80'
                  } p-6 transition-all duration-300`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-neutral-500/20 rounded-full blur-[2px]" />
                      <div className="relative px-4 py-1.5 bg-gradient-to-r from-neutral-100 to-neutral-300 rounded-full">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-900 animate-pulse" />
                          <span className="text-xs font-medium text-neutral-900">Most Popular</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{plan.description}</p>
                  
                  {/* Timeline badge */}
                  <div className="flex items-center gap-2 mt-4 text-sm">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span className="text-muted-foreground">Delivered in {plan.timeline}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Check className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${plan.highlighted
                      ? 'bg-neutral-100 hover:bg-white text-neutral-900'
                      : 'border border-border text-foreground hover:bg-muted'
                    }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Monthly Support Plans */}
        {showMonthly && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {MONTHLY_SERVICES.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className={`relative rounded-2xl border ${index === 1
                    ? 'border-neutral-600/50 bg-gradient-to-b from-neutral-800/50 to-transparent'
                    : 'border-border bg-card/50 hover:border-border/80'
                  } p-6 transition-all duration-300`}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Check className={`h-4 w-4 flex-shrink-0 ${index === 1 ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors ${index === 1
                      ? 'bg-neutral-100 hover:bg-white text-neutral-900'
                      : 'border border-border text-foreground hover:bg-muted'
                    }`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div className="text-left">
              <p className="font-medium text-foreground">Not sure what you need?</p>
              <p className="text-sm text-muted-foreground">Let's chat—no sales pitch, just honest advice.</p>
            </div>
            <a
              href="#contact"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 hover:bg-white text-neutral-900 font-medium transition-colors"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
