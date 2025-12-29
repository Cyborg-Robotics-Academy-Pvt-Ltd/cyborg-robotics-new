"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsRight, Menu } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
  activeWhen?: (pathname: string) => boolean;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "fixed left-0  h-screen  hidden md:flex md:flex-col bg-white w-[300px] z-40 hide-scrollbar ", // changed to use full screen height
          open ? "px-4" : "px-2",
          className
        )}
        animate={{
          width: animate ? (open ? "250px" : "60px") : "300px",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={
          {
            willChange: "width",
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden   items-center justify-between bg-neutral-100  w-full"
        )}
        {...props}
      >
        <div className="fixed justify-start z-20 shadow-xl items-center p-1 rounded-full top-4 right-2 bg-white">
          <Menu className="text-neutral-800 " onClick={() => setOpen(!open)} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-[85%] inset-0 bg-white  md:p-10 p-4  flex flex-col justify-between hide-scrollbar z-40",
                className
              )}
            >
              <div
                className="absolute right-0 top-4 bg-red-800 rounded-full p-[2px]  z-50 text-black cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <IconX color="white" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const SidebarLinkComponent = ({
  link,
  className,
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  const pathname = usePathname();
  const isActive =
    (typeof link.activeWhen === "function" && link.activeWhen(pathname)) ||
    pathname === link.href;
  const iconElement = useMemo(() => {
    if (
      React.isValidElement(link.icon) &&
      typeof link.icon.props === "object" &&
      link.icon.props !== null &&
      "className" in link.icon.props
    ) {
      return React.cloneElement(
        link.icon as React.ReactElement<{ className?: string }>,
        {
          className: cn(
            (link.icon.props as { className?: string }).className,
            "transition-colors duration-150 group-hover/sidebar:text-[#B13133]",
            isActive && "text-[#B13133]"
          ),
        }
      );
    }
    return link.icon;
  }, [link.icon, isActive]);
  return (
    <Link
      href={link.href}
      className={cn(
        "relative flex items-center group/sidebar py-2 ",
        open ? "justify-start gap-2 pl-3" : "justify-center gap-0 pl-0",
        className
      )}
      onClick={(e) => {
        if (link.onClick) {
          e.preventDefault();
          link.onClick();
        }
      }}
    >
      <span
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded bg-[#B13133] opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100",
          open ? "block" : "hidden",
          isActive && "opacity-100"
        )}
      />
      {iconElement}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-black  text-sm group-hover/sidebar:text-[#B13133] group-hover/sidebar:font-semibold group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
          isActive && "text-[#B13133] font-bold"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

export const SidebarLink = React.memo(SidebarLinkComponent);
