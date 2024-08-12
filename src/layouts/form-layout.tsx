import Login from "@/components/auth/login";
import Register from "@/components/auth/register";

function FormLayout() {
  return (
    <div className="place-content-center mx-auto py-10 px-4 md:px-28 grid grid-cols-1 gap-4 bg-gray-200">
      <h1 className="text-3xl font-bold text-center">Welcome to Connectly!</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-200">
      <Login />
      <Register />
      </div>
    </div>
  );
}

export default FormLayout;
