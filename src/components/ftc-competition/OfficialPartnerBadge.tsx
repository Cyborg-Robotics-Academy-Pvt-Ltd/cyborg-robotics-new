import { Sparkles } from "lucide-react";

export function OfficialPartnerBadge() {
  return (
    <div className="fixed top-20 right-4 z-40 hidden lg:block">
      <div className="relative group">
        <div className="relative bg-white rounded-2xl p-3 shadow-xl flex items-center gap-2 border border-red-100">
          <div className="bg-red-800 p-2 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Official Training
            </p>
            <p className="text-sm font-bold text-gray-900">FTC Partner</p>
          </div>
        </div>
      </div>
    </div>
  );
}
