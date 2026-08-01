"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WheelColumn, WheelShell } from "@/components/WheelPicker";
import { useI18n } from "@/lib/i18n/provider";

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

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
/** Fixed 1–31 so the day column height never jumps when the month changes. */
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function DateCarousel({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale } = useI18n();
  const intlLocale =
    locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  const yearOptions = useMemo(() => {
    const { y } = todayParts();
    return [y, y + 1, y + 2];
  }, []);

  const initial = useMemo(() => parseDate(value), [value]);
  const [year, setYear] = useState(initial.y);
  const [month, setMonth] = useState(initial.m);
  const [day, setDay] = useState(initial.d);
  const seeded = useRef(false);

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
    <WheelShell footer={<span className="capitalize">{pretty}</span>}>
      <WheelColumn
        items={DAYS}
        value={day}
        onChange={(d) => commit(year, month, d)}
        ariaLabel="day"
        className="w-[22%]"
      />
      <WheelColumn
        items={MONTHS}
        value={month}
        onChange={(m) => commit(year, m, day)}
        ariaLabel="month"
        formatLabel={monthLabel}
        className="flex-[1.35]"
      />
      <WheelColumn
        items={yearOptions}
        value={yearOptions.includes(year) ? year : yearOptions[0]}
        onChange={(y) => commit(y, month, day)}
        ariaLabel="year"
        formatLabel={(y) => String(y)}
        className="w-[30%]"
      />
    </WheelShell>
  );
}
