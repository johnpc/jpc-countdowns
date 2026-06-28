import {
  AccountSettings,
  Button,
  Card,
  Divider,
  Heading,
  Link,
  Text,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import { AuthUser, signOut } from "aws-amplify/auth";
import { CountdownEntity } from "../entities";
import { createCountdownsForMajorHolidays } from "../helpers/createCountdownsForMajorHolidays";
import WidgetSettingsCard from "./WidgetSettingsCard";

function SignOutButton() {
  return (
    <Button
      isFullWidth={true}
      variation="destructive"
      onClick={() => signOut()}
    >
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
  const handleSuccess = () => alert("success!");
  const spacedDivider = (
    <Divider
      marginBottom={tokens.space.medium}
      paddingBottom={tokens.space.medium}
    />
  );

  return (
    <View>
      <WidgetSettingsCard countdowns={props.countdowns} />
      <Card variation="elevated" borderRadius={tokens.radii.large}>
        <Heading>{props.user.signInDetails?.loginId}</Heading>
        <AccountSettings.ChangePassword onSuccess={handleSuccess} />
        {spacedDivider}
        <SignOutButton />
        {spacedDivider}
        <AccountSettings.DeleteUser onSuccess={handleSuccess} />
        {spacedDivider}
        <Button
          variation="primary"
          colorTheme="info"
          isFullWidth
          onClick={() => createCountdownsForMajorHolidays(props.countdowns)}
        >
          Generate Holiday Countdowns
        </Button>
        {spacedDivider}
        <Button
          variation="primary"
          colorTheme="info"
          isFullWidth
          onClick={props.onFinished}
        >
          Back
        </Button>
        {spacedDivider}
        <Text fontSize={tokens.fontSizes.small}>
          For support, email{" "}
          <Link href="mailto:john@johncorser.com">
            john@johncorser.com
          </Link>{" "}
        </Text>
      </Card>
    </View>
  );
}
