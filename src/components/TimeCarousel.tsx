"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WheelColumn, WheelShell } from "@/components/WheelPicker";

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
    if (!value) onChange(`${pad2(hour)}:${pad2(minute)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once
  }, []);

  function commit(h: number, m: number) {
    setHour(h);
    setMinute(m);
    onChange(`${pad2(h)}:${pad2(m)}`);
  }

  return (
    <WheelShell
      footer={
        <span className="tabular-nums tracking-wide">
          {pad2(hour)}:{pad2(minute)}
        </span>
      }
    >
      <WheelColumn
        items={HOURS}
        value={hour}
        onChange={(h) => commit(h, minute)}
        ariaLabel="hour"
      />
      <div
        aria-hidden
        className="relative z-[6] flex w-5 shrink-0 items-center justify-center font-serif text-2xl font-bold text-woo-accent"
      >
        :
      </div>
      <WheelColumn
        items={MINUTES}
        value={minute}
        onChange={(m) => commit(hour, m)}
        ariaLabel="minute"
      />
    </WheelShell>
  );
}
