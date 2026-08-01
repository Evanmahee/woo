"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const WHEEL_ITEM_H = 48;
const PAD = 2;
/** Finger movement multiplier — lower = slower, more precise. */
const DRAG_FACTOR = 0.38;
const WHEEL_STEP_PX = 48;

type WheelColumnProps = {
  items: number[];
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  formatLabel?: (n: number) => string;
  className?: string;
};

let scrollLocks = 0;
let lockedScrollY = 0;

function lockPageScroll() {
  if (scrollLocks === 0) {
    lockedScrollY = window.scrollY;
    const body = document.body;
    body.dataset.wooScrollLock = "1";
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
  }
  scrollLocks += 1;
}

function unlockPageScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks > 0) return;
  const body = document.body;
  if (body.dataset.wooScrollLock !== "1") return;
  delete body.dataset.wooScrollLock;
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = "";
  window.scrollTo(0, lockedScrollY);
}

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
  const wheelAcc = useRef(0);

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

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      dragging.current = true;
      setIsDragging(true);
      moved.current = false;
      startY.current = e.touches[0].clientY;
      startOffset.current = offsetRef.current;
      lockPageScroll();
    };

    const onMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      e.stopPropagation();
      const finger = e.touches[0].clientY - startY.current;
      const dy = finger * DRAG_FACTOR;
      if (Math.abs(finger) > 4) moved.current = true;
      setOffset(clampOffset(startOffset.current + dy, itemsRef.current.length));
    };

    const onEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      snapToNearest(offsetRef.current);
      unlockPageScroll();
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
      if (dragging.current) {
        dragging.current = false;
        unlockPageScroll();
      }
    };
  }, [clampOffset, snapToNearest]);

  // Non-passive wheel so trackpads don't scroll the page
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      wheelAcc.current += e.deltaY;
      if (Math.abs(wheelAcc.current) < WHEEL_STEP_PX) return;
      const dir = wheelAcc.current > 0 ? 1 : -1;
      wheelAcc.current = 0;
      const list = itemsRef.current;
      const cur = Math.max(0, list.indexOf(valueRef.current));
      const i = Math.max(0, Math.min(list.length - 1, cur + dir));
      if (list[i] !== valueRef.current) onChangeRef.current(list[i]);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative h-[220px] select-none overflow-hidden touch-none ${className}`}
      role="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={`${ariaLabel}-${value}`}
      onMouseDown={(e) => {
        e.preventDefault();
        dragging.current = true;
        setIsDragging(true);
        moved.current = false;
        startY.current = e.clientY;
        startOffset.current = offsetRef.current;
        lockPageScroll();
        const move = (ev: MouseEvent) => {
          if (!dragging.current) return;
          const finger = ev.clientY - startY.current;
          const dy = finger * DRAG_FACTOR;
          if (Math.abs(finger) > 4) moved.current = true;
          setOffset(clampOffset(startOffset.current + dy, itemsRef.current.length));
        };
        const up = () => {
          if (dragging.current) {
            dragging.current = false;
            setIsDragging(false);
            snapToNearest(offsetRef.current);
            unlockPageScroll();
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
          transition: isDragging ? "none" : "transform 200ms ease-out",
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
  const shellRef = useRef<HTMLDivElement>(null);

  // Block page scroll anywhere over the carousel
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const onStart = () => lockPageScroll();
    const onEnd = () => unlockPageScroll();
    const block = (e: TouchEvent) => {
      e.preventDefault();
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", block, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", block);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-b from-white via-[#FFF8F6] to-woo-accent-soft/40 shadow-inner touch-none [contain:layout_paint]"
    >
      <div className="relative flex h-[220px] items-stretch px-1.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-12 -translate-y-1/2 rounded-xl border border-woo-accent/25 bg-woo-accent/10"
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
