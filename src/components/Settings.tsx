import {
  AccountSettings,
  Button,
  Card,
  Divider,
  Heading,
  Link,
  SelectField,
  Text,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import { AuthUser } from "aws-amplify/auth";
import { signOut } from "aws-amplify/auth";
import Countdown from "./Countdown";
import { CountdownEntity } from "../entities";
import { useState } from "react";
import { WidgetsBridgePlugin } from "capacitor-widgetsbridge-plugin";
import {
  WIDGET_OVERRIDE_COUNTDOWN_ID_KEY,
  WIDGET_PREFERENCES_GROUP,
} from "./Countdowns";

const localStorageWidgetCountdownIdKey = "widgetCountdownId";

function SignOutButton() {
  const onSignOut = async () => {
    await signOut();
  };

  return (
    <Button isFullWidth={true} variation="destructive" onClick={onSignOut}>
      Sign Out
    </Button>
  );
}
export default function SettingsPage(props: {
  user: AuthUser;
  countdowns: CountdownEntity[];
  onFinished: () => void;
}) {
  const { tokens } = useTheme();
  const [updateCount, setUpdateCount] = useState(0);

  const handleSuccess = () => {
    alert("success!");
  };
  const widgetCountdownId = localStorage.getItem(
    localStorageWidgetCountdownIdKey
  );
  console.log({ widgetCountdownId });
  const selectedWidgetCountdown =
    props.countdowns.find((countdown) => countdown.id === widgetCountdownId) ??
    props.countdowns[0];

  const handleUpdateWidget = async (countdown: CountdownEntity) => {
    console.log({ countdown });
    localStorage.setItem(localStorageWidgetCountdownIdKey, countdown.id!);
    await WidgetsBridgePlugin.setItem({
      group: WIDGET_PREFERENCES_GROUP,
      key: WIDGET_OVERRIDE_COUNTDOWN_ID_KEY,
      value: countdown.id!,
    });
    setUpdateCount(updateCount + 1);
  };

  return (
    <View>
      <Card
        variation="elevated"
        borderRadius={tokens.radii.large}
        marginBottom={tokens.space.medium}
      >
        <Heading level={5}>Widget Settings</Heading>
        <Text>Widget Preview:</Text>
        {props.countdowns.length ? (
          <Countdown
            countdown={selectedWidgetCountdown}
            setCreateCountdown={() => {}}
            setSelectedCountdown={() => {}}
            deleteCountdown={() => {}}
          />
        ) : (
          <Text>No countdowns found</Text>
        )}
        <SelectField
          label="Update Widget Countdown"
          descriptiveText="The countdown to appear on Home Screen widget"
          onChange={(e) =>
            handleUpdateWidget(
              props.countdowns.find((c) => c.id == e.target.value)!
            )
          }
        >
          {props.countdowns.map((countdown) => (
            <option key={countdown.id} value={countdown.id}>
              {countdown.title}
            </option>
          ))}
        </SelectField>
      </Card>
      <Card variation="elevated" borderRadius={tokens.radii.large}>
        <Heading>{props.user.signInDetails?.loginId}</Heading>
        <AccountSettings.ChangePassword onSuccess={handleSuccess} />
        <Divider
          marginBottom={tokens.space.medium}
          paddingBottom={tokens.space.medium}
        />
        <SignOutButton />
        <Divider
          marginBottom={tokens.space.medium}
          paddingBottom={tokens.space.medium}
        />
        <AccountSettings.DeleteUser onSuccess={handleSuccess} />
        <Divider
          marginBottom={tokens.space.medium}
          paddingBottom={tokens.space.medium}
        />
        <Button
          variation="primary"
          colorTheme="info"
          isFullWidth
          onClick={props.onFinished}
        >
          Back
        </Button>
        <Divider
          marginBottom={tokens.space.medium}
          paddingBottom={tokens.space.medium}
        />
        <Text fontSize={tokens.fontSizes.small}>
          For support, email{" "}
          <Link href="mailto:john@johncorser.com">john@johncorser.com</Link>{" "}
        </Text>
      </Card>
    </View>
  );
}
