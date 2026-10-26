import { useMemo } from "react";
import { formatMoney } from "../utils/format";

/**
 * Props for the common Studio Hero Banner.
 */
export interface StudioHeroHeaderProps {
  badgeIcon: string;
  badgeLabel: string;
  title: string;
  subtitle: string;
  sampleButtonLabel: string;
  gradientClass: string;
  onExploreSample: () => void;
  onBackToHome: () => void;
}

/**
 * Standardized Hero Header for all dedicated event planning studios.
 */
export function StudioHeroHeader({
  badgeIcon,
  badgeLabel,
  title,
  subtitle,
  sampleButtonLabel,
  gradientClass,
  onExploreSample,
  onBackToHome,
}: StudioHeroHeaderProps) {
  return (
    <div className={`rounded-3xl p-6 text-white shadow-xl ${gradientClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            <span aria-hidden="true">{badgeIcon}</span> {badgeLabel}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-white/90">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExploreSample}
            className="btn border border-white/80 bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {sampleButtonLabel}
          </button>
          <button
            type="button"
            onClick={onBackToHome}
            className="btn bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Props for the interactive Feature Pill Selector.
 */
export interface FeaturePillSelectorProps {
  title: string;
  items: readonly string[];
  selectedItems: readonly string[];
  activeColorClass: string;
  onToggle: (item: string) => void;
}

/**
 * Accessible pill button selector for must-have event features.
 */
export function FeaturePillSelector({
  title,
  items,
  selectedItems,
  activeColorClass,
  onToggle,
}: FeaturePillSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
        {title}
      </label>
      <div className="flex flex-wrap gap-2" role="group" aria-label={title}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              aria-pressed={isSelected}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? `${activeColorClass} text-white shadow`
                  : "border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {isSelected ? "✓ " : "+ "}
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface SplitCategory {
  name: string;
  percentage: number;
}

export interface BudgetSplitCardProps {
  totalBudget: number;
  categories: readonly SplitCategory[];
  cardBorderClass: string;
  cardBgClass: string;
  titleColorClass: string;
}

/**
 * High-performance budget allocation estimator with memoized category calculations.
 */
export function BudgetSplitCard({
  totalBudget,
  categories,
  cardBorderClass,
  cardBgClass,
  titleColorClass,
}: BudgetSplitCardProps) {
  const splits = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name,
      percentage: cat.percentage,
      amount: formatMoney(Math.round(totalBudget * (cat.percentage / 100)), "USD"),
    }));
  }, [totalBudget, categories]);

  return (
    <div className={`rounded-xl border p-4 ${cardBorderClass} ${cardBgClass}`}>
      <h3 className={`text-xs font-bold uppercase tracking-wider ${titleColorClass}`}>
        Projected Budget Allocation Breakdown
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {splits.map((s) => (
          <div key={s.name} className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
            <span className="muted block">
              {s.name} ({s.percentage}%)
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{s.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
