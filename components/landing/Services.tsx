"use client";

import { Card, CardHeader, CardContent, CardFooter, Button, Chip } from "@heroui/react";
import { motion } from "motion/react";
import { SERVICES } from "@/utils/constants";
import { getServiceIcon } from "./ServiceIcons";

export function Services() {
  return (
    <section className="relative z-20 bg-black py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
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
              className="bg-violet-500/10 border border-violet-500/20 mb-6 text-violet-400 font-medium"
            >
              Our Services
            </Chip>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              dominate online
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            From stunning designs to powerful development, we craft digital experiences
            that convert visitors into customers.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card 
                className="group relative h-full bg-white/[0.02] border-white/10 backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-500 cursor-pointer"
              >
                {/* Gradient blob on hover */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${service.gradient} rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} />
                
                <CardHeader className="flex flex-col items-start gap-4 p-8 pb-0 z-10">
                  <motion.div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.gradient}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {getServiceIcon(service.icon)}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                </CardHeader>
                
                <CardContent className="p-8 py-4 z-10">
                  <p className="text-zinc-400 leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
                
                <CardFooter className="p-8 pt-0 z-10 flex flex-col items-start gap-4">
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-white/5 text-zinc-400 border border-white/5"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardFooter>

                {/* Arrow */}
                <div className="absolute bottom-8 right-8 text-zinc-600 group-hover:text-white transition-colors z-10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
