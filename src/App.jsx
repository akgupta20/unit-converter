import { useState } from "react";
import { getCategories, getCategory } from "@/lib/conversionEngine";
import { ConverterCard } from "@/components/ConverterCard";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Ruler, Weight, Thermometer } from "lucide-react";

// Map icon names → components
const ICON_MAP = {
  Ruler: Ruler,
  Weight: Weight,
  Thermometer: Thermometer,
};

function App() {
  const categories = getCategories();
  const [activeTab, setActiveTab] = useState(categories[0]);

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* ─── Animated background orbs ────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl animate-pulse [animation-duration:6s]" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl animate-pulse [animation-duration:8s] [animation-delay:2s]" />
        <div className="absolute -bottom-24 right-1/3 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl animate-pulse [animation-duration:7s] [animation-delay:4s]" />
      </div>

      {/* ─── Main content ───────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-svh px-4 py-10 md:py-20">
        {/* Header */}
        <header className="text-center mb-10 md:mb-14 space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-1 ring-1 ring-primary/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Precision Converter
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text">
            Unit Converter
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Convert between units of length, weight, and temperature with
            real-time bidirectional precision.
          </p>
        </header>

        {/* Tabs */}
        <div className="w-full max-w-2xl animate-in fade-in-0 slide-in-from-bottom-6 duration-700 [animation-delay:150ms] [animation-fill-mode:backwards]">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="h-12 p-1.5 bg-muted/60 backdrop-blur-sm ring-1 ring-foreground/5 shadow-sm">
                {categories.map((catKey) => {
                  const cat = getCategory(catKey);
                  const Icon = ICON_MAP[cat?.icon] || Ruler;
                  return (
                    <TabsTrigger
                      key={catKey}
                      value={catKey}
                      className="gap-2 px-5 h-full data-active:shadow-md transition-all duration-300 cursor-pointer data-active:scale-[1.02]"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline font-medium">{cat?.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {categories.map((catKey) => (
              <TabsContent
                key={catKey}
                value={catKey}
                className="animate-in fade-in-0 slide-in-from-bottom-3 duration-400 [animation-fill-mode:backwards]"
              >
                <ConverterCard categoryKey={catKey} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default App;
