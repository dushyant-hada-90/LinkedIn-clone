// import { ClipLoader } from "react-spinners";

// export default function AppGate({ userData, children }) {
//   if (userData === "loading") {
//     return (
//       <div className="w-full h-screen flex items-center justify-center">
//         <ClipLoader size={25} />
//       </div>
//     );
//   }

//   return children;
// }
import logo from "../assets/logo.svg";

export default function AppGate({ userData, children }) {
  if (userData === "loading") {
    return (
      <>
        {/* Local CSS only for this component */}
        <style>{`
          @keyframes linkedinLoader {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(200%); }
            100% { transform: translateX(-100%); }
          }
          .linkedin-loader {
            animation: linkedinLoader 1.4s ease-in-out infinite;
          }
        `}</style>

        <div className="w-screen h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-6">
            {/* Logo */}
            <img
              src={logo}
              alt="App Logo"
              className="w-16 h-16 object-contain"
            />

            {/* LinkedIn-style bar */}
            <div className="relative w-52 h-[3px] bg-gray-200 overflow-hidden rounded">
              <div className="absolute inset-y-0 w-1/3 bg-[#0A66C2] linkedin-loader" />
            </div>

            {/* Optional UX copy */}
            <p className="text-xs text-gray-500">
              Initial load may take a few seconds
            </p>
          </div>
        </div>
      </>
    );
  }

  return children;
}
