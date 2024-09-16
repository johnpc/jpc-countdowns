import { ChangeEvent, useState } from "react";
import { createCountdown } from "../entities";
import {
  Button,
  Divider,
  Label,
  TextField,
  useTheme,
} from "@aws-amplify/ui-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export default function CreateCountdown(props: { onCreated: () => void }) {
  const { tokens } = useTheme();
  const [title, setTitle] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [hexColor, setHexColor] = useState<string>();
  const [emoji, setEmoji] = useState<string>();

  const onCreateCountdownClick = async () => {
    if (!title || !date || !hexColor || !emoji) {
      alert("Ensure all fields are set.");
      return;
    }

    await createCountdown({
      title,
      date: date.toISOString(),
      hexColor,
      emoji,
    });

    props.onCreated();
  };

  const onSetDate = (event: ChangeEvent<HTMLInputElement>) => {
    setDate(new Date(event.target.value));
  };

  const onSetTitle = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const onSetColor = (event: ChangeEvent<HTMLInputElement>) => {
    console.log({ event });
    setHexColor(event.target.value);
  };

  const onSetEmoji = (emojiSelection: { native: string }) => {
    setEmoji(emojiSelection.native);
  };

  return (
    <>
      <TextField label="Title" type="text" onChange={onSetTitle}></TextField>
      <TextField label="Color" type="color" onChange={onSetColor}></TextField>
      <TextField label="Date" type="date" onChange={onSetDate}></TextField>
      <Label>Emoji</Label>
      <Picker label="Emoji" data={data} onEmojiSelect={onSetEmoji} />
      <Button isFullWidth onClick={onCreateCountdownClick}>
        Create
      </Button>
      <Divider margin={tokens.space.medium} padding={tokens.space.medium} />
      <Button variation="warning" isFullWidth onClick={props.onCreated}>
        Back
      </Button>
    </>
  );
}
