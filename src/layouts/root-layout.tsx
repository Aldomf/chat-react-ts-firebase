import Login from "@/components/auth/login";
import Register from "@/components/auth/register";

function RootLayout() {
  const user = false;
  return (
    <div>
      {user ? (
        "welcome"
      ) : (
        <>
          <Login />
          <Register />
        </>
      )}
    </div>
  );
}

export default RootLayout;
