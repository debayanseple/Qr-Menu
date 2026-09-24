import { describe, expect, it } from "vitest";
import { formatPaise } from "./index.js";

describe("formatPaise", () => {
  it("formats integer paise without floats", () => {
    expect(formatPaise(19900)).toBe("₹199.00");
    expect(formatPaise(0)).toBe("₹0.00");
  });
});
