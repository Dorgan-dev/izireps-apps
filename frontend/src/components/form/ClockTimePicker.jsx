import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Label from "./Label";

function timeToMinutes(time) {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// --- Konstanta SVG ---
const RADIUS = 88;
const INNER_RADIUS = 58; // ring dalam untuk jam 13-00
const CENTER = 110;
const SVG_SIZE = 220;

export default function ClockTimePicker({
  id,
  label,
  value,
  onChange,
  minTime,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selecting, setSelecting] = useState("hour");

  const [hour, setHour] = useState(() => {
    const [h] = (value || "00:00").split(":").map(Number);
    return isNaN(h) ? 0 : h;
  });
  const [minute, setMinute] = useState(() => {
    const [, m] = (value || "00:00").split(":").map(Number);
    return isNaN(m) ? 0 : m;
  });

  const triggerRef = useRef(null);

  // Sync dari prop value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      if (!isNaN(h)) setHour(h);
      if (!isNaN(m)) setMinute(m);
    }
  }, [value]);

  const isTimeAllowed = useCallback(
    (h, m) => {
      if (!minTime) return true;
      return timeToMinutes(toTimeString(h, m)) >= timeToMinutes(minTime);
    },
    [minTime],
  );

  // --- Klik pada SVG jam ---
  const handleClockClick = useCallback(
    (e) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const x = e.clientX - rect.left - cx;
      const y = e.clientY - rect.top - cy;
      const dist = Math.sqrt(x * x + y * y);
      const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      const normAngle = ((angle % 360) + 360) % 360;

      if (selecting === "hour") {
        const midR = (RADIUS + INNER_RADIUS) / 2;
        const useInner = dist < midR;

        const idx = Math.round(normAngle / 30) % 12; // 0..11
        let newHour;
        if (useInner) {
          newHour = idx === 0 ? 0 : idx + 12;
        } else {
          newHour = idx === 0 ? 12 : idx;
        }

        if (isTimeAllowed(newHour, minute)) {
          setHour(newHour);
          onChange(toTimeString(newHour, minute));
        }
        setSelecting("minute");
      } else {
        const m = Math.round(normAngle / 6) % 60;
        if (isTimeAllowed(hour, m)) {
          setMinute(m);
          onChange(toTimeString(hour, m));
        }
      }
    },
    [selecting, hour, minute, isTimeAllowed, onChange],
  );

  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;
  const minuteAngle = (minute / 60) * 360;
  const handX = (r, a) => CENTER + r * Math.sin((a * Math.PI) / 180);
  const handY = (r, a) => CENTER - r * Math.cos((a * Math.PI) / 180);

  const outerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const innerHours = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  const displayHour = String(hour).padStart(2, "0");
  const displayMinute = String(minute).padStart(2, "0");

  const clockModal = isOpen
    ? createPortal(
        <>
          {/* Backdrop - Z-Index dinaikkan ke z-[100000] */}
          <div
            className="fixed inset-0 z-[100000] bg-black/40 backdrop-blur-[2px]"
            onClick={() => {
              setIsOpen(false);
              setSelecting("hour");
            }}
          />

          {/* Clock Panel — Z-Index dinaikkan ke z-[100001] */}
          <div
            className="fixed z-[100001] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    w-72 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl
                    border border-gray-200 dark:border-gray-700 p-5
                    flex flex-col items-center gap-3 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header digital */}
            <div className="flex items-center gap-1 select-none">
              <button
                type="button"
                onClick={() => setSelecting("hour")}
                className={`text-3xl font-bold font-mono rounded-xl px-3 py-1.5 transition-all
                            ${
                              selecting === "hour"
                                ? "bg-brand-500 text-white shadow-md"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
              >
                {displayHour}
              </button>
              <span className="text-3xl font-bold text-gray-400 animate-pulse">
                :
              </span>
              <button
                type="button"
                onClick={() => setSelecting("minute")}
                className={`text-3xl font-bold font-mono rounded-xl px-3 py-1.5 transition-all
                            ${
                              selecting === "minute"
                                ? "bg-brand-500 text-white shadow-md"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
              >
                {displayMinute}
              </button>
              <span className="ml-1 text-xs font-semibold text-gray-400 dark:text-gray-500">
                WIB
              </span>
            </div>

            {/* Mode label */}
            <p className="text-xs font-medium text-brand-500 dark:text-brand-400">
              {selecting === "hour" ? "⬅ Pilih Jam (0–23)" : "⬅ Pilih Menit"}
            </p>

            {/* Analog Clock SVG */}
            <svg
              width={SVG_SIZE}
              height={SVG_SIZE}
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              className="cursor-crosshair touch-none"
              onClick={handleClockClick}
            >
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS + 6}
                fill="currentColor"
                className="text-gray-100 dark:text-gray-800"
              />

              {selecting === "hour" && (
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={INNER_RADIUS + 6}
                  fill="currentColor"
                  className="text-gray-200 dark:text-gray-700"
                />
              )}

              {Array.from({ length: 60 }, (_, i) => {
                const a = (i / 60) * 360;
                const isMajor = i % 5 === 0;
                const r1 = RADIUS + 5;
                const r2 = isMajor ? RADIUS - 4 : RADIUS;
                return (
                  <line
                    key={i}
                    x1={handX(r1, a)}
                    y1={handY(r1, a)}
                    x2={handX(r2, a)}
                    y2={handY(r2, a)}
                    stroke={isMajor ? "#94a3b8" : "#e2e8f0"}
                    strokeWidth={isMajor ? 2 : 1}
                  />
                );
              })}

              {selecting === "hour" && (
                <>
                  {outerHours.map((h, i) => {
                    const a = (i / 12) * 360;
                    const r = RADIUS - 16;
                    const nx = CENTER + r * Math.sin((a * Math.PI) / 180);
                    const ny = CENTER - r * Math.cos((a * Math.PI) / 180);
                    const isSelected = hour === h;
                    const blocked = minTime && !isTimeAllowed(h, minute);
                    return (
                      <text
                        key={h}
                        x={nx}
                        y={ny}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={isSelected ? 14 : 12}
                        fontWeight={isSelected ? "bold" : "normal"}
                        fill={
                          blocked
                            ? "#cbd5e1"
                            : isSelected
                              ? "#465fff"
                              : "#475467"
                        }
                      >
                        {String(h).padStart(2, "0")}
                      </text>
                    );
                  })}

                  {innerHours.map((h, i) => {
                    const a = (i / 12) * 360;
                    const r = INNER_RADIUS - 14;
                    const nx = CENTER + r * Math.sin((a * Math.PI) / 180);
                    const ny = CENTER - r * Math.cos((a * Math.PI) / 180);
                    const isSelected = hour === h;
                    const blocked = minTime && !isTimeAllowed(h, minute);
                    return (
                      <text
                        key={h}
                        x={nx}
                        y={ny}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={isSelected ? 12 : 10}
                        fontWeight={isSelected ? "bold" : "normal"}
                        fill={
                          blocked
                            ? "#cbd5e1"
                            : isSelected
                              ? "#465fff"
                              : "#94a3b8"
                        }
                      >
                        {String(h).padStart(2, "0")}
                      </text>
                    );
                  })}
                </>
              )}

              {selecting === "minute" &&
                [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m, i) => {
                  const a = (i / 12) * 360;
                  const r = RADIUS - 16;
                  const nx = CENTER + r * Math.sin((a * Math.PI) / 180);
                  const ny = CENTER - r * Math.cos((a * Math.PI) / 180);
                  const isSelected =
                    minute === m || (minute >= m && minute < m + 5 && i !== 0);
                  const exactSelected = minute === m;
                  return (
                    <text
                      key={m}
                      x={nx}
                      y={ny}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={exactSelected ? 14 : 12}
                      fontWeight={exactSelected ? "bold" : "normal"}
                      fill={
                        exactSelected
                          ? "#465fff"
                          : isSelected
                            ? "#7a8fff"
                            : "#475467"
                      }
                    >
                      {String(m).padStart(2, "0")}
                    </text>
                  );
                })}

              <line
                x1={CENTER}
                y1={CENTER}
                x2={handX(
                  hour < 12 ? RADIUS - 26 : INNER_RADIUS - 24,
                  hourAngle,
                )}
                y2={handY(
                  hour < 12 ? RADIUS - 26 : INNER_RADIUS - 24,
                  hourAngle,
                )}
                stroke="#465fff"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={selecting === "minute" ? 0.35 : 1}
              />

              <line
                x1={CENTER}
                y1={CENTER}
                x2={handX(RADIUS - 16, minuteAngle)}
                y2={handY(RADIUS - 16, minuteAngle)}
                stroke="#10b981"
                strokeWidth={3}
                strokeLinecap="round"
                opacity={selecting === "hour" ? 0.35 : 1}
              />

              <circle cx={CENTER} cy={CENTER} r={5} fill="#465fff" />
            </svg>

            {/* Tombol aksi */}
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelecting((s) => (s === "hour" ? "minute" : "hour"))
                }
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700
                            py-2 text-xs font-medium text-gray-600 dark:text-gray-300
                            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {selecting === "hour" ? "Pilih Menit →" : "← Pilih Jam"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelecting("hour");
                }}
                className="flex-1 rounded-xl bg-brand-500 py-2 text-xs font-semibold
                            text-white hover:bg-brand-600 transition-colors shadow-sm"
              >
                Selesai ✓
              </button>
            </div>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <div className="relative w-full">
      {label && <Label htmlFor={id}>{label}</Label>}

      {/* Input trigger */}
      <div
        ref={triggerRef}
        className={`relative h-11 flex items-center rounded-lg border bg-transparent
                    px-4 py-2.5 text-sm shadow-theme-xs select-none
                    ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:border-brand-400 active:border-brand-500"
                    }
                    border-gray-300 text-gray-800
                    dark:bg-gray-900 dark:text-white/90 dark:border-gray-700`}
        onClick={() => !disabled && setIsOpen((v) => !v)}
      >
        <span className="flex-1 font-mono text-sm">{value || "--:--"}</span>
        <span
          className={`transition-colors ${isOpen ? "text-brand-500" : "text-gray-400 dark:text-gray-500"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </span>
      </div>

      {clockModal}
    </div>
  );
}
