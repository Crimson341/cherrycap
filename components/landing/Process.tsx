"use client";

import { Chip } from "@heroui/react";
import { motion } from "motion/react";
import { PROCESS_STEPS } from "@/utils/constants";

export function Process() {
  return (
    <section className="relative z-20 bg-black py-32 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
             <Chip 
              variant="soft" 
              className="bg-emerald-500/10 border border-emerald-500/20 mb-6 text-emerald-400 font-medium"
            >
              How We Work
            </Chip>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Simple process,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              exceptional results
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            We&apos;ve refined our process to deliver projects on time, every time.
          </p>
        </motion.div>

        {/* Process steps */}
        <div className="grid md:grid-cols-4 gap-8">
          {PROCESS_STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              {/* Connector line */}
              {i < 3 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}
              
              <motion.div
                className="relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className="text-6xl font-bold text-white/5 block mb-4"
                  whileHover={{ color: "rgba(255,255,255,0.1)" }}
                >
                  {item.step}
                </motion.span>
                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
