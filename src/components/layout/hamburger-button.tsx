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
      type="button"
      className="flex h-10 w-10 flex-col items-center justify-center rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <span
        className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
          isOpen ? "translate-y-1 rotate-45" : "-translate-y-0.5"
        }`}
      />
      <span
        className={`mt-1 block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`mt-1 block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
          isOpen ? "-translate-y-1 -rotate-45" : "translate-y-0.5"
        }`}
      />
    </button>
  );
}
