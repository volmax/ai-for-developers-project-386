import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("returns empty string with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const active = true;
    expect(cn("base", active && "active")).toBe("base active");
  });

  it("overrides conflicting classes", () => {
    expect(cn("p-3", "p-6")).toBe("p-6");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });
});
