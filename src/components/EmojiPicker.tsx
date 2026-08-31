import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

/** Thin wrapper so the heavy emoji-mart picker + data code-split into their
 * own chunk, loaded only when the create/edit form actually needs them. */
export default function EmojiPicker(props: {
  onSelect: (native: string) => void;
}) {
  return (
    <Picker
      label="Emoji"
      data={data}
      onEmojiSelect={(s: { native: string }) => props.onSelect(s.native)}
    />
  );
}
