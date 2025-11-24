import { Sparkles } from "lucide-react";

export function OfficialPartnerBadge() {
  return (
    <div className="fixed top-20 right-4 z-40">
      <div className="relative group">
        <div className="relative bg-white rounded-2xl p-3 shadow-xl flex items-center gap-2 border border-red-100 transform transition-all duration-300 hover:scale-105">
          <div className="bg-red-800 p-2 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              official training partner
            </p>
            <p className="text-sm font-bold text-gray-900"> of FTC</p>
          </div>
        </div>
      </div>
    </div>
  );
}
