import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "@/services/api";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("ApiClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ status: "ok" }),
    });

    const result = await api.get("/health");
    expect(result).toEqual({ status: "ok" });
    expect(mockFetch).toHaveBeenCalledWith("/api/health", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(api.get("/health")).rejects.toThrow(
      "API error 500: Internal Server Error"
    );
  });

  it("sends JSON body on POST", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ created: true }),
    });

    const result = await api.post("/items", { name: "test" });
    expect(result).toEqual({ created: true });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/items",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "test" }),
      })
    );
  });
});
