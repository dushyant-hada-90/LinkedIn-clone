import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

function Popover({ isOpen, onClose, children }) {
  const contentRef = useRef();
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      // Only close if the click was NOT inside our popover content
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Use a timeout to wait for the opening click to finish
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div ref={contentRef}>
      {children}
    </div>,
    document.body
  );
}

export default Popover;
