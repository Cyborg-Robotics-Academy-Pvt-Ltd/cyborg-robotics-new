"use client";

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerButton({
  isOpen,
  onClick,
}: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col justify-center items-center w-8 h-8 focus:outline-none"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <span
        className={`block w-5 h-0.5 bg-white rounded-sm ${
          isOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
        }`}
      />
      <span
        className={`block w-5 h-0.5 bg-white rounded-sm mt-1 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`block w-5 h-0.5 bg-white rounded-sm mt-1 ${
          isOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
        }`}
      />
    </button>
  );
}
