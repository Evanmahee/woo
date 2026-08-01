"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Matches iOS UIPicker row height feel */
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

let scrollLocks = 0;
let lockedScrollY = 0;

function lockPageScroll() {
  if (typeof document === "undefined") return;
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
  if (typeof document === "undefined") return;
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
 * iOS-style picker column: native momentum scroll + scroll-snap.
 * Page scroll is locked while the finger is on the wheel shell.
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
  const ignoreScroll = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(value);

  useEffect(() => {
    valueRef.current = value;
    itemsRef.current = items;
    onChangeRef.current = onChange;
  }, [value, items, onChange]);

  const indexOf = (n: number) => {
    const i = items.indexOf(n);
    return i >= 0 ? i : 0;
  };

  // Jump to controlled value (no smooth — avoids fighting momentum)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const i = indexOf(value);
    const top = i * WHEEL_ITEM_H;
    if (Math.abs(el.scrollTop - top) < 1.5) {
      setActive(value);
      return;
    }
    ignoreScroll.current = true;
    el.scrollTop = top;
    setActive(value);
    const t = window.setTimeout(() => {
      ignoreScroll.current = false;
    }, 40);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on value/items only
  }, [value, items]);

  function commitFromScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const list = itemsRef.current;
    const i = Math.max(
      0,
      Math.min(list.length - 1, Math.round(el.scrollTop / WHEEL_ITEM_H))
    );
    // Hard snap if browser left us between ticks
    const top = i * WHEEL_ITEM_H;
    if (Math.abs(el.scrollTop - top) > 0.5) {
      ignoreScroll.current = true;
      el.scrollTo({ top, behavior: "smooth" });
      window.setTimeout(() => {
        ignoreScroll.current = false;
      }, 220);
    }
    const next = list[i];
    setActive(next);
    if (next !== undefined && next !== valueRef.current) {
      onChangeRef.current(next);
    }
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (ignoreScroll.current) return;
      const list = itemsRef.current;
      const i = Math.max(
        0,
        Math.min(list.length - 1, Math.round(el.scrollTop / WHEEL_ITEM_H))
      );
      setActive(list[i]);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(commitFromScroll, 120);
    };

    const onScrollEnd = () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
      commitFromScroll();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEnd);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height: WHEEL_HEIGHT }}
      role="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={`${ariaLabel}-${active}`}
    >
      <div
        ref={scrollerRef}
        className="ios-wheel h-full w-full overflow-y-auto overscroll-y-contain"
      >
        <div style={{ height: PAD * WHEEL_ITEM_H }} aria-hidden />
        {items.map((n) => {
          const selected = n === active;
          const dist = Math.min(
            3,
            Math.abs(items.indexOf(n) - items.indexOf(active))
          );
          const opacity = selected ? 1 : Math.max(0.22, 1 - dist * 0.28);
          return (
            <div
              key={n}
              id={`${ariaLabel}-${n}`}
              role="option"
              aria-selected={selected}
              onClick={() => {
                const el = scrollerRef.current;
                const i = indexOf(n);
                if (!el) return;
                el.scrollTo({ top: i * WHEEL_ITEM_H, behavior: "smooth" });
                setActive(n);
                if (n !== valueRef.current) onChange(n);
              }}
              className="ios-wheel-item flex w-full shrink-0 items-center justify-center px-0.5 tabular-nums"
              style={{
                height: WHEEL_ITEM_H,
                opacity,
                fontSize: selected ? "1.375rem" : "1.0625rem",
                fontWeight: selected ? 600 : 400,
                color: selected ? "#3D1F2B" : "#8A7A85",
                transition:
                  "opacity 120ms ease, font-size 120ms ease, color 120ms ease",
              }}
            >
              {formatLabel(n)}
            </div>
          );
        })}
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
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const onStart = () => lockPageScroll();
    const onEnd = () => unlockPageScroll();

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      while (scrollLocks > 0) unlockPageScroll();
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="ios-picker overflow-hidden rounded-2xl border border-black/5 bg-[#F7F2F0] shadow-inner [contain:layout]"
    >
      <div
        className="relative flex items-stretch px-1"
        style={{ height: WHEEL_HEIGHT }}
      >
        {/* iOS selection indicator */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-2 top-1/2 z-10 -translate-y-1/2 rounded-[8px] bg-black/[0.06]"
          style={{ height: WHEEL_ITEM_H }}
        />
        {/* Soft fade like UIPickerView */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(to bottom, rgba(247,242,240,0.96) 0%, rgba(247,242,240,0.55) 18%, transparent 36%, transparent 64%, rgba(247,242,240,0.55) 82%, rgba(247,242,240,0.96) 100%)",
          }}
        />
        <div className="relative z-[5] flex w-full items-stretch">
          {children}
        </div>
      </div>
      <div className="border-t border-black/[0.06] bg-white/70 py-2.5 text-center font-serif text-lg text-woo-text">
        {footer}
      </div>
    </div>
  );
}
