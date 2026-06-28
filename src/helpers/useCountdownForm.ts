import { ChangeEvent, useState } from "react";
import { CountdownEntity, createCountdown, updateCountdown } from "../entities";
import { buildCountdownPayload, parseInputDate } from "./countdownForm";

type Change = ChangeEvent<HTMLInputElement>;

/**
 * Form state + create/update submission for a single countdown. The component
 * stays render-only; all validation and persistence lives here.
 */
export const useCountdownForm = (
  existing: CountdownEntity | undefined,
  onCreated: () => void,
) => {
  const [title, setTitle] = useState(existing?.title);
  const [date, setDate] = useState<Date | undefined>(
    existing ? new Date(existing.date) : undefined,
  );
  const [hexColor, setHexColor] = useState(existing?.hexColor);
  const [emoji, setEmoji] = useState(existing?.emoji);
  const [showEmojiSelector, setShowEmojiSelector] = useState(!existing?.emoji);

  const selectEmoji = (native: string) => {
    setEmoji(native);
    setShowEmojiSelector(false);
  };

  const submit = async () => {
    const { entity, error } = buildCountdownPayload({
      title,
      date,
      hexColor,
      emoji,
    });
    if (error || !entity) {
      alert(error);
      return;
    }
    if (!existing?.id) {
      await createCountdown(entity);
    } else {
      await updateCountdown({ id: existing.id, ...entity });
    }
    onCreated();
  };

  return {
    title,
    onTitleChange: (e: Change) => setTitle(e.target.value),
    date,
    onDateChange: (e: Change) => setDate(parseInputDate(e.target.value)),
    hexColor,
    onColorChange: (e: Change) => setHexColor(e.target.value),
    emoji,
    showEmojiSelector,
    setShowEmojiSelector,
    selectEmoji,
    submit,
  };
};
