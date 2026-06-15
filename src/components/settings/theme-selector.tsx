"use client";

import { Zap } from "lucide-react";

export function ThemeSelector() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#888]">
        The dashboard uses a locked electric dark theme.
      </p>
      <div className="flex gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-[#C8FF00]/10 border border-[#C8FF00]/20 px-4 py-2 text-sm font-medium text-[#C8FF00]">
          <Zap className="h-4 w-4" />
          Electric Dark
        </div>
      </div>
    </div>
  );
}
