import React from 'react';
import { useCostume } from '../../context/CostumeContext.jsx';
import { Shirt, Check, Sparkles } from 'lucide-react';

export const CostumeCard = ({ item }) => {
  const { selectedCostumeId, selectCostume } = useCostume();
  const isSelected = selectedCostumeId === item.id;

  const categoryColor = {
    Traditional: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
    Casual: 'text-sky-400 bg-sky-950/60 border-sky-800/40',
    Formal: 'text-purple-400 bg-purple-950/60 border-purple-800/40',
  }[item.category] || 'text-slate-400 bg-slate-800 border-slate-700';

  return (
    <div
      onClick={() => selectCostume(item.id)}
      className={`relative group cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-900 border-purple-500 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/40 scale-[1.01]'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
      }`}
    >
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColor}`}>
            {item.category}
          </span>
          {item.badge && (
            <span className="text-[10px] font-medium text-slate-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              <span>{item.badge}</span>
            </span>
          )}
        </div>

        {/* Thumbnail Representation */}
        <div className="h-28 w-full rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-slate-700 transition-colors">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${item.defaultColor}25`, borderColor: `${item.defaultColor}60` }}
          >
            <Shirt className="w-6 h-6" style={{ color: item.defaultColor }} />
          </div>

          {/* Colorway preview dots */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {item.availableColors.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full border border-slate-800"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Information */}
        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
          {item.name}
        </h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">3D Fitted Mesh</span>
        {isSelected ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
            <Check className="w-3.5 h-3.5" />
            <span>Wearing</span>
          </span>
        ) : (
          <button
            type="button"
            className="text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/50 px-3 py-1 rounded-lg transition-all"
          >
            Try On
          </button>
        )}
      </div>
    </div>
  );
};

export default CostumeCard;
