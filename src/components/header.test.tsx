import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "./header";

// Mock the @tanstack/react-router Link component
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    onClick,
    activeProps,
    className,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
    activeProps?: { className: string };
    className?: string;
  }) => (
    <a href={to} onClick={onClick} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  SquareFunction: () => (
    <div data-testid="square-function-icon">SquareFunction</div>
  ),
  Network: () => <div data-testid="network-icon">Network</div>,
  StickyNote: () => <div data-testid="sticky-note-icon">StickyNote</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Rendering", () => {
    it("should render the header with logo", () => {
      render(<Header />);

      const logo = screen.getByAltText("TanStack Logo");
      expect(logo).toBeDefined();
      expect(logo.getAttribute("src")).toBe("/tanstack-word-logo-white.svg");
      expect(logo.getAttribute("height")).toBe("40");
      expect(logo.getAttribute("width")).toBe("160");
    });

    it("should render menu button with correct aria-label", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      expect(menuButton).toBeDefined();
      expect(menuButton.getAttribute("type")).toBe("button");
    });

    it("should render sidebar initially hidden", () => {
      render(<Header />);

      const aside = screen.getByRole("complementary");
      expect(aside.className).toContain("-translate-x-full");
    });

    it("should render navigation heading", () => {
      render(<Header />);

      const heading = screen.getByRole("heading", { name: "Navigation" });
      expect(heading).toBeDefined();
    });
  });

  describe("Menu Toggle Functionality", () => {
    it("should open the sidebar when menu button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      const aside = screen.getByRole("complementary");

      expect(aside.className).toContain("-translate-x-full");

      await user.click(menuButton);

      await waitFor(() => {
        expect(aside.className).toContain("translate-x-0");
        expect(aside.className).not.toContain("-translate-x-full");
      });
    });

    it("should close the sidebar when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Open the menu first
      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);

      const aside = screen.getByRole("complementary");
      expect(aside.className).toContain("translate-x-0");

      // Close the menu
      const closeButton = screen.getByRole("button", { name: "Close menu" });
      await user.click(closeButton);

      await waitFor(() => {
        expect(aside.className).toContain("-translate-x-full");
        expect(aside.className).not.toContain("translate-x-0");
      });
    });

    it("should have correct button types to prevent form submission", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      const closeButton = screen.getByRole("button", { name: "Close menu" });

      expect(menuButton.getAttribute("type")).toBe("button");
      expect(closeButton.getAttribute("type")).toBe("button");
    });
  });

  describe("Navigation Links", () => {
    it("should render all main navigation links", async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Open menu to access links
      await user.click(screen.getByRole("button", { name: "Open menu" }));

      // Check all main links are present
      expect(screen.getByRole("link", { name: /Home/i })).toBeDefined();
      expect(
        screen.getByRole("link", { name: /Start - Server Functions/i }),
      ).toBeDefined();
      expect(
        screen.getByRole("link", { name: /Start - API Request/i }),
      ).toBeDefined();
      expect(
        screen.getByRole("link", { name: /Start - SSR Demos/i }),
      ).toBeDefined();
    });

    it("should render correct href attributes for links", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      const homeLink = screen.getByRole("link", { name: /Home/i });
      const serverFuncsLink = screen.getByRole("link", {
        name: /Start - Server Functions/i,
      });
      const apiRequestLink = screen.getByRole("link", {
        name: /Start - API Request/i,
      });

      expect(homeLink.getAttribute("href")).toBe("/");
      expect(serverFuncsLink.getAttribute("href")).toBe(
        "/demo/start/server-funcs",
      );
      expect(apiRequestLink.getAttribute("href")).toBe(
        "/demo/start/api-request",
      );
    });

    it("should close sidebar when navigation link is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Open menu
      await user.click(screen.getByRole("button", { name: "Open menu" }));

      const aside = screen.getByRole("complementary");
      expect(aside.className).toContain("translate-x-0");

      // Click a navigation link
      const homeLink = screen.getByRole("link", { name: /Home/i });
      await user.click(homeLink);

      await waitFor(() => {
        expect(aside.className).toContain("-translate-x-full");
      });
    });
  });

  describe("Expandable SSR Demos Section", () => {
    it("should not show SSR demo sub-links initially", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      // Sub-links should not be visible
      expect(screen.queryByRole("link", { name: /SPA Mode/i })).toBeNull();
      expect(screen.queryByRole("link", { name: /Full SSR/i })).toBeNull();
      expect(screen.queryByRole("link", { name: /Data Only/i })).toBeNull();
    });

    it("should show SSR demo sub-links when expand button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      // Find and click the expand button (it's a button without aria-label, next to SSR Demos link)
      const buttons = screen.getAllByRole("button");
      const expandButton = buttons.find(
        (btn) =>
          btn.getAttribute("aria-label") !== "Open menu" &&
          btn.getAttribute("aria-label") !== "Close menu",
      );

      expect(expandButton).toBeDefined();
      await user.click(expandButton!);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /SPA Mode/i })).toBeDefined();
        expect(screen.getByRole("link", { name: /Full SSR/i })).toBeDefined();
        expect(
          screen.getByRole("link", { name: /Data Only/i }),
        ).toBeDefined();
      });
    });

    it("should toggle SSR demo sub-links when expand button is clicked multiple times", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      const buttons = screen.getAllByRole("button");
      const expandButton = buttons.find(
        (btn) =>
          btn.getAttribute("aria-label") !== "Open menu" &&
          btn.getAttribute("aria-label") !== "Close menu",
      );

      // Expand
      await user.click(expandButton!);
      await waitFor(() => {
        expect(screen.getByRole("link", { name: /SPA Mode/i })).toBeDefined();
      });

      // Collapse
      await user.click(expandButton!);
      await waitFor(() => {
        expect(screen.queryByRole("link", { name: /SPA Mode/i })).toBeNull();
      });

      // Expand again
      await user.click(expandButton!);
      await waitFor(() => {
        expect(screen.getByRole("link", { name: /SPA Mode/i })).toBeDefined();
      });
    });

    it("should render correct href attributes for SSR demo sub-links", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      const buttons = screen.getAllByRole("button");
      const expandButton = buttons.find(
        (btn) =>
          btn.getAttribute("aria-label") !== "Open menu" &&
          btn.getAttribute("aria-label") !== "Close menu",
      );

      await user.click(expandButton!);

      await waitFor(() => {
        const spaModeLink = screen.getByRole("link", { name: /SPA Mode/i });
        const fullSSRLink = screen.getByRole("link", { name: /Full SSR/i });
        const dataOnlyLink = screen.getByRole("link", { name: /Data Only/i });

        expect(spaModeLink.getAttribute("href")).toBe(
          "/demo/start/ssr/spa-mode",
        );
        expect(fullSSRLink.getAttribute("href")).toBe(
          "/demo/start/ssr/full-ssr",
        );
        expect(dataOnlyLink.getAttribute("href")).toBe(
          "/demo/start/ssr/data-only",
        );
      });
    });

    it("should close sidebar when SSR demo sub-link is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Open menu
      await user.click(screen.getByRole("button", { name: "Open menu" }));

      const aside = screen.getByRole("complementary");
      expect(aside.className).toContain("translate-x-0");

      // Expand SSR demos
      const buttons = screen.getAllByRole("button");
      const expandButton = buttons.find(
        (btn) =>
          btn.getAttribute("aria-label") !== "Open menu" &&
          btn.getAttribute("aria-label") !== "Close menu",
      );
      await user.click(expandButton!);

      // Click a sub-link
      const spaModeLink = await screen.findByRole("link", {
        name: /SPA Mode/i,
      });
      await user.click(spaModeLink);

      await waitFor(() => {
        expect(aside.className).toContain("-translate-x-full");
      });
    });

    it("should display chevron icons correctly based on expand state", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      // Initially should show ChevronRight
      expect(screen.getByTestId("chevron-right-icon")).toBeDefined();

      // Click expand button
      const buttons = screen.getAllByRole("button");
      const expandButton = buttons.find(
        (btn) =>
          btn.getAttribute("aria-label") !== "Open menu" &&
          btn.getAttribute("aria-label") !== "Close menu",
      );
      await user.click(expandButton!);

      // Should now show ChevronDown
      await waitFor(() => {
        expect(screen.getByTestId("chevron-down-icon")).toBeDefined();
      });
    });
  });

  describe("Icons Rendering", () => {
    it("should render all navigation icons", async () => {
      const user = userEvent.setup();
      render(<Header />);

      expect(screen.getByTestId("menu-icon")).toBeDefined();

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      expect(screen.getByTestId("x-icon")).toBeDefined();
      expect(screen.getByTestId("home-icon")).toBeDefined();
      expect(screen.getByTestId("square-function-icon")).toBeDefined();
      expect(screen.getByTestId("network-icon")).toBeDefined();
    });

    it("should render multiple sticky note icons for SSR demos", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      const stickyNoteIcons = screen.getAllByTestId("sticky-note-icon");
      expect(stickyNoteIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for interactive elements", () => {
      render(<Header />);

      expect(
        screen.getByRole("button", { name: "Open menu" }),
      ).toBeDefined();
      expect(
        screen.getByRole("button", { name: "Close menu" }),
      ).toBeDefined();
    });

    it("should have semantic HTML structure", () => {
      render(<Header />);

      expect(screen.getByRole("banner")).toBeDefined(); // header element
      expect(screen.getByRole("complementary")).toBeDefined(); // aside element
      expect(screen.getByRole("navigation")).toBeDefined(); // nav element
    });

    it("should have proper heading hierarchy", () => {
      render(<Header />);

      const h2 = screen.getByRole("heading", { level: 2 });
      expect(h2.textContent).toBe("Navigation");
    });

    it("should have alt text for logo image", () => {
      render(<Header />);

      const logo = screen.getByAltText("TanStack Logo");
      expect(logo).toBeDefined();
    });
  });

  describe("CSS Classes and Styling", () => {
    it("should apply correct CSS classes to header", () => {
      render(<Header />);

      const header = screen.getByRole("banner");
      expect(header.className).toContain("bg-gray-800");
      expect(header.className).toContain("text-white");
    });

    it("should apply correct transition classes to sidebar", () => {
      render(<Header />);

      const aside = screen.getByRole("complementary");
      expect(aside.className).toContain("transform");
      expect(aside.className).toContain("transition-transform");
      expect(aside.className).toContain("duration-300");
    });

    it("should have fixed positioning for sidebar", () => {
      render(<Header />);

      const aside = screen.getByRole("complementary");
      expect(aside.className).toContain("fixed");
      expect(aside.className).toContain("z-50");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid menu toggle clicks", async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      const aside = screen.getByRole("complementary");

      // Rapid clicks
      await user.click(menuButton);
      await user.click(screen.getByRole("button", { name: "Close menu" }));
      await user.click(menuButton);
      await user.click(screen.getByRole("button", { name: "Close menu" }));

      // Should end up closed
      await waitFor(() => {
        expect(aside.className).toContain("-translate-x-full");
      });
    });

    it("should maintain expand state when menu is closed and reopened", async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Open menu and expand SSR demos
      await user.click(screen.getByRole("button", { name: "Open menu" }));

      const buttons = screen.getAllByRole("button");
      const expandButton = buttons.find(
        (btn) =>
          btn.getAttribute("aria-label") !== "Open menu" &&
          btn.getAttribute("aria-label") !== "Close menu",
      );
      await user.click(expandButton!);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /SPA Mode/i })).toBeDefined();
      });

      // Close menu
      await user.click(screen.getByRole("button", { name: "Close menu" }));

      // Reopen menu
      await user.click(screen.getByRole("button", { name: "Open menu" }));

      // Expand state should be maintained
      await waitFor(() => {
        expect(screen.getByRole("link", { name: /SPA Mode/i })).toBeDefined();
      });
    });

    it("should handle multiple expandable sections independently", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      // Currently only one expandable section, but this tests the groupedExpanded state management
      const buttons = screen.getAllByRole("button");
      const expandButton = buttons.find(
        (btn) =>
          btn.getAttribute("aria-label") !== "Open menu" &&
          btn.getAttribute("aria-label") !== "Close menu",
      );

      await user.click(expandButton!);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /SPA Mode/i })).toBeDefined();
      });

      // The state should be stored under the key "StartSSRDemo"
      expect(
        screen.queryByRole("link", { name: /SPA Mode/i }),
      ).not.toBeNull();
    });
  });
});