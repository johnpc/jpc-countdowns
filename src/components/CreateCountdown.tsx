import { ChangeEvent, useState } from "react";
import { createCountdown } from "../entities";
import {
  Button,
  Divider,
  Label,
  Text,
  TextField,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export default function CreateCountdown(props: { onCreated: () => void }) {
  const { tokens } = useTheme();
  const [title, setTitle] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [hexColor, setHexColor] = useState<string>();
  const [emoji, setEmoji] = useState<string>();
  const [showEmojiSelector, setShowEmojiSelector] = useState<boolean>(true);

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
    setShowEmojiSelector(false);
  };

  return (
    <View padding={tokens.space.medium}>
      <TextField
        descriptiveText={
          title ? "Title Added ✅" : "Add a title for your countdown"
        }
        label="Title"
        type="text"
        onChange={onSetTitle}
      ></TextField>
      <Divider
        marginBottom={tokens.space.medium}
        paddingBottom={tokens.space.medium}
      />
      <TextField
        descriptiveText={
          hexColor ? `You have chosen ${hexColor}` : "Select a color"
        }
        size="large"
        label="Color"
        type="color"
        onChange={onSetColor}
      ></TextField>
      <Divider
        marginBottom={tokens.space.medium}
        paddingBottom={tokens.space.medium}
      />
      <TextField
        descriptiveText={
          date ? `You have chosen ${date.toDateString()}` : "Select a date"
        }
        label="Date"
        type="date"
        onChange={onSetDate}
      ></TextField>
      <Divider
        marginBottom={tokens.space.medium}
        paddingBottom={tokens.space.medium}
      />
      <Label>Emoji</Label>
      <Text>{emoji ? `You have chosen ${emoji}` : "Select an emoji"}</Text>
      {showEmojiSelector ? (
        <Picker label="Emoji" data={data} onEmojiSelect={onSetEmoji} />
      ) : (
        <Button
          margin={tokens.space.small}
          onClick={() => setShowEmojiSelector(true)}
        >
          Change Emoji
        </Button>
      )}
      <Divider
        marginBottom={tokens.space.medium}
        paddingBottom={tokens.space.medium}
      />
      <Button variation="primary" isFullWidth onClick={onCreateCountdownClick}>
        Create
      </Button>
      <Divider
        marginBottom={tokens.space.medium}
        paddingBottom={tokens.space.medium}
      />
      <Button variation="link" isFullWidth onClick={props.onCreated}>
        Back
      </Button>
    </View>
  );
}
