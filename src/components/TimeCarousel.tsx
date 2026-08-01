"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);
const MINUTE_STEP = 5;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseTime(value: string): { h: number; m: number } {
  const match = /^(\d{1,2}):(\d{2})/.exec(value || "");
  if (!match) return { h: 19, m: 30 };
  const h = Math.min(23, Math.max(0, Number(match[1])));
  let m = Math.min(59, Math.max(0, Number(match[2])));
  m = Math.round(m / MINUTE_STEP) * MINUTE_STEP;
  if (m === 60) m = 55;
  return { h, m };
}

function WheelColumn({
  items,
  value,
  onChange,
  ariaLabel,
}: {
  items: number[];
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settling = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(value);

  const indexOf = useCallback(
    (n: number) => {
      const i = items.indexOf(n);
      return i >= 0 ? i : 0;
    },
    [items]
  );

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const el = scrollerRef.current;
    if (!el) return;
    settling.current = true;
    el.scrollTo({
      top: index * ITEM_H,
      behavior: smooth ? "smooth" : "auto",
    });
    window.setTimeout(() => {
      settling.current = false;
    }, smooth ? 280 : 40);
  }, []);

  useEffect(() => {
    scrollToIndex(indexOf(value), false);
    setActive(value);
  }, [value, indexOf, scrollToIndex]);

  function pickFromScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    const next = items[clamped];
    setActive(next);
    if (next !== value) onChange(next);
    scrollToIndex(clamped, true);
  }

  function onScroll() {
    if (settling.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    setActive(items[clamped]);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(pickFromScroll, 90);
  }

  return (
    <div
      className="relative h-[220px] flex-1 overflow-hidden"
      role="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={`${ariaLabel}-${active}`}
    >
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="time-wheel h-full overflow-y-auto overscroll-contain"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ height: PAD * ITEM_H }} aria-hidden />
        {items.map((n) => {
          const selected = n === active;
          return (
            <button
              key={n}
              id={`${ariaLabel}-${n}`}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(n);
                scrollToIndex(indexOf(n), true);
                setActive(n);
              }}
              className={`flex w-full shrink-0 items-center justify-center transition-all duration-150 ${
                selected
                  ? "scale-110 font-semibold text-woo-text"
                  : "scale-95 text-woo-muted/55"
              }`}
              style={{
                height: ITEM_H,
                scrollSnapAlign: "center",
                fontSize: selected ? "1.65rem" : "1.2rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {pad2(n)}
            </button>
          );
        })}
        <div style={{ height: PAD * ITEM_H }} aria-hidden />
      </div>
    </div>
  );
}

export function TimeCarousel({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const initial = useMemo(() => parseTime(value), [value]);
  const [hour, setHour] = useState(initial.h);
  const [minute, setMinute] = useState(initial.m);
  const seeded = useRef(false);

  useEffect(() => {
    const { h, m } = parseTime(value);
    setHour(h);
    setMinute(m);
  }, [value]);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const next = `${pad2(hour)}:${pad2(minute)}`;
    if (!value) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once from defaults
  }, []);

  function commit(h: number, m: number) {
    setHour(h);
    setMinute(m);
    onChange(`${pad2(h)}:${pad2(m)}`);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-b from-white via-[#FFF8F6] to-woo-accent-soft/40 shadow-inner">
      <div className="relative flex items-stretch px-2 py-1">
        {/* Selection band */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-11 -translate-y-1/2 rounded-xl border border-woo-accent/25 bg-woo-accent/10 shadow-[0_0_0_1px_rgba(232,93,117,0.06)]"
        />
        {/* Fade masks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-[#FFF8F6] via-[#FFF8F6]/90 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-woo-accent-soft/50 via-[#FFF8F6]/80 to-transparent"
        />

        <WheelColumn
          items={HOURS}
          value={hour}
          onChange={(h) => commit(h, minute)}
          ariaLabel="hour"
        />

        <div
          aria-hidden
          className="relative z-30 flex w-6 items-center justify-center font-serif text-2xl font-bold text-woo-accent"
        >
          :
        </div>

        <WheelColumn
          items={MINUTES}
          value={minute}
          onChange={(m) => commit(hour, m)}
          ariaLabel="minute"
        />
      </div>

      <p className="border-t border-black/5 bg-white/50 py-2.5 text-center font-serif text-lg text-woo-text">
        <span className="tabular-nums tracking-wide">
          {pad2(hour)}:{pad2(minute)}
        </span>
      </p>
    </div>
  );
}
