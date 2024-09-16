import {
  AccountSettings,
  Button,
  Card,
  Divider,
  Heading,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import { AuthUser } from "aws-amplify/auth";
import { signOut } from "aws-amplify/auth";

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
  onFinished: () => void;
}) {
  const { tokens } = useTheme();

  const handleSuccess = () => {
    alert("success!");
  };

  return (
    <View>
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
      </Card>
    </View>
  );
}
