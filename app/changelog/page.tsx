import { Changelog } from "@/components/ui/interactive-changelog-with-dialog";
import { Header } from "@/components/ui/vercel-navbar";
import { Footer } from "@/components/blocks/footer-section";

export default function ChangelogPage() {
  return (
    <div className="bg-black min-h-screen">
      <Header />
      <Changelog />
      <Footer />
    </div>
  );
}
