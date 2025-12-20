'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Facebook, Instagram, Twitter, Mail, MapPin, Bot } from 'lucide-react';
import Link from 'next/link';
import { NewsletterForm } from '@/components/ui/newsletter-form';

interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

const footerLinks: FooterSection[] = [
	{
		label: 'Services',
		links: [
			{ title: 'Website Design', href: '#services' },
			{ title: 'Local SEO', href: '#services' },
			{ title: 'Online Stores', href: '#services' },
			{ title: 'Website Maintenance', href: '#services' },
		],
	},
	{
		label: 'Company',
		links: [
			{ title: 'About Us', href: '/about' },
			{ title: 'Our Work', href: '/work' },
			{ title: 'Pricing', href: '#pricing' },
			{ title: 'Contact', href: '#contact' },
		],
	},
	{
		label: 'Service Area',
		links: [
			{ title: 'Traverse City', href: '#' },
			{ title: 'Leelanau County', href: '#' },
			{ title: 'Benzie County', href: '#' },
			{ title: 'Grand Traverse', href: '#' },
		],
	},
	{
		label: 'Connect',
		links: [
			{ title: 'Facebook', href: '#', icon: Facebook },
			{ title: 'Instagram', href: '#', icon: Instagram },
			{ title: 'Twitter', href: '#', icon: Twitter },
		],
	},
];

// CherryCap Logo Component
function CherryCapLogo() {
	return (
		<div className="flex items-center gap-3">
			<div className="relative w-10 h-10">
				<div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neutral-300 via-neutral-400 to-neutral-500" />
				<div className="absolute inset-[2px] rounded-[10px] bg-background flex items-center justify-center">
					<span className="text-lg font-black bg-gradient-to-br from-neutral-200 to-neutral-400 bg-clip-text text-transparent">C</span>
				</div>
			</div>
			<span className="font-bold text-foreground text-lg">CherryCap</span>
		</div>
	);
}

export function Footer() {
	return (
		<footer className="md:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl border-t border-border bg-transparent px-6 py-12 lg:py-16">
			<div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

			<div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
			<AnimatedContainer className="space-y-4">
				<Link href="/">
					<CherryCapLogo />
				</Link>
				<p className="text-muted-foreground mt-8 text-sm md:mt-4 max-w-xs">
					Web design & development for Northern Michigan businesses. We build websites that actually bring you customers.
				</p>
				
				{/* Contact Info */}
				<div className="mt-6 space-y-3">
					<a href="mailto:hello@cherrycap.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
						<Mail className="w-4 h-4 text-neutral-400" />
						hello@cherrycap.com
					</a>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<MapPin className="w-4 h-4 text-neutral-400" />
						Beulah, Michigan
					</div>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Bot className="w-4 h-4 text-emerald-400" />
						AI Assistant available 24/7
					</div>
				</div>
				
				{/* Newsletter Signup */}
				<div className="mt-6 pt-6 border-t border-border">
					<h3 className="text-sm font-medium text-foreground mb-3">Stay in the loop</h3>
					<p className="text-muted-foreground text-xs mb-3">
						Get tips on web design, local business growth, and Northern Michigan tech news.
					</p>
					<NewsletterForm source="footer" variant="minimal" />
				</div>
				
				<p className="text-muted-foreground text-sm pt-4">
					© {new Date().getFullYear()} CherryCap. All rights reserved.
				</p>
			</AnimatedContainer>

				<div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
					{footerLinks.map((section, index) => (
						<AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
							<div className="mb-10 md:mb-0">
								<h3 className="text-xs">{section.label}</h3>
								<ul className="text-muted-foreground mt-4 space-y-2 text-sm">
									{section.links.map((link) => (
										<li key={link.title}>
											<a
												href={link.href}
												className="hover:text-foreground inline-flex items-center transition-all duration-300"
											>
												{link.icon && <link.icon className="me-1 size-4" />}
												{link.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						</AnimatedContainer>
					))}
				</div>
			</div>
		</footer>
	);
};

type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return children;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};