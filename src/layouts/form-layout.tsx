import Login from "@/components/auth/login";
import Register from "@/components/auth/register";

function FormLayout() {
  return (
    <div className="border border-red-500 place-content-center mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-200">
      <Login />
      <Register />
    </div>
  );
}

export default FormLayout;
