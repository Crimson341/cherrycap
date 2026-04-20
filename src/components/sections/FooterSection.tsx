import { cn } from '@/lib/utils'
import React from 'react'

function FooterSection() {
  return (
    <footer className='relative h-fit border-x full-line-bottom p-4'>
         <div
                className={cn(
                  "absolute top-0 left-0 flex h-full w-8 border-r border-edge",
                  "before:absolute before:inset-0 before:-z-1",
                  "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]",
                  "before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56"
                )}
              />
              <div
                className={cn(
                  "absolute top-0 right-0 flex h-full w-8 border-l border-edge",
                  "before:absolute before:inset-0 before:-z-1",
                  "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]",
                  "before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56"
                )}
              />
        <p className="text-center font-mono text-sm text-balance text-muted-foreground">Built by <a className="font-semibold underline" href="https://cherrycapitalweb.com/" target="_blank" rel="noopener">Cherry Capital</a>.</p>
    </footer>
  )
}

export default FooterSection
