// components/PWAInstallToast.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { usePWAInstallPrompt } from "../hooks/usePWAInstallPrompt";

const PWAInstallToast = () => {
  const deferredPrompt = usePWAInstallPrompt();

  useEffect(() => {
    // ✅ Skip if no prompt or already shown this session
    if (!deferredPrompt || sessionStorage.getItem("installPromptShown")) return;

    // ✅ Delay showing prompt by 3 seconds
    const timer = setTimeout(() => {
      sessionStorage.setItem("installPromptShown", "true");

      const toastId = toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <p className="text-sm font-medium text-gray-900">
                Install our App
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Get a faster experience on your device.
              </p>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={async () => {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  toast.dismiss(t.id);
                  if (outcome === "accepted") {
                    console.log("User accepted the install prompt");
                  } else {
                    console.log("User dismissed the install prompt");
                  }
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Install
              </button>
            </div>
          </div>
        ),
        { duration: 10000 }
      );

      // Dismiss if component unmounts
      return () => toast.dismiss(toastId);
    }, 3000); // ⏱️ Delay: 3 seconds

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [deferredPrompt]);

  return null;
};

export default PWAInstallToast;
