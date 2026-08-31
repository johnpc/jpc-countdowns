import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import CreateCountdown from "./CreateCountdown";
import { CountdownEntity } from "../entities";

vi.mock("./EmojiPicker", () => ({
  default: (props: { onSelect: (native: string) => void }) => (
    <button data-testid="emoji-picker" onClick={() => props.onSelect("🎉")}>
      Pick Emoji
    </button>
  ),
}));

const existingCountdown: CountdownEntity = {
  id: "1",
  emoji: "🎄",
  title: "Christmas",
  date: "2026-12-25T23:59:59.999Z",
  hexColor: "#FF0000",
};

function renderForm(props?: {
  existingCountdown?: CountdownEntity;
  save?: (draft: Omit<CountdownEntity, "id">) => void;
  update?: (countdown: CountdownEntity) => void;
  onDone?: () => void;
}) {
  const save = props?.save ?? vi.fn();
  const update = props?.update ?? vi.fn();
  const onDone = props?.onDone ?? vi.fn();
  render(
    <ThemeProvider>
      <CreateCountdown
        existingCountdown={props?.existingCountdown}
        save={save}
        update={update}
        onDone={onDone}
      />
    </ThemeProvider>,
  );
  return { save, update, onDone };
}

describe("CreateCountdown", () => {
  it("renders title, color, date, and emoji fields", () => {
    renderForm();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Color")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByText("Emoji")).toBeInTheDocument();
  });

  it("renders Create button for new, Update for existing", () => {
    renderForm();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("shows an inline error naming missing fields on submit", () => {
    const { save, onDone } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Still needed: a title, a date, a color, an emoji.",
    );
    expect(save).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it("calls save and closes immediately on valid create", async () => {
    const { save, onDone } = renderForm();
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Year" },
    });
    fireEvent.change(screen.getByLabelText("Color"), {
      target: { value: "#00ff00" },
    });
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2030-12-31" },
    });
    fireEvent.click(await screen.findByTestId("emoji-picker"));
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Year", emoji: "🎉" }),
    );
    expect(onDone).toHaveBeenCalled();
  });

  it("calls update with the id for an existing countdown", () => {
    const { update, onDone } = renderForm({ existingCountdown });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
    expect(onDone).toHaveBeenCalled();
  });

  it("calls onDone when Back is clicked", () => {
    const { onDone } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onDone).toHaveBeenCalled();
  });

  it("shows emoji picker for new countdown", async () => {
    renderForm();
    expect(await screen.findByTestId("emoji-picker")).toBeInTheDocument();
  });

  it("shows Change Emoji for existing countdown and reopens picker", async () => {
    renderForm({ existingCountdown });
    fireEvent.click(screen.getByRole("button", { name: "Change Emoji" }));
    expect(await screen.findByTestId("emoji-picker")).toBeInTheDocument();
  });

  it("displays chosen values for an existing countdown", () => {
    renderForm({ existingCountdown });
    expect(screen.getByText(/Title Added/)).toBeInTheDocument();
    expect(screen.getByText(/You have chosen #FF0000/)).toBeInTheDocument();
    expect(screen.getByText(/You have chosen 🎄/)).toBeInTheDocument();
    expect(screen.getByText(/You have chosen.*Dec.*2026/)).toBeInTheDocument();
  });
});
