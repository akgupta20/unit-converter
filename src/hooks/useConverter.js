import { useState, useCallback, useEffect } from "react";
import {
  convert,
  validate,
  getUnits,
  formatResult,
} from "@/lib/conversionEngine";

/**
 * useConverter — React hook bridging the conversion engine with component state.
 *
 * Provides:
 *   - Bidirectional sync: updating either field computes the other.
 *   - Validation with error messages.
 *   - Unit swap functionality.
 *   - Copy-to-clipboard with status feedback.
 *   - Graceful empty/NaN handling.
 */
export function useConverter(categoryKey) {
  const units = getUnits(categoryKey);
  const defaultFrom = units[0]?.key || "";
  const defaultTo = units[1]?.key || "";

  const [fromValue, setFromValueState] = useState("");
  const [toValue, setToValueState] = useState("");
  const [fromUnit, setFromUnitState] = useState(defaultFrom);
  const [toUnit, setToUnitState] = useState(defaultTo);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null); // "from" | "to" | null
  const [lastEdited, setLastEdited] = useState("from"); // Tracks which field was last edited

  // Reset everything when category changes
  useEffect(() => {
    const newUnits = getUnits(categoryKey);
    setFromValueState("");
    setToValueState("");
    setFromUnitState(newUnits[0]?.key || "");
    setToUnitState(newUnits[1]?.key || "");
    setError(null);
    setCopiedField(null);
    setLastEdited("from");
  }, [categoryKey]);

  // ─── Set From Value (user types in the "From" field) ────────────────────

  const setFromValue = useCallback(
    (val) => {
      setFromValueState(val);
      setLastEdited("from");
      setCopiedField(null);

      if (val === "" || val === null || val === undefined) {
        setToValueState("");
        setError(null);
        return;
      }

      const num = parseFloat(val);
      if (isNaN(num)) {
        setToValueState("");
        setError(null);
        return;
      }

      // Validate the from value
      const validation = validate(categoryKey, num, fromUnit);
      if (!validation.valid) {
        setError(validation.error);
        setToValueState("");
        return;
      }

      // Convert
      const { result, error: convError } = convert(
        categoryKey,
        num,
        fromUnit,
        toUnit
      );
      setError(convError);
      setToValueState(result !== null && result !== undefined ? String(result) : "");
    },
    [categoryKey, fromUnit, toUnit]
  );

  // ─── Set To Value (user types in the "To" field — bidirectional) ────────

  const setToValue = useCallback(
    (val) => {
      setToValueState(val);
      setLastEdited("to");
      setCopiedField(null);

      if (val === "" || val === null || val === undefined) {
        setFromValueState("");
        setError(null);
        return;
      }

      const num = parseFloat(val);
      if (isNaN(num)) {
        setFromValueState("");
        setError(null);
        return;
      }

      // Validate the to value (reverse direction)
      const validation = validate(categoryKey, num, toUnit);
      if (!validation.valid) {
        setError(validation.error);
        setFromValueState("");
        return;
      }

      // Reverse convert: toUnit → fromUnit
      const { result, error: convError } = convert(
        categoryKey,
        num,
        toUnit,
        fromUnit
      );
      setError(convError);
      setFromValueState(
        result !== null && result !== undefined ? String(result) : ""
      );
    },
    [categoryKey, fromUnit, toUnit]
  );

  // ─── Set From Unit ─────────────────────────────────────────────────────

  const setFromUnit = useCallback(
    (unit) => {
      setFromUnitState(unit);
      setCopiedField(null);

      // Recalculate based on which field was last edited
      if (lastEdited === "from" && fromValue !== "") {
        const num = parseFloat(fromValue);
        if (!isNaN(num)) {
          const validation = validate(categoryKey, num, unit);
          if (!validation.valid) {
            setError(validation.error);
            setToValueState("");
            return;
          }
          const { result, error: convError } = convert(
            categoryKey,
            num,
            unit,
            toUnit
          );
          setError(convError);
          setToValueState(
            result !== null && result !== undefined ? String(result) : ""
          );
        }
      } else if (lastEdited === "to" && toValue !== "") {
        const num = parseFloat(toValue);
        if (!isNaN(num)) {
          const validation = validate(categoryKey, num, toUnit);
          if (!validation.valid) {
            setError(validation.error);
            setFromValueState("");
            return;
          }
          const { result, error: convError } = convert(
            categoryKey,
            num,
            toUnit,
            unit
          );
          setError(convError);
          setFromValueState(
            result !== null && result !== undefined ? String(result) : ""
          );
        }
      }
    },
    [categoryKey, fromValue, toValue, toUnit, lastEdited]
  );

  // ─── Set To Unit ───────────────────────────────────────────────────────

  const setToUnit = useCallback(
    (unit) => {
      setToUnitState(unit);
      setCopiedField(null);

      // Recalculate based on which field was last edited
      if (lastEdited === "from" && fromValue !== "") {
        const num = parseFloat(fromValue);
        if (!isNaN(num)) {
          const validation = validate(categoryKey, num, fromUnit);
          if (!validation.valid) {
            setError(validation.error);
            setToValueState("");
            return;
          }
          const { result, error: convError } = convert(
            categoryKey,
            num,
            fromUnit,
            unit
          );
          setError(convError);
          setToValueState(
            result !== null && result !== undefined ? String(result) : ""
          );
        }
      } else if (lastEdited === "to" && toValue !== "") {
        const num = parseFloat(toValue);
        if (!isNaN(num)) {
          const validation = validate(categoryKey, num, unit);
          if (!validation.valid) {
            setError(validation.error);
            setFromValueState("");
            return;
          }
          const { result, error: convError } = convert(
            categoryKey,
            num,
            unit,
            fromUnit
          );
          setError(convError);
          setFromValueState(
            result !== null && result !== undefined ? String(result) : ""
          );
        }
      }
    },
    [categoryKey, fromValue, toValue, fromUnit, lastEdited]
  );

  // ─── Swap Units ────────────────────────────────────────────────────────

  const swapUnits = useCallback(() => {
    setFromUnitState((prev) => {
      setToUnitState(fromUnit);
      return toUnit;
    });
    // Swap values too
    setFromValueState(toValue);
    setToValueState(fromValue);
    setLastEdited((prev) => (prev === "from" ? "to" : "from"));
    setCopiedField(null);
  }, [fromUnit, toUnit, fromValue, toValue]);

  // ─── Copy to Clipboard ────────────────────────────────────────────────

  const copyToClipboard = useCallback(
    async (which) => {
      const value = which === "from" ? fromValue : toValue;
      if (!value) return;
      try {
        await navigator.clipboard.writeText(String(value));
        setCopiedField(which);
        setTimeout(() => setCopiedField(null), 2000);
      } catch {
        // Fallback for environments without clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = String(value);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedField(which);
        setTimeout(() => setCopiedField(null), 2000);
      }
    },
    [fromValue, toValue]
  );

  return {
    // State
    fromValue,
    toValue,
    fromUnit,
    toUnit,
    error,
    copiedField,
    units,

    // Actions
    setFromValue,
    setToValue,
    setFromUnit,
    setToUnit,
    swapUnits,
    copyToClipboard,
  };
}
