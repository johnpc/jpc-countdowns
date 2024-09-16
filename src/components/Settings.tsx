import {
  AccountSettings,
  Button,
  Card,
  Divider,
  Heading,
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
  const handleSuccess = () => {
    alert("success!");
  };

  return (
    <Card>
      <Heading>{props.user.signInDetails?.loginId}</Heading>
      <AccountSettings.ChangePassword onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      <SignOutButton />
      <Divider style={{ margin: "20px" }} />
      <AccountSettings.DeleteUser onSuccess={handleSuccess} />
      <Divider style={{ margin: "20px" }} />
      <Button variation="warning" isFullWidth onClick={props.onFinished}>
        Back
      </Button>
    </Card>
  );
}
