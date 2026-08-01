"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useI18n } from "@/lib/i18n/provider";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function todayParts() {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
}

function tomorrowParts() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
}

function parseDate(value: string): { y: number; m: number; d: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
  if (!match) return tomorrowParts();
  const y = Number(match[1]);
  const m = Math.min(12, Math.max(1, Number(match[2])));
  const maxD = daysInMonth(y, m);
  const d = Math.min(maxD, Math.max(1, Number(match[3])));
  return { y, m, d };
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function clampNotPast(y: number, m: number, d: number) {
  const t = todayParts();
  const picked = new Date(y, m - 1, d);
  const today = new Date(t.y, t.m - 1, t.d);
  if (picked < today) return t;
  return { y, m, d };
}

function WheelColumn({
  items,
  value,
  onChange,
  ariaLabel,
  formatLabel = (n: number) => pad2(n),
  flex = "flex-1",
}: {
  items: number[];
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  formatLabel?: (n: number) => string;
  flex?: string;
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
      className={`relative h-[220px] overflow-hidden ${flex}`}
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
              className={`flex w-full shrink-0 items-center justify-center px-0.5 transition-all duration-150 ${
                selected
                  ? "scale-105 font-semibold text-woo-text"
                  : "scale-95 text-woo-muted/55"
              }`}
              style={{
                height: ITEM_H,
                scrollSnapAlign: "center",
                fontSize: selected ? "1.35rem" : "1.05rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatLabel(n)}
            </button>
          );
        })}
        <div style={{ height: PAD * ITEM_H }} aria-hidden />
      </div>
    </div>
  );
}

export function DateCarousel({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale } = useI18n();
  const intlLocale = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  const yearOptions = useMemo(() => {
    const { y } = todayParts();
    return [y, y + 1, y + 2];
  }, []);

  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const initial = useMemo(() => parseDate(value), [value]);
  const [year, setYear] = useState(initial.y);
  const [month, setMonth] = useState(initial.m);
  const [day, setDay] = useState(initial.d);
  const seeded = useRef(false);

  const dayOptions = useMemo(() => {
    const max = daysInMonth(year, month);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [year, month]);

  useEffect(() => {
    const { y, m, d } = parseDate(value);
    setYear(y);
    setMonth(m);
    setDay(d);
  }, [value]);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (!value) {
      const t = tomorrowParts();
      onChange(toIso(t.y, t.m, t.d));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once
  }, []);

  function commit(y: number, m: number, d: number) {
    const max = daysInMonth(y, m);
    const safeD = Math.min(d, max);
    const clamped = clampNotPast(y, m, safeD);
    setYear(clamped.y);
    setMonth(clamped.m);
    setDay(clamped.d);
    onChange(toIso(clamped.y, clamped.m, clamped.d));
  }

  const pretty = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(intlLocale, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(year, month - 1, day));
    } catch {
      return toIso(year, month, day);
    }
  }, [year, month, day, intlLocale]);

  const monthLabel = useCallback(
    (m: number) =>
      new Intl.DateTimeFormat(intlLocale, { month: "short" }).format(
        new Date(2024, m - 1, 1)
      ),
    [intlLocale]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-b from-white via-[#FFF8F6] to-woo-accent-soft/40 shadow-inner">
      <div className="relative flex items-stretch px-1.5 py-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-11 -translate-y-1/2 rounded-xl border border-woo-accent/25 bg-woo-accent/10 shadow-[0_0_0_1px_rgba(232,93,117,0.06)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-[#FFF8F6] via-[#FFF8F6]/90 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-woo-accent-soft/50 via-[#FFF8F6]/80 to-transparent"
        />

        <WheelColumn
          items={dayOptions}
          value={Math.min(day, dayOptions[dayOptions.length - 1] ?? 1)}
          onChange={(d) => commit(year, month, d)}
          ariaLabel="day"
          flex="w-[22%]"
        />
        <WheelColumn
          items={monthOptions}
          value={month}
          onChange={(m) => commit(year, m, day)}
          ariaLabel="month"
          formatLabel={monthLabel}
          flex="flex-[1.35]"
        />
        <WheelColumn
          items={yearOptions}
          value={yearOptions.includes(year) ? year : yearOptions[0]}
          onChange={(y) => commit(y, month, day)}
          ariaLabel="year"
          formatLabel={(y) => String(y)}
          flex="w-[30%]"
        />
      </div>

      <p className="border-t border-black/5 bg-white/50 py-2.5 text-center font-serif text-lg capitalize text-woo-text">
        {pretty}
      </p>
    </div>
  );
}
