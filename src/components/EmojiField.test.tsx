import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import EmojiField from "./EmojiField";

vi.mock("./EmojiPicker", () => ({
  default: (props: { onSelect: (native: string) => void }) => (
    <button data-testid="emoji-picker" onClick={() => props.onSelect("🎉")}>
      Pick Emoji
    </button>
  ),
}));

const renderField = (props?: {
  emoji?: string;
  showSelector?: boolean;
  onOpenSelector?: () => void;
  onSelect?: (native: string) => void;
}) => {
  const onOpenSelector = props?.onOpenSelector ?? vi.fn();
  const onSelect = props?.onSelect ?? vi.fn();
  render(
    <ThemeProvider>
      <EmojiField
        emoji={props?.emoji}
        showSelector={props?.showSelector ?? false}
        onOpenSelector={onOpenSelector}
        onSelect={onSelect}
      />
    </ThemeProvider>,
  );
  return { onOpenSelector, onSelect };
};

describe("EmojiField", () => {
  it("prompts for an emoji when none is chosen", () => {
    renderField({ showSelector: true });
    expect(screen.getByText("Select an emoji")).toBeInTheDocument();
  });

  it("passes the picked emoji to onSelect", async () => {
    const { onSelect } = renderField({ showSelector: true });
    fireEvent.click(await screen.findByTestId("emoji-picker"));
    expect(onSelect).toHaveBeenCalledWith("🎉");
  });

  it("shows the chosen emoji and a Change Emoji button", () => {
    const { onOpenSelector } = renderField({ emoji: "🎄" });
    expect(screen.getByText("You have chosen 🎄")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Change Emoji" }));
    expect(onOpenSelector).toHaveBeenCalled();
  });
});
