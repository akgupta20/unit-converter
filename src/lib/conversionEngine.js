/**
 * Conversion Engine — Pure logic module with zero UI dependencies.
 *
 * Design:
 *   - Linear categories (length, weight) use a `toBase` multiplier pattern.
 *   - Temperature uses dedicated formula pairs (cannot be expressed as a ratio).
 *   - Adding a new category requires only a new entry in CATEGORIES.
 */

// ─── Category Configurations ────────────────────────────────────────────────

const CATEGORIES = {
  length: {
    name: "Length",
    icon: "Ruler",
    allowNegative: false,
    errorMessage: "Length cannot be negative",
    type: "linear",
    baseUnit: "meter",
    units: {
      millimeter:  { name: "Millimeter",  abbr: "mm", toBase: 0.001 },
      centimeter:  { name: "Centimeter",  abbr: "cm", toBase: 0.01 },
      meter:       { name: "Meter",       abbr: "m",  toBase: 1 },
      kilometer:   { name: "Kilometer",   abbr: "km", toBase: 1000 },
      inch:        { name: "Inch",        abbr: "in", toBase: 0.0254 },
      foot:        { name: "Foot",        abbr: "ft", toBase: 0.3048 },
      mile:        { name: "Mile",        abbr: "mi", toBase: 1609.344 },
    },
  },

  weight: {
    name: "Weight",
    icon: "Weight",
    allowNegative: false,
    errorMessage: "Weight cannot be negative",
    type: "linear",
    baseUnit: "kilogram",
    units: {
      gram:     { name: "Gram",     abbr: "g",  toBase: 0.001 },
      kilogram: { name: "Kilogram", abbr: "kg", toBase: 1 },
      ounce:    { name: "Ounce",    abbr: "oz", toBase: 0.0283495 },
      pound:    { name: "Pound",    abbr: "lb", toBase: 0.453592 },
    },
  },

  temperature: {
    name: "Temperature",
    icon: "Thermometer",
    allowNegative: true,
    type: "formula",
    units: {
      celsius:    { name: "Celsius",    abbr: "°C" },
      fahrenheit: { name: "Fahrenheit", abbr: "°F" },
      kelvin:     { name: "Kelvin",     abbr: "K" },
    },
    // Absolute zero thresholds per unit
    absoluteZero: {
      celsius: -273.15,
      fahrenheit: -459.67,
      kelvin: 0,
    },
  },
};

// ─── Temperature Conversion Formulas ────────────────────────────────────────

function convertTemperature(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;

  // Convert to Celsius as intermediate
  let celsius;
  switch (fromUnit) {
    case "celsius":
      celsius = value;
      break;
    case "fahrenheit":
      celsius = (value - 32) * (5 / 9);
      break;
    case "kelvin":
      celsius = value - 273.15;
      break;
    default:
      return NaN;
  }

  // Convert from Celsius to target
  switch (toUnit) {
    case "celsius":
      return celsius;
    case "fahrenheit":
      return celsius * (9 / 5) + 32;
    case "kelvin":
      return celsius + 273.15;
    default:
      return NaN;
  }
}

// ─── Linear Conversion ──────────────────────────────────────────────────────

function convertLinear(value, fromUnit, toUnit, category) {
  if (fromUnit === toUnit) return value;
  const from = category.units[fromUnit];
  const to = category.units[toUnit];
  if (!from || !to) return NaN;
  return (value * from.toBase) / to.toBase;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns an array of category keys.
 */
export function getCategories() {
  return Object.keys(CATEGORIES);
}

/**
 * Returns the full category config object.
 */
export function getCategory(categoryKey) {
  return CATEGORIES[categoryKey] || null;
}

/**
 * Returns an array of { key, name, abbr } for a given category.
 */
export function getUnits(categoryKey) {
  const category = CATEGORIES[categoryKey];
  if (!category) return [];
  return Object.entries(category.units).map(([key, unit]) => ({
    key,
    name: unit.name,
    abbr: unit.abbr,
  }));
}

/**
 * Validates the input value for a given category and unit.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validate(categoryKey, value, unitKey) {
  const category = CATEGORIES[categoryKey];
  if (!category) return { valid: false, error: "Unknown category" };

  if (value === "" || value === null || value === undefined) {
    return { valid: true }; // Empty is not an error, just no conversion
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: "Please enter a valid number" };
  }

  // Negative check for non-temperature categories
  if (!category.allowNegative && num < 0) {
    return { valid: false, error: category.errorMessage };
  }

  // Absolute zero check for temperature
  if (category.type === "formula" && category.absoluteZero) {
    const threshold = category.absoluteZero[unitKey];
    if (threshold !== undefined && num < threshold) {
      return {
        valid: false,
        error: `Temperature cannot be below absolute zero (${category.absoluteZero.celsius}°C / ${category.absoluteZero.fahrenheit}°F / ${category.absoluteZero.kelvin}K)`,
      };
    }
  }

  return { valid: true };
}

/**
 * Performs the conversion.
 * Returns { result: number|null, error: string|null }.
 */
export function convert(categoryKey, value, fromUnit, toUnit) {
  const category = CATEGORIES[categoryKey];
  if (!category) return { result: null, error: "Unknown category" };

  // Handle empty / NaN
  if (value === "" || value === null || value === undefined) {
    return { result: null, error: null };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { result: null, error: null };
  }

  // Validate before converting
  const validation = validate(categoryKey, num, fromUnit);
  if (!validation.valid) {
    return { result: null, error: validation.error };
  }

  // Perform conversion
  let result;
  if (category.type === "formula") {
    result = convertTemperature(num, fromUnit, toUnit);
  } else {
    result = convertLinear(num, fromUnit, toUnit, category);
  }

  if (isNaN(result)) {
    return { result: null, error: "Conversion error" };
  }

  return { result: formatResult(result), error: null };
}

/**
 * Formats a number for display:
 *   - Integers stay as integers (no trailing .0000)
 *   - Floats rounded to 4 decimal places
 *   - Very large/small numbers use scientific notation
 */
export function formatResult(num) {
  if (isNaN(num) || num === null || num === undefined) return "";

  // Scientific notation for extreme values
  if (Math.abs(num) >= 1e15) {
    return num.toExponential(4);
  }
  if (Math.abs(num) !== 0 && Math.abs(num) < 1e-10) {
    return num.toExponential(4);
  }

  // If it's an integer, return as-is
  if (Number.isInteger(num)) {
    return num;
  }

  // Round to 4 decimal places, strip trailing zeros
  return parseFloat(num.toFixed(4));
}
