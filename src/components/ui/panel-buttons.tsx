import {
  PanelRightOpen as PanelRightOpenIcon,
  PanelRightClose as PanelRightCloseIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface PanelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
}

export const PanelRightOpen = ({
  className,
  onClick,
  ...props
}: PanelButtonProps) => {
  return (
    <button
      className={cn(
        "p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <PanelRightOpenIcon className="h-5 w-5 text-gray-700" />
    </button>
  );
};

export const PanelRightClose = ({
  className,
  onClick,
  ...props
}: PanelButtonProps) => {
  return (
    <button
      className={cn(
        "p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <PanelRightCloseIcon className="h-5 w-5 text-gray-700" />
    </button>
  );
};
