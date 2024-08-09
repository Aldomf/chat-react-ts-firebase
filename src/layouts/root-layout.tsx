import { useSigninCheck } from "reactfire";
import ChatLayout from "./chat-layout";
import FormLayout from "./form-layout";

function RootLayout() {
  const { status, data: useSigninCheckResult } = useSigninCheck();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return <div>{useSigninCheckResult.signedIn ? <ChatLayout /> : <FormLayout />}</div>;
}

export default RootLayout;
