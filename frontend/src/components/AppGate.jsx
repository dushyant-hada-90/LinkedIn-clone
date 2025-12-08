import { ClipLoader } from "react-spinners";

export default function AppGate({ userData, children }) {
  if (userData === "loading") {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <ClipLoader size={25} />
      </div>
    );
  }

  return children;
}
