import { renderHook, waitFor } from "@testing-library/react";
import { useApi } from "../useApi";
import { apiGet } from "../apiClient";

jest.mock("../apiClient", () => ({
  apiGet: jest.fn(),
}));

const mockApiGet = apiGet as jest.Mock;

describe("useApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("skips fetching when path is null", () => {
    const { result } = renderHook(() => useApi(null));
    expect(result.current).toEqual({ status: "loading" });
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it("fetches data and updates state to ok", async () => {
    mockApiGet.mockResolvedValue({ foo: "bar" });
    const { result } = renderHook(() => useApi("/test"));

    expect(result.current).toEqual({ status: "loading" });

    await waitFor(() => {
      expect(result.current).toEqual({ status: "ok", data: { foo: "bar" } });
    });
  });

  it("handles errors and updates state to error", async () => {
    mockApiGet.mockRejectedValue(new Error("Network fail"));
    const { result } = renderHook(() => useApi("/test"));

    await waitFor(() => {
      expect(result.current).toEqual({ status: "error", error: "Network fail" });
    });
  });

  it("handles generic errors without a message", async () => {
    mockApiGet.mockRejectedValue({});
    const { result } = renderHook(() => useApi("/test"));

    await waitFor(() => {
      expect(result.current).toEqual({ status: "error", error: "failed to load" });
    });
  });

  it("ignores response if unmounted (cancelled)", async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockApiGet.mockReturnValue(promise);

    const { unmount } = renderHook(() => useApi("/test"));
    unmount();

    resolvePromise!({ foo: "bar" });
  });
});
