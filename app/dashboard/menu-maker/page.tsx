"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Bell } from "lucide-react";
import { MenuImageMaker } from "@/components/ui/menu-image-maker";

export default function MenuMakerPage() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Menu Maker</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="h-5 w-5 text-neutral-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          <Button size="sm" className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <MenuImageMaker />
      </div>
    </div>
  );
}
