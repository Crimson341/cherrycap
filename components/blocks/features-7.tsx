import { Cpu, Lock, Sparkles, Zap, Rocket, Shield, Globe, Code } from 'lucide-react'

export function Features() {
    return (
        <section className="relative overflow-hidden py-24 md:py-40 bg-[#030303]">
            {/* Background gradient */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-cyan-600/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative mx-auto max-w-6xl space-y-16 px-6">
                {/* Header */}
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-sm text-cyan-400 font-medium">Why Choose Us</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white lg:text-6xl">
                        Built for{" "}
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                            scaling teams
                        </span>
                    </h2>
                    <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
                        Empower your business with solutions that adapt to your needs. From startups to enterprises, we deliver results.
                    </p>
                </div>
                
                {/* Feature Image */}
                <div className="relative -mx-4 rounded-3xl p-3 md:-mx-12 lg:col-span-3">
                    <div className="[perspective:1000px]">
                        <div className="[transform:rotateX(5deg)] transition-transform hover:[transform:rotateX(0deg)] duration-700">
                            <div className="aspect-[16/9] relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10" />
                                <img 
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80" 
                                    className="w-full h-full object-cover opacity-80" 
                                    alt="Dashboard analytics" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Feature Grid */}
                <div className="relative mx-auto grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
                    {[
                        {
                            icon: Zap,
                            title: "Lightning Fast",
                            description: "Optimized performance with sub-second load times.",
                            gradient: "from-yellow-500 to-orange-500"
                        },
                        {
                            icon: Cpu,
                            title: "Powerful Stack",
                            description: "Built with cutting-edge technologies for scalability.",
                            gradient: "from-violet-500 to-purple-500"
                        },
                        {
                            icon: Shield,
                            title: "Enterprise Security",
                            description: "Bank-level encryption and security protocols.",
                            gradient: "from-emerald-500 to-teal-500"
                        },
                        {
                            icon: Sparkles,
                            title: "AI Enhanced",
                            description: "Smart features powered by machine learning.",
                            gradient: "from-pink-500 to-rose-500"
                        }
                    ].map((feature, i) => (
                        <div 
                            key={feature.title}
                            className="group relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
