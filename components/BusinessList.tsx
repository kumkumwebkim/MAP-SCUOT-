import React from "react";
import { Business } from "../types";
import { Star, Globe, MapPin, AlertCircle, ArrowRight } from "lucide-react";

interface BusinessListProps {
  businesses: Business[];
  selectedId: string | null;
  onSelect: (business: Business) => void;
  loading: boolean;
}

const BusinessList: React.FC<BusinessListProps> = ({
  businesses,
  selectedId,
  onSelect,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-900 rounded-lg border border-slate-800"></div>
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No results found. Start a search to see leads.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 pb-20">
      {businesses.map((biz) => {
        const isSelected = selectedId === biz.id;
        return (
          <div
            key={biz.id}
            onClick={() => onSelect(biz)}
            className={`
              relative group cursor-pointer rounded-xl p-5 border transition-all duration-300
              ${
                isSelected
                  ? "bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800"
              }
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-semibold text-lg ${isSelected ? "text-cyan-400" : "text-slate-100"}`}>
                {biz.name}
              </h3>
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium text-slate-300">{biz.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{biz.address}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {biz.issues.slice(0, 3).map((issue, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-950/30 text-red-400 border border-red-900/50"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {issue}
                </span>
              ))}
            </div>

            {isSelected && (
              <div className="mt-3 pt-3 border-t border-slate-700/50 animate-fadeIn">
                <p className="text-sm text-cyan-100 italic">"{biz.salesPitch}"</p>
                <div className="mt-2 flex items-center justify-end">
                   <span className="text-xs text-cyan-500 font-medium flex items-center hover:underline">
                     View details <ArrowRight className="w-3 h-3 ml-1" />
                   </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BusinessList;
