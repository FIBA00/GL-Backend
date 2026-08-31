import { describe, expect, it } from "vitest";
import { sanitizeMediaContext } from "./mediaContext";

describe("sanitizeMediaContext", () => {
  it("retains only permitted merchant media contexts", () => {
    expect(sanitizeMediaContext("shop-banner")).toBe("shop-banner");
    expect(sanitizeMediaContext("unexpected-script")).toBe("product");
  });
});
