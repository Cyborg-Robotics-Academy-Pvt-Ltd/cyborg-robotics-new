"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact-us", label: "Contact" },
  { href: "/blogs", label: "Blogs" },
];

export default function ActiveLinkTest() {
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    // Find the best matching link based on current pathname
    let bestMatch = "";
    let bestMatchLength = 0;

    for (const link of navLinks) {
      // Skip empty or invalid hrefs
      if (!link.href || link.href === "#") continue;

      // For exact matches
      if (link.href === pathname) {
        bestMatch = link.href;
        break;
      }

      // For partial matches, find the longest matching path
      if (
        pathname.startsWith(link.href) &&
        link.href.length > bestMatchLength
      ) {
        bestMatch = link.href;
        bestMatchLength = link.href.length;
      }
    }

    setActiveLink(bestMatch || pathname);
  }, [pathname]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Active Link Test</h3>
      <nav className="flex space-x-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeLink === link.href
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="mt-2 text-sm text-gray-600">
        Current path: <span className="font-mono">{pathname}</span>
        <br />
        Active link: <span className="font-mono">{activeLink}</span>
      </p>
    </div>
  );
}
