import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * UnitSelect — Reusable unit dropdown for any conversion category.
 *
 * Props:
 *   - units: Array of { key, name, abbr }
 *   - value: Currently selected unit key
 *   - onValueChange: Callback when selection changes
 *   - label: Accessible label text
 *   - id: Unique ID for the select element
 */
export function UnitSelect({ units, value, onValueChange, label, id }) {
  // Find the currently selected unit to display its proper name
  const selectedUnit = units.find((u) => u.key === value);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className="w-full h-10 cursor-pointer bg-background/50 hover:bg-background/80 transition-all duration-200 hover:shadow-sm"
          aria-label={label || "Select unit"}
        >
          <SelectValue placeholder="Select unit">
            {selectedUnit ? (
              <span className="flex items-center gap-1.5">
                <span>{selectedUnit.name}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  ({selectedUnit.abbr})
                </span>
              </span>
            ) : (
              "Select unit"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {units.map((unit) => (
            <SelectItem key={unit.key} value={unit.key} className="cursor-pointer">
              <span className="flex items-center gap-2">
                <span>{unit.name}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  ({unit.abbr})
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
