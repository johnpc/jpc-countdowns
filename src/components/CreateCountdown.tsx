import { CountdownEntity } from "../entities";
import { toDateInputValue } from "../helpers/countdownForm";
import { useCountdownForm } from "../helpers/useCountdownForm";
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
  const existing = props.existingCountdown;
  const form = useCountdownForm(existing, props.onCreated);

  const spacedDivider = (
    <Divider
      marginBottom={tokens.space.medium}
      paddingBottom={tokens.space.medium}
    />
  );

  return (
    <View padding={tokens.space.medium}>
      <TextField
        defaultValue={form.title}
        descriptiveText={
          form.title ? "Title Added ✅" : "Add a title for your countdown"
        }
        label="Title"
        type="text"
        onChange={form.onTitleChange}
      />
      {spacedDivider}
      <TextField
        defaultValue={form.hexColor}
        descriptiveText={
          form.hexColor ? `You have chosen ${form.hexColor}` : "Select a color"
        }
        size="large"
        label="Color"
        type="color"
        onChange={form.onColorChange}
      />
      {spacedDivider}
      <TextField
        defaultValue={toDateInputValue(existing?.date)}
        descriptiveText={
          form.date
            ? `You have chosen ${form.date.toDateString()}`
            : "Select a date"
        }
        label="Date"
        type="date"
        onChange={form.onDateChange}
      />
      {spacedDivider}
      <Label>Emoji</Label>
      <Text>
        {form.emoji ? `You have chosen ${form.emoji}` : "Select an emoji"}
      </Text>
      {form.showEmojiSelector ? (
        <Picker
          label="Emoji"
          data={data}
          onEmojiSelect={(s: { native: string }) => form.selectEmoji(s.native)}
        />
      ) : (
        <Button
          margin={tokens.space.small}
          onClick={() => form.setShowEmojiSelector(true)}
        >
          Change Emoji
        </Button>
      )}
      {spacedDivider}
      <Button variation="primary" isFullWidth onClick={form.submit}>
        {existing ? "Update" : "Create"}
      </Button>
      {spacedDivider}
      <Button variation="link" isFullWidth onClick={props.onCreated}>
        Back
      </Button>
    </View>
  );
}
