import ChatLayout from "./chat-layout";
import FormLayout from "./form-layout";

function RootLayout() {
  const user = false;
  return <div>{user ? <ChatLayout /> : <FormLayout />}</div>;
}

export default RootLayout;
