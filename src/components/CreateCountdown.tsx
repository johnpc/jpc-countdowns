import { CountdownEntity } from "../entities";
import { toDateInputValue } from "../helpers/countdownForm";
import { useCountdownForm } from "../helpers/useCountdownForm";
import {
  Button,
  Divider,
  Text,
  TextField,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import EmojiField from "./EmojiField";

export default function CreateCountdown(props: {
  existingCountdown?: CountdownEntity;
  save: (draft: Omit<CountdownEntity, "id">) => void;
  update: (countdown: CountdownEntity) => void;
  onDone: () => void;
}) {
  const { tokens } = useTheme();
  const existing = props.existingCountdown;
  const form = useCountdownForm(
    existing,
    props.save,
    props.update,
    props.onDone,
  );

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
      <EmojiField
        emoji={form.emoji}
        showSelector={form.showEmojiSelector}
        onOpenSelector={() => form.setShowEmojiSelector(true)}
        onSelect={form.selectEmoji}
      />
      {spacedDivider}
      {form.error && (
        <Text
          color={tokens.colors.red[60]}
          marginBottom={tokens.space.small}
          role="alert"
        >
          {form.error}
        </Text>
      )}
      <Button variation="primary" isFullWidth onClick={form.submit}>
        {existing ? "Update" : "Create"}
      </Button>
      {spacedDivider}
      <Button variation="link" isFullWidth onClick={props.onDone}>
        Back
      </Button>
    </View>
  );
}
