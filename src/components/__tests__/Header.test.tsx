import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../Header";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

import { usePathname } from "next/navigation";
const mockPathname = usePathname as jest.Mock;

function getMobileToggle() {
  return screen.getByRole("button", { name: /menu/i });
}

describe("Header", () => {

  it("renders a named navigation landmark", () => {
    render(<Header />);
    expect(
      screen.getByRole("navigation", { name: /main navigation/i })
    ).toBeInTheDocument();
  });

  it("renders all primary links", () => {
    render(<Header />);
    for (const label of ["Home", "Services", "Agents", "Usage", "Search"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the active primary route with aria-current", () => {
    mockPathname.mockReturnValue("/services");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("marks a deep child route on the parent primary link", () => {
    mockPathname.mockReturnValue("/services/abc/edit");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("shows More button that opens secondary menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    const moreBtn = screen.getByRole("button", { name: /more/i });
    expect(moreBtn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(moreBtn);
    expect(moreBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders all secondary links inside the menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    for (const label of ["API Keys", "Webhooks", "Events", "Stats", "Settings", "Docs", "Admin"]) {
      expect(screen.getByRole("menuitem", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the active secondary route with aria-current", () => {
    mockPathname.mockReturnValue("/api-keys");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    expect(screen.getByRole("menuitem", { name: "API Keys" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("closes the menu when a secondary link is clicked", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Webhooks" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the menu when focus leaves the secondary menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));

    fireEvent.blur(screen.getByRole("menu"), {
      relatedTarget: document.body,
    });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("mobile menu toggle has aria-expanded and aria-controls", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const toggle = getMobileToggle();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls");
  });

  it("mobile menu opens and closes on toggle", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const toggle = getMobileToggle();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: /mobile navigation/i })).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region", { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it("mobile menu closes on Escape and returns focus to toggle", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const toggle = getMobileToggle();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggle);
  });

  it("mobile menu auto-closes on route change", () => {
    mockPathname.mockReturnValue("/");
    const { rerender } = render(<Header />);

    const toggle = getMobileToggle();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    mockPathname.mockReturnValue("/services");
    rerender(<Header />);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region", { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it("preserves focus-visible ring classes on links", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.className).toContain("focus-visible:outline");
  });

  it("manages focus when opening and closing the mobile menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    const toggle = getMobileToggle();

    // Open mobile menu
    fireEvent.click(toggle);
    const homeMenuItem = screen.getByRole("menuitem", { name: "Home" });
    expect(document.activeElement).toBe(homeMenuItem);

    // Close mobile menu
    fireEvent.click(toggle);
    expect(document.activeElement).toBe(toggle);
  });

  it("handles secondary links in mobile menu", () => {
    mockPathname.mockReturnValue("/api-keys");
    render(<Header />);
    const toggle = getMobileToggle();

    // Open mobile menu
    fireEvent.click(toggle);

    const apiKeysLink = screen.getByRole("menuitem", { name: "API Keys" });
    expect(apiKeysLink).toHaveAttribute("aria-current", "page");
    expect(apiKeysLink.className).toContain("text-blue-600");

    // Click it to close
    fireEvent.click(apiKeysLink);
    expect(screen.queryByRole("region", { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it("closes the More menu when clicking the button again", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    const moreBtn = screen.getByRole("button", { name: /more/i });
    fireEvent.click(moreBtn);
    expect(moreBtn).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(moreBtn);
    expect(moreBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("does not close the More menu when focus moves inside it", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    const menu = screen.getByRole("menu");
    const item = screen.getByRole("menuitem", { name: "API Keys" });

    fireEvent.blur(menu, {
      relatedTarget: item,
    });

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes the More menu on route change", () => {
    mockPathname.mockReturnValue("/");
    const { rerender } = render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    mockPathname.mockReturnValue("/services");
    rerender(<Header />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("handles primary links in mobile menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(getMobileToggle());

    const servicesLink = screen.getByRole("menuitem", { name: "Services" });
    fireEvent.click(servicesLink);
    expect(screen.queryByRole("region", { name: /mobile navigation/i })).not.toBeInTheDocument();
  });
});

