import { render, screen } from "@testing-library/react";
import { KeyValueGrid } from "../KeyValueGrid";

describe("KeyValueGrid", () => {
  it("renders a dt/dd pair for each row", () => {
    render(
      <KeyValueGrid
        rows={[
          { label: "Status", value: "Active" },
          { label: "Plan", value: "Pro" },
        ]}
      />
    );

    // semantic structure
    expect(screen.getByRole("term", { name: /status/i })).toBeInTheDocument();
    expect(
      screen.getByRole("definition", { name: /active/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("term", { name: /plan/i })).toBeInTheDocument();
    expect(screen.getByRole("definition", { name: /pro/i })).toBeInTheDocument();
  });

  it("renders correct label/value text for each row", () => {
    render(
      <KeyValueGrid
        rows={[
          { label: "Name", value: "AgentPay" },
          { label: "ID", value: "ap_123" },
        ]}
      />
    );

    const terms = screen.getAllByRole("term");
    const definitions = screen.getAllByRole("definition");

    expect(terms.map((n) => n.textContent)).toEqual(["Name", "ID"]);
    expect(definitions.map((n) => n.textContent)).toEqual(["AgentPay", "ap_123"]);
  });

  it("renders nothing meaningful for an empty rows array", () => {
    render(<KeyValueGrid rows={[]} />);

    expect(screen.queryByRole("term")).not.toBeInTheDocument();
    expect(screen.queryByRole("definition")).not.toBeInTheDocument();
  });

  it("handles non-string labels and values correctly for aria-labels", () => {
    const rows = [
      { label: <span data-testid="label">Complex Label</span>, value: <div data-testid="value">Complex Value</div> },
    ];
    render(<KeyValueGrid rows={rows} />);
    const dt = screen.getByTestId("label").parentElement!;
    const dd = screen.getByTestId("value").parentElement!;

    expect(dt).not.toHaveAttribute("aria-label");
    expect(dd).not.toHaveAttribute("aria-label");
  });

  it("sets aria-label for string and number values", () => {
    const rows = [
      { label: "Label 1", value: 42 },
    ];
    render(<KeyValueGrid rows={rows} />);
    const dt = screen.getByRole("term", { name: "Label 1" });
    const dd = screen.getByRole("definition", { name: "42" });

    expect(dt).toHaveAttribute("aria-label", "Label 1");
    expect(dd).toHaveAttribute("aria-label", "42");
  });
});

