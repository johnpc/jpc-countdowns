import { ChangeEvent, useState } from "react";
import { endOfDay } from "date-fns";
import { CountdownEntity, createCountdown, updateCountdown } from "../entities";
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

export default function CreateCountdown(props: {
  existingCountdown?: CountdownEntity;
  onCreated: () => void;
}) {
  const { tokens } = useTheme();
  const [title, setTitle] = useState<string | undefined>(
    props.existingCountdown?.title
  );
  const [date, setDate] = useState<Date | undefined>(
    props.existingCountdown ? new Date(props.existingCountdown.date) : undefined
  );
  const [hexColor, setHexColor] = useState<string | undefined>(
    props.existingCountdown?.hexColor
  );
  const [emoji, setEmoji] = useState<string | undefined>(
    props.existingCountdown?.emoji
  );
  const [showEmojiSelector, setShowEmojiSelector] = useState<boolean>(
    props.existingCountdown?.emoji ? false : true
  );

  const onCreateCountdownClick = async () => {
    if (!title || !date || !hexColor || !emoji) {
      alert("Ensure all fields are set.");
      return;
    }

    if (!props.existingCountdown?.id) {
      await createCountdown({
        title,
        date: date.toISOString(),
        hexColor,
        emoji,
      });
    } else {
      await updateCountdown({
        id: props.existingCountdown.id,
        title,
        date: date.toISOString(),
        hexColor,
        emoji,
      });
    }

    props.onCreated();
  };

  const onSetDate = (event: ChangeEvent<HTMLInputElement>) => {
    const inputtedDate = new Date(event.target.value);
    const utcDate = new Date(
      inputtedDate.toLocaleDateString("en-US", { timeZone: "utc" })
    );
    const updatedDate = endOfDay(utcDate);
    setDate(updatedDate);
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
        defaultValue={title}
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
        defaultValue={hexColor}
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
        defaultValue={
          !props.existingCountdown?.date
            ? undefined
            : `${new Date(
                props.existingCountdown.date
              ).getFullYear()}-${new Date(
                props.existingCountdown.date
              ).toLocaleDateString(undefined, { month: "2-digit" })}-${new Date(
                props.existingCountdown.date
              ).toLocaleDateString(undefined, { day: "2-digit" })}`
        }
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
        {props.existingCountdown ? "Update" : "Create"}
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
