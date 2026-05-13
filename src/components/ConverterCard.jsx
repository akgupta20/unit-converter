import { useConverter } from "@/hooks/useConverter";
import { getCategory } from "@/lib/conversionEngine";
import { UnitSelect } from "@/components/UnitSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeftRight,
  Copy,
  Check,
  AlertTriangle,
  Ruler,
  Weight,
  Thermometer,
} from "lucide-react";
import { useState } from "react";

// Map category icon names to lucide-react components
const ICON_MAP = {
  Ruler: Ruler,
  Weight: Weight,
  Thermometer: Thermometer,
};

/**
 * ConverterCard — Main converter UI for a single category.
 *
 * Props:
 *   - categoryKey: "length" | "weight" | "temperature"
 */
export function ConverterCard({ categoryKey }) {
  const category = getCategory(categoryKey);
  const {
    fromValue,
    toValue,
    fromUnit,
    toUnit,
    error,
    copiedField,
    units,
    setFromValue,
    setToValue,
    setFromUnit,
    setToUnit,
    swapUnits,
    copyToClipboard,
  } = useConverter(categoryKey);

  const [isSwapping, setIsSwapping] = useState(false);

  const IconComponent = ICON_MAP[category?.icon] || Ruler;
  const hasError = !!error;

  const handleSwap = () => {
    setIsSwapping(true);
    swapUnits();
    setTimeout(() => setIsSwapping(false), 400);
  };

  return (
    <Card className="w-full border-0 ring-1 ring-foreground/[0.06] bg-card/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 transition-transform duration-300 hover:scale-105">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{category?.name} Converter</CardTitle>
            <CardDescription className="text-xs">
              Convert between {units.length} {category?.name.toLowerCase()} units
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ─── Error Alert ──────────────────────────────────────────── */}
        {hasError && (
          <Alert
            variant="destructive"
            className="animate-in fade-in-0 slide-in-from-top-2 zoom-in-95 duration-300"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* ─── Converter Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* From Section */}
          <div
            className={`space-y-3 transition-all duration-300 ${
              isSwapping ? "md:-translate-x-2 opacity-80" : ""
            }`}
          >
            <UnitSelect
              units={units}
              value={fromUnit}
              onValueChange={setFromUnit}
              label="From"
              id={`${categoryKey}-from-unit`}
            />
            <div className="relative group">
              <Label
                htmlFor={`${categoryKey}-from-value`}
                className="sr-only"
              >
                From value
              </Label>
              <Input
                id={`${categoryKey}-from-value`}
                type="number"
                inputMode="decimal"
                placeholder="Enter value"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                className={`h-12 text-lg font-mono pr-10 transition-all duration-300 ${
                  hasError
                    ? "border-destructive ring-2 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/30"
                    : "hover:border-foreground/20 focus-visible:ring-primary/30"
                }`}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${categoryKey}-error` : undefined}
              />
              {fromValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-110"
                  onClick={() => copyToClipboard("from")}
                  aria-label="Copy from value"
                >
                  {copiedField === "from" ? (
                    <Check className="h-3.5 w-3.5 text-green-500 animate-in zoom-in-0 spin-in-180 duration-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
            {/* Unit abbreviation hint */}
            {fromValue && !hasError && (
              <p className="text-xs text-muted-foreground font-mono pl-1 animate-in fade-in-0 slide-in-from-left-1 duration-300">
                {fromValue} {units.find((u) => u.key === fromUnit)?.abbr}
              </p>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center md:pb-6">
            <Button
              variant="outline"
              size="sm"
              className={`rounded-full h-11 w-11 p-0 border-dashed hover:border-solid hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 group hover:scale-110 active:scale-95 ${
                isSwapping ? "rotate-180 scale-110 border-primary/40 bg-primary/5" : ""
              }`}
              onClick={handleSwap}
              aria-label="Swap units"
              style={{ transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s, border-color 0.2s" }}
            >
              <ArrowLeftRight
                className={`h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200 md:rotate-0 rotate-90`}
              />
            </Button>
          </div>

          {/* To Section */}
          <div
            className={`space-y-3 transition-all duration-300 ${
              isSwapping ? "md:translate-x-2 opacity-80" : ""
            }`}
          >
            <UnitSelect
              units={units}
              value={toUnit}
              onValueChange={setToUnit}
              label="To"
              id={`${categoryKey}-to-unit`}
            />
            <div className="relative group">
              <Label
                htmlFor={`${categoryKey}-to-value`}
                className="sr-only"
              >
                To value
              </Label>
              <Input
                id={`${categoryKey}-to-value`}
                type="number"
                inputMode="decimal"
                placeholder="Result"
                value={toValue}
                onChange={(e) => setToValue(e.target.value)}
                className={`h-12 text-lg font-mono pr-10 transition-all duration-300 ${
                  hasError
                    ? "border-destructive ring-2 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/30"
                    : "hover:border-foreground/20 focus-visible:ring-primary/30"
                }`}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${categoryKey}-error` : undefined}
              />
              {toValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-110"
                  onClick={() => copyToClipboard("to")}
                  aria-label="Copy result value"
                >
                  {copiedField === "to" ? (
                    <Check className="h-3.5 w-3.5 text-green-500 animate-in zoom-in-0 spin-in-180 duration-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
            {/* Unit abbreviation hint */}
            {toValue && !hasError && (
              <p className="text-xs text-muted-foreground font-mono pl-1 animate-in fade-in-0 slide-in-from-right-1 duration-300">
                {toValue} {units.find((u) => u.key === toUnit)?.abbr}
              </p>
            )}
          </div>
        </div>

        {/* ─── Hidden error ID for aria-describedby ─────────────────── */}
        {hasError && (
          <span id={`${categoryKey}-error`} className="sr-only">
            {error}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
