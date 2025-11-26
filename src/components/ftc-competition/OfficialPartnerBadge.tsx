import { Users } from "lucide-react";
import Link from "next/link";

export function OfficialPartnerBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="relative group">
        <Link
          href="https://docs.google.com/forms/d/e/1FAIpQLScsyPIaYIeznyzY48p_wquf1T4TLym5snO6xn3Iz_Epq63gjw/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="relative bg-red-800 rounded-full p-3 shadow-xl flex items-center gap-2  transform transition-all duration-300 hover:scale-105 cursor-pointer animate-bounce"
        >
          {/* Mobile view - icon and short text only */}
          <div className="flex items-center md:hidden">
            <div className="bg-white p-1 rounded-full">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-bold text-white">Apply Now</p>
            </div>
          </div>

          {/* Desktop view - full content */}
          <div className="hidden md:flex items-center">
            <div className="bg-white p-1 rounded-full">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-bold text-white">
                Apply Now - Limited Seats
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
