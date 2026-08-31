import { ChangeEvent, useState } from "react";
import { CountdownEntity } from "../entities";
import { buildCountdownPayload, parseInputDate } from "./countdownForm";

type Change = ChangeEvent<HTMLInputElement>;

/**
 * Form state + create/update submission for a single countdown. The component
 * stays render-only; all validation lives here. Submission is optimistic —
 * the save/update callbacks apply instantly and the form closes immediately.
 */
export const useCountdownForm = (
  existing: CountdownEntity | undefined,
  save: (draft: Omit<CountdownEntity, "id">) => void,
  update: (countdown: CountdownEntity) => void,
  onDone: () => void,
) => {
  const [title, setTitle] = useState(existing?.title);
  const [date, setDate] = useState<Date | undefined>(
    existing ? new Date(existing.date) : undefined,
  );
  const [hexColor, setHexColor] = useState(existing?.hexColor);
  const [emoji, setEmoji] = useState(existing?.emoji);
  const [showEmojiSelector, setShowEmojiSelector] = useState(!existing?.emoji);
  const [error, setError] = useState<string>();

  const selectEmoji = (native: string) => {
    setEmoji(native);
    setShowEmojiSelector(false);
  };

  const submit = () => {
    const { entity, error: validationError } = buildCountdownPayload({
      title,
      date,
      hexColor,
      emoji,
    });
    if (validationError || !entity) {
      setError(validationError);
      return;
    }
    if (existing?.id) {
      update({ id: existing.id, ...entity });
    } else {
      save(entity);
    }
    onDone();
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
    error,
    submit,
  };
};
