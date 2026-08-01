"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** iOS UIPicker-like row height */
export const WHEEL_ITEM_H = 40;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);
export const WHEEL_HEIGHT = WHEEL_ITEM_H * VISIBLE;

type WheelColumnProps = {
  items: number[];
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  formatLabel?: (n: number) => string;
  className?: string;
};

function indexOfValue(items: number[], value: number) {
  const i = items.indexOf(value);
  return i >= 0 ? i : 0;
}

function paintActive(scroller: HTMLElement, index: number) {
  const nodes = scroller.querySelectorAll<HTMLElement>("[data-wheel-item]");
  nodes.forEach((node, i) => {
    const on = i === index;
    node.classList.toggle("is-active", on);
    node.setAttribute("aria-selected", on ? "true" : "false");
  });
}

/**
 * Native momentum picker (real overflow scroll).
 * No body scroll-lock — that freezes iOS. No React state during drag.
 */
export function WheelColumn({
  items,
  value,
  onChange,
  ariaLabel,
  formatLabel = (n) => String(n).padStart(2, "0"),
  className = "flex-1",
}: WheelColumnProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const itemsRef = useRef(items);
  const onChangeRef = useRef(onChange);
  const touchingRef = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreSync = useRef(false);

  useEffect(() => {
    valueRef.current = value;
    itemsRef.current = items;
    onChangeRef.current = onChange;
  }, [value, items, onChange]);

  // Sync from controlled value only when the user isn't interacting
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || touchingRef.current) return;
    const i = indexOfValue(items, value);
    const top = i * WHEEL_ITEM_H;
    if (Math.abs(el.scrollTop - top) > 1) {
      ignoreSync.current = true;
      el.scrollTop = top;
      requestAnimationFrame(() => {
        ignoreSync.current = false;
      });
    }
    paintActive(el, i);
  }, [value, items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    // Initial position
    const i0 = indexOfValue(itemsRef.current, valueRef.current);
    el.scrollTop = i0 * WHEEL_ITEM_H;
    paintActive(el, i0);

    const settle = () => {
      const list = itemsRef.current;
      const i = Math.max(
        0,
        Math.min(list.length - 1, Math.round(el.scrollTop / WHEEL_ITEM_H))
      );
      const top = i * WHEEL_ITEM_H;
      if (Math.abs(el.scrollTop - top) > 1) {
        el.scrollTo({ top, behavior: "smooth" });
      }
      paintActive(el, i);
      const next = list[i];
      if (next !== undefined && next !== valueRef.current) {
        onChangeRef.current(next);
      }
    };

    const onScroll = () => {
      if (ignoreSync.current) return;
      const list = itemsRef.current;
      const i = Math.max(
        0,
        Math.min(list.length - 1, Math.round(el.scrollTop / WHEEL_ITEM_H))
      );
      paintActive(el, i);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        if (!touchingRef.current) settle();
      }, 140);
    };

    const onScrollEnd = () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settle();
    };

    const onTouchStart = () => {
      touchingRef.current = true;
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };

    const onTouchEnd = () => {
      touchingRef.current = false;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(settle, 160);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEnd as EventListener);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd as EventListener);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  return (
    <div
      className={`relative min-w-0 overflow-hidden ${className}`}
      style={{ height: WHEEL_HEIGHT }}
      role="listbox"
      aria-label={ariaLabel}
    >
      <div
        ref={scrollerRef}
        className="ios-wheel h-full w-full overflow-y-auto"
      >
        <div style={{ height: PAD * WHEEL_ITEM_H }} aria-hidden />
        {items.map((n) => (
          <div
            key={n}
            data-wheel-item
            role="option"
            aria-selected={n === value}
            className="ios-wheel-item"
            onClick={() => {
              const el = scrollerRef.current;
              if (!el) return;
              const i = indexOfValue(items, n);
              el.scrollTo({ top: i * WHEEL_ITEM_H, behavior: "smooth" });
              paintActive(el, i);
              if (n !== valueRef.current) onChange(n);
            }}
          >
            {formatLabel(n)}
          </div>
        ))}
        <div style={{ height: PAD * WHEEL_ITEM_H }} aria-hidden />
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
    <div className="ios-picker overflow-hidden rounded-2xl border border-black/5 bg-[#F7F2F0] shadow-inner">
      <div
        className="relative flex items-stretch px-1"
        style={{ height: WHEEL_HEIGHT }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-2 top-1/2 z-10 -translate-y-1/2 rounded-[8px] bg-black/[0.06]"
          style={{ height: WHEEL_ITEM_H }}
        />
        <div aria-hidden className="ios-picker-fade pointer-events-none absolute inset-0 z-20" />
        <div className="relative z-[1] flex w-full min-w-0 items-stretch">
          {children}
        </div>
      </div>
      <div className="border-t border-black/[0.06] bg-white/70 py-2.5 text-center font-serif text-lg text-woo-text">
        {footer}
      </div>
    </div>
  );
}
