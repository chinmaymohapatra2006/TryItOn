import React from 'react';
import { useCostume } from '../../context/CostumeContext.jsx';
import { Shirt, Check, Sparkles } from 'lucide-react';

export const CostumeCard = ({ item }) => {
  const { selectedCostumeId, selectCostume } = useCostume();
  const isSelected = selectedCostumeId === item.id;

  const categoryColor = {
    Traditional: 'text-[#8A734C] bg-[#F4EFE6] border-[#E8DFC8]',
    Casual: 'text-[#6E5341] bg-[#F7F2EC] border-[#E9E1D6]',
    Formal: 'text-[#1C1917] bg-[#EBDDCE] border-[#D9C4AF]',
  }[item.category] || 'text-[#6E5341] bg-[#F7F2EC] border-[#E9E1D6]';

  return (
    <div
      onClick={() => selectCostume(item.id)}
      className={`relative group cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
        isSelected
          ? 'bg-white border-[#1C1917] shadow-md ring-1 ring-[#1C1917] scale-[1.01]'
          : 'bg-[#FAF7F2] border-[#E9E1D6] hover:border-[#8C6D58] hover:bg-white hover:shadow-sm'
      }`}
    >
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${categoryColor}`}>
            {item.category}
          </span>
          {item.badge && (
            <span className="text-[10px] font-medium text-[#8C6D58] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{item.badge}</span>
            </span>
          )}
        </div>

        {/* Thumbnail Representation */}
        <div className="h-32 w-full rounded-xl bg-[#F5F0EB] border border-[#E8DFC8] mb-3 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-[#8C6D58] transition-colors">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${item.defaultColor}25`, borderColor: `${item.defaultColor}60` }}
          >
            <Shirt className="w-6 h-6" style={{ color: item.defaultColor }} />
          </div>

          {/* Colorway preview dots */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {item.availableColors.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Information */}
        <h4 className="font-serif text-base font-semibold text-[#1C1917] group-hover:text-[#8C6D58] transition-colors">
          {item.name}
        </h4>
        <p className="text-xs text-[#6E5341] mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-[#E8DFC8] flex items-center justify-between">
        <span className="text-[11px] text-[#8C6D58] font-medium">3D Fitted Mesh</span>
        {isSelected ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            <span>Wearing</span>
          </span>
        ) : (
          <button
            type="button"
            className="text-xs font-semibold text-[#1C1917] hover:text-white bg-white hover:bg-[#1C1917] border border-[#1C1917] px-3.5 py-1 rounded-full transition-all"
          >
            Try On
          </button>
        )}
      </div>
    </div>
  );
};

export default CostumeCard;
