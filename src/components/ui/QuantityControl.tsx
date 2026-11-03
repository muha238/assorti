"use client";

type Props = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
};

export function QuantityControl({ quantity, onIncrement, onDecrement, size = "md" }: Props) {
  const btn =
    size === "sm"
      ? "h-7 w-7 text-base"
      : "h-9 w-9 text-lg";
  return (
    <div className="flex items-center gap-2 rounded-full bg-neutral-100 p-1">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Азайту"
        className={`${btn} flex items-center justify-center rounded-full bg-white font-semibold shadow-sm active:scale-95`}
      >
        −
      </button>
      <span className="min-w-5 text-center text-sm font-semibold tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Көбейту"
        className={`${btn} flex items-center justify-center rounded-full bg-neutral-900 font-semibold text-white active:scale-95`}
      >
        +
      </button>
    </div>
  );
}
