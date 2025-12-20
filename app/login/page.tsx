"use client";

import { SignIn } from "@clerk/nextjs";
import { Header } from "@/components/ui/vercel-navbar";

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col min-h-screen bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(80% 55% at 50% 52%, rgba(252,166,154,0.25) 0%, rgba(214,76,82,0.26) 27%, rgba(61,36,47,0.18) 47%, rgba(39,38,67,0.25) 60%, rgba(8,8,12,0.92) 78%, rgba(0,0,0,1) 88%)",
              "radial-gradient(85% 60% at 14% 0%, rgba(255,193,171,0.35) 0%, rgba(233,109,99,0.28) 30%, rgba(48,24,28,0.0) 64%)",
              "radial-gradient(70% 50% at 86% 22%, rgba(88,112,255,0.20) 0%, rgba(16,18,28,0.0) 55%)",
            ].join(","),
            backgroundColor: "#000",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.8)_0%,_transparent_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <Header />
        
        <div className="flex flex-1 items-center justify-center p-4">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "backdrop-blur-xl",
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
              },
            }}
            routing="hash"
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
