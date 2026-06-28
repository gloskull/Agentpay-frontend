import { render, screen, act } from "@testing-library/react";
import { TimeAgo } from "../TimeAgo";

describe("TimeAgo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders 'just now' for recent timestamps", () => {
    const now = Date.now();
    render(<TimeAgo ts={now} />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("renders 'just now' for future timestamps", () => {
    const future = Date.now() + 10000;
    render(<TimeAgo ts={future} />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("formats seconds ago", () => {
    const ts = Date.now() - 5000;
    render(<TimeAgo ts={ts} />);
    expect(screen.getByText("5s ago")).toBeInTheDocument();
  });

  it("formats minutes ago", () => {
    const ts = Date.now() - 120000;
    render(<TimeAgo ts={ts} />);
    expect(screen.getByText("2m ago")).toBeInTheDocument();
  });

  it("formats hours ago", () => {
    const ts = Date.now() - 3600000 * 3;
    render(<TimeAgo ts={ts} />);
    expect(screen.getByText("3h ago")).toBeInTheDocument();
  });

  it("formats days ago", () => {
    const ts = Date.now() - 86400000 * 2;
    render(<TimeAgo ts={ts} />);
    expect(screen.getByText("2d ago")).toBeInTheDocument();
  });

  it("updates text over time", () => {
    const ts = Date.now();
    render(<TimeAgo ts={ts} />);
    expect(screen.getByText("just now")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByText("30s ago")).toBeInTheDocument();
  });

  it("sets title and datetime attributes to ISO string", () => {
    const ts = 1700000000000;
    const iso = new Date(ts).toISOString();
    render(<TimeAgo ts={ts} />);
    const timeEl = screen.getByText(/ago|just now/);
    expect(timeEl).toHaveAttribute("datetime", iso);
    expect(timeEl).toHaveAttribute("title", iso);
  });
});
