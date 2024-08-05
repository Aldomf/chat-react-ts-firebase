import Login from "@/components/auth/login";
import Register from "@/components/auth/register";

function RootLayout() {
  const user = false;
  return (
    <div>
      {user ? (
        "welcome"
      ) : (
        <div className="border border-red-500 h-screen place-content-center mx-40 grid grid-cols-2 gap-4">
          <Login />
          <Register />
        </div>
      )}
    </div>
  );
}

export default RootLayout;
