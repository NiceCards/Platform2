import { useEffect, useState } from 'react';
import { IconPlus, IconMinus } from './icons';

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/**
 * Quantity selector with decrease/increase buttons plus an editable input
 * so customers can either tap the buttons or type the quantity directly.
 */
const QuantityStepper = ({ value, max, onChange, compact = false }) => {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  const upper = Math.max(max, 1);

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  const apply = (raw) => {
    if (raw === '') return;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    onChange(clamp(n, 1, upper));
  };

  const buttonCls = compact
    ? 'grid h-9 w-9 shrink-0 place-items-center text-slate-500 hover:text-brand-600 disabled:opacity-40'
    : 'grid h-12 w-12 shrink-0 place-items-center text-slate-500 hover:text-brand-600 disabled:opacity-40';

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className={buttonCls}
      >
        <IconMinus size={compact ? 14 : 16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max={upper}
        value={text}
        aria-label="Quantity"
        onFocus={() => setFocused(true)}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          if (raw !== '') apply(raw);
        }}
        onBlur={(e) => {
          const n = parseInt(e.target.value, 10);
          setFocused(false);
          if (Number.isNaN(n) || n < 1) {
            setText(String(value));
            return;
          }
          apply(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        className={
          compact
            ? 'h-9 w-10 bg-transparent text-center text-sm font-bold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            : 'h-12 w-12 bg-transparent text-center font-bold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        }
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(value + 1, upper))}
        disabled={value >= upper}
        aria-label="Increase quantity"
        className={buttonCls}
      >
        <IconPlus size={compact ? 14 : 16} />
      </button>
    </div>
  );
};

export default QuantityStepper;
