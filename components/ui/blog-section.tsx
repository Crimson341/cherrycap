import { LazyImage } from './lazy-image';

// Available tags for blog posts
export const blogTags = [
	'seo',
	'growth',
	'analytics',
	'marketing',
	'performance',
	'ai',
	'tips',
	'case-study',
	'tutorial',
	'news',
] as const;

export type BlogTag = typeof blogTags[number];

export interface BlogPost {
	title: string;
	slug: string;
	description: string;
	image: string;
	createdAt: string;
	author: string;
	readTime: string;
	category?: 'tech' | 'business' | 'releases' | 'premium';
	tags?: BlogTag[];
}

export const blogPosts: BlogPost[] = [
	{
		title: 'Welcome to CherryCap',
		slug: '/blog/welcome',
		description:
			'We\'re thrilled to have you here! CherryCap is your all-in-one platform for website analytics, SEO insights, and growth tools. Let\'s build something amazing together.',
		image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&h=360&fit=crop',
		createdAt: '2025-12-18',
		author: 'CherryCap Team',
		readTime: '2 min read',
		category: 'releases',
		tags: ['news'],
	},
];

export function BlogSection() {
	return (
		<div className="mx-auto w-full max-w-5xl grow">
			<div
				aria-hidden
				className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
			>
				<div className="-rotate-45 bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 rounded-full" />
				<div className="-rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
				<div className="-rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 rounded-full" />
			</div>
			<div className="space-y-2 px-4 py-8">
				<h1 className="font-mono text-4xl font-bold tracking-wide">
					CherryCap Blog
				</h1>
				<p className="text-muted-foreground text-base max-w-2xl">
					Insights on tech, business opportunities, and the latest releases for our premium members. Stay ahead of the curve.
				</p>
			</div>
			<div className="absolute inset-x-0 h-px w-full border-b border-dashed" />
			<div className="grid p-4 md:grid-cols-2 lg:grid-cols-3 z-10">
				{blogPosts.map((blog) => (
					<a
						href={blog.slug}
						key={blog.title}
						className="group hover:bg-accent/60 active:bg-accent flex flex-col gap-2 rounded-lg p-2 duration-75"
					>
						<LazyImage
							src={blog.image}
							fallback="https://placehold.co/640x360?text=fallback-image"
							inView={true}
							alt={blog.title}
							ratio={16 / 9}
							className="transition-all duration-500 group-hover:scale-105"
						/>
						<div className="space-y-2 px-2 pb-2">
							<div className="flex items-center justify-between">
								<div className="text-muted-foreground flex items-center gap-2 text-[11px] sm:text-xs">
									<p>{blog.createdAt}</p>
									<div className="bg-muted-foreground size-1 rounded-full" />
									<p>{blog.readTime}</p>
								</div>
								{blog.category && (
									<span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${
										blog.category === 'tech' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
										blog.category === 'business' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
										blog.category === 'releases' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
										'bg-purple-500/10 text-purple-600 dark:text-purple-400'
									}`}>
										{blog.category === 'tech' ? 'Tech' :
										 blog.category === 'business' ? 'Business' :
										 blog.category === 'releases' ? 'New Release' :
										 'Premium'}
									</span>
								)}
							</div>
							<h2 className="line-clamp-2 text-lg leading-5 font-semibold tracking-tight">
								{blog.title}
							</h2>
							<p className="text-muted-foreground line-clamp-3 text-sm">
								{blog.description}
							</p>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}
