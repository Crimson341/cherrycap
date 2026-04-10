import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, Zap, ExternalLink, Quote, TrendingUp } from 'lucide-react';

// Callout boxes for important info
interface CalloutProps {
  type?: 'warning' | 'success' | 'info' | 'tip';
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const variants = {
    warning: {
      icon: AlertTriangle,
      className: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
      iconClass: 'text-yellow-500'
    },
    success: {
      icon: CheckCircle,
      className: 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300',
      iconClass: 'text-green-500'
    },
    info: {
      icon: Info,
      className: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300',
      iconClass: 'text-blue-500'
    },
    tip: {
      icon: Zap,
      className: 'border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300',
      iconClass: 'text-purple-500'
    }
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div className={`border rounded-lg p-4 my-6 ${variant.className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`size-5 mt-0.5 flex-shrink-0 ${variant.iconClass}`} />
        <div className="flex-1">
          {title && (
            <div className="font-semibold mb-2">{title}</div>
          )}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Before/After comparison cards
interface ComparisonProps {
  before: {
    title: string;
    items: string[];
  };
  after: {
    title: string;
    items: string[];
  };
}

export function Comparison({ before, after }: ComparisonProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 my-8">
      <Card className="p-6 border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <h3 className="font-semibold text-red-700 dark:text-red-400">{before.title}</h3>
        </div>
        <ul className="space-y-2">
          {before.items.map((item, idx) => (
            <li key={idx} className="text-sm text-red-600 dark:text-red-300 flex items-start gap-2">
              <span className="text-red-500 mt-1">×</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
      
      <Card className="p-6 border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <h3 className="font-semibold text-green-700 dark:text-green-400">{after.title}</h3>
        </div>
        <ul className="space-y-2">
          {after.items.map((item, idx) => (
            <li key={idx} className="text-sm text-green-600 dark:text-green-300 flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// Stats/metrics showcase
interface StatsProps {
  stats: Array<{
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
  }>;
}

export function Stats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {stats.map((stat, idx) => (
        <Card key={idx} className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-primary mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {stat.label}
          </div>
          {stat.change && (
            <div className={`text-xs flex items-center justify-center gap-1 ${
              stat.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="size-3" />
              {stat.change}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// Quote/testimonial block
interface QuoteProps {
  quote: string;
  author?: string;
  role?: string;
  company?: string;
}

export function BlockQuote({ quote, author, role, company }: QuoteProps) {
  return (
    <div className="my-8 p-6 border-l-4 border-primary bg-muted/30 rounded-r-lg">
      <div className="flex items-start gap-4">
        <Quote className="size-6 text-primary mt-1 flex-shrink-0" />
        <div>
          <p className="text-lg italic leading-relaxed mb-4 text-foreground">
            "{quote}"
          </p>
          {author && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">{author}</span>
              {role && <span>, {role}</span>}
              {company && <span> at {company}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Technology stack showcase
interface TechStackProps {
  categories: Array<{
    name: string;
    tools: Array<{
      name: string;
      description: string;
      reason?: string;
    }>;
  }>;
}

export function TechStack({ categories }: TechStackProps) {
  return (
    <div className="my-8 space-y-6">
      {categories.map((category, idx) => (
        <div key={idx}>
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            {category.name}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {category.tools.map((tool, toolIdx) => (
              <Card key={toolIdx} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{tool.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    Tool
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {tool.description}
                </p>
                {tool.reason && (
                  <p className="text-xs text-primary font-medium">
                    Why: {tool.reason}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Cost breakdown table
interface CostBreakdownProps {
  title: string;
  items: Array<{
    item: string;
    wordpress: string;
    nextjs: string;
  }>;
  total?: {
    wordpress: string;
    nextjs: string;
  };
}

export function CostBreakdown({ title, items, total }: CostBreakdownProps) {
  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4 text-foreground">{title}</h3>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Item</th>
                <th className="text-left p-4 font-semibold text-red-600">WordPress</th>
                <th className="text-left p-4 font-semibold text-green-600">Next.js</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="p-4 font-medium">{item.item}</td>
                  <td className="p-4 text-red-600">{item.wordpress}</td>
                  <td className="p-4 text-green-600">{item.nextjs}</td>
                </tr>
              ))}
              {total && (
                <tr className="border-t-2 border-border bg-muted/20">
                  <td className="p-4 font-bold">Total (Annual)</td>
                  <td className="p-4 font-bold text-red-600">{total.wordpress}</td>
                  <td className="p-4 font-bold text-green-600">{total.nextjs}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// External link with icon
interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExtLink({ href, children }: ExternalLinkProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      {children}
      <ExternalLink className="size-3" />
    </a>
  );
}

// Performance metrics showcase
interface PerformanceProps {
  metrics: Array<{
    label: string;
    before: string;
    after: string;
    unit?: string;
    improvement: string;
  }>;
}

export function PerformanceMetrics({ metrics }: PerformanceProps) {
  return (
    <div className="my-8">
      <div className="grid gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground mb-1">{metric.label}</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-red-600">
                    Before: {metric.before}{metric.unit}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-600">
                    After: {metric.after}{metric.unit}
                  </span>
                </div>
              </div>
              <Badge variant="default" className="text-xs">
                {metric.improvement}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 