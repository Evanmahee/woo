"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const WHEEL_ITEM_H = 44;
const PAD = 2;

type WheelColumnProps = {
  items: number[];
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  formatLabel?: (n: number) => string;
  className?: string;
};

/**
 * Drag-based wheel — no nested scroll, so the page stays put on mobile.
 */
export function WheelColumn({
  items,
  value,
  onChange,
  ariaLabel,
  formatLabel = (n) => String(n).padStart(2, "0"),
  className = "flex-1",
}: WheelColumnProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const index = Math.max(0, items.indexOf(value));
  const [offset, setOffset] = useState(-index * WHEEL_ITEM_H);
  const offsetRef = useRef(offset);
  const valueRef = useRef(value);
  const itemsRef = useRef(items);
  const onChangeRef = useRef(onChange);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const moved = useRef(false);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    valueRef.current = value;
    itemsRef.current = items;
    onChangeRef.current = onChange;
  }, [value, items, onChange]);

  useEffect(() => {
    if (dragging.current) return;
    setOffset(-Math.max(0, items.indexOf(value)) * WHEEL_ITEM_H);
  }, [value, items]);

  const clampOffset = useCallback((y: number, len: number) => {
    const min = -(len - 1) * WHEEL_ITEM_H;
    return Math.max(min, Math.min(0, y));
  }, []);

  const snapToNearest = useCallback((y: number) => {
    const list = itemsRef.current;
    const raw = Math.round(-y / WHEEL_ITEM_H);
    const i = Math.max(0, Math.min(list.length - 1, raw));
    const snapped = -i * WHEEL_ITEM_H;
    setOffset(snapped);
    const next = list[i];
    if (next !== undefined && next !== valueRef.current) {
      onChangeRef.current(next);
    }
  }, []);

  // Non-passive touch listeners so we can preventDefault and stop page scroll
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      dragging.current = true;
      setIsDragging(true);
      moved.current = false;
      startY.current = e.touches[0].clientY;
      startOffset.current = offsetRef.current;
    };

    const onMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const dy = e.touches[0].clientY - startY.current;
      if (Math.abs(dy) > 3) moved.current = true;
      setOffset(clampOffset(startOffset.current + dy, itemsRef.current.length));
    };

    const onEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      snapToNearest(offsetRef.current);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [clampOffset, snapToNearest]);

  return (
    <div
      ref={rootRef}
      className={`relative h-[220px] select-none overflow-hidden touch-none ${className}`}
      role="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={`${ariaLabel}-${value}`}
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = e.deltaY > 0 ? 1 : -1;
        const i = Math.max(0, Math.min(items.length - 1, index + dir));
        if (items[i] !== value) onChange(items[i]);
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        dragging.current = true;
        setIsDragging(true);
        moved.current = false;
        startY.current = e.clientY;
        startOffset.current = offsetRef.current;
        const move = (ev: MouseEvent) => {
          if (!dragging.current) return;
          const dy = ev.clientY - startY.current;
          if (Math.abs(dy) > 3) moved.current = true;
          setOffset(clampOffset(startOffset.current + dy, itemsRef.current.length));
        };
        const up = () => {
          if (dragging.current) {
            dragging.current = false;
            setIsDragging(false);
            snapToNearest(offsetRef.current);
          }
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      }}
    >
      <div
        style={{
          transform: `translate3d(0, ${offset + PAD * WHEEL_ITEM_H}px, 0)`,
          transition: isDragging ? "none" : "transform 160ms ease-out",
        }}
      >
        {items.map((n) => {
          const selected = n === value;
          return (
            <div
              key={n}
              id={`${ariaLabel}-${n}`}
              role="option"
              aria-selected={selected}
              onClick={() => {
                if (moved.current) return;
                if (n !== value) onChange(n);
              }}
              className={`flex w-full shrink-0 items-center justify-center px-0.5 tabular-nums ${
                selected
                  ? "font-semibold text-woo-text"
                  : "font-medium text-woo-muted/50"
              }`}
              style={{
                height: WHEEL_ITEM_H,
                fontSize: selected ? "1.45rem" : "1.1rem",
              }}
            >
              {formatLabel(n)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WheelShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-b from-white via-[#FFF8F6] to-woo-accent-soft/40 shadow-inner [contain:layout_paint]">
      <div className="relative flex h-[220px] items-stretch px-1.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-11 -translate-y-1/2 rounded-xl border border-woo-accent/25 bg-woo-accent/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-gradient-to-b from-[#FFF8F6] via-[#FFF8F6]/85 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-woo-accent-soft/45 via-[#FFF8F6]/75 to-transparent"
        />
        {children}
      </div>
      <div className="border-t border-black/5 bg-white/50 py-2.5 text-center font-serif text-lg text-woo-text">
        {footer}
      </div>
    </div>
  );
}
