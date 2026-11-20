import "@testing-library/jest-dom/vitest";

declare global {
  // eslint-disable-next-line no-var
  var mockFetch: ReturnType<typeof vi.fn>;
}

// Create a mock fetch function
const mockFetch = vi.fn();

// Assign to globalThis so SDK can use it
Object.defineProperty(globalThis, "fetch", {
  value: mockFetch,
  writable: true,
  configurable: true,
});

// Expose to test files
globalThis.mockFetch = mockFetch;
