"use client"

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PortfolioInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="Open portfolio info"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Portfolio Info
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 font-mono">
          {/* Visitor Stats */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 " />
              <span className="text-sm font-medium">Total Visitors</span>
            </div>
            <span className="text-lg font-bold">12,847</span>
          </div>

          <Separator />

          {/* Links Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Quick Links</h4>

            {/* Business Link */}
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://cherrycapitalweb.com/" target="_blank" rel="noopener noreferrer"> {/* TODO: Update with actual domain */}
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Cherry Capital
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
          </div>

          {/* Tech Stack Info */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center">Built with Next.js • Tailwind CSS • TypeScript</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
