"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { getChantEngine } from "@/lib/audio/engine";
import { useT } from "@/lib/i18n";
import { clock, recordMeditation, type Practice } from "@/lib/practice";
import { Icon } from "./Icon";
import styles from "./Practice.module.css";

/** นาฬิกาที่เดินทุกวินาทีจนถึง endsAt แล้วเรียก onEnd ครั้งเดียว */
function useCountdown(startedAt: number, endsAt: number, onEnd: () => void) {
  const [now, setNow] = useState(startedAt);
  const end = useEffectEvent(onEnd);
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const timer = setTimeout(() => end(), endsAt - Date.now());
    return () => {
      clearInterval(tick);
      clearTimeout(timer);
    };
  }, [endsAt]);
  return endsAt - now;
}

type SleepPractice = Extract<Practice, { kind: "sleep" }>;
type MeditatePractice = Extract<Practice, { kind: "meditate" }>;

/** จอค่อยๆ มืดลงตลอดช่วงเวลา ครบแล้วหยุดสวด จอดำ แล้วหยุดวาดฉาก */
export function SleepOverlay({
  practice,
  onAsleep,
  onExit,
}: {
  practice: SleepPractice;
  onAsleep: () => void;
  onExit: () => void;
}) {
  const t = useT();
  const total = practice.minutes * 60_000;
  const [done, setDone] = useState(false);
  const left = useCountdown(practice.startedAt, practice.startedAt + total, () => {
    getChantEngine().pause();
    setDone(true);
    // รอให้จอดำสนิทก่อนหยุดวาดฉาก
    setTimeout(onAsleep, 4000);
  });

  return (
    <>
      <div
        className={`${styles.shade} ${done ? styles.shadeDone : ""}`}
        style={{ animationDuration: `${total}ms` }}
        aria-hidden
      />
      {done ? (
        <div className={styles.goodnight} role="status">
          <Icon name="moon" className={styles.moon} />
          <p className={styles.goodnightTitle}>{t.goodnight}</p>
          <p className={styles.goodnightSub}>{t.goodnightSub}</p>
          <button className={styles.quiet} onClick={onExit}>
            {t.backToHall}
          </button>
        </div>
      ) : (
        <div className={styles.pill} role="timer" aria-live="off">
          <Icon name="moon" />
          <span>{t.sleepPill}</span>
          <span className={styles.time}>{clock(left)}</span>
          <button className={styles.pillStop} onClick={onExit}>
            {t.stop}
          </button>
        </div>
      )}
    </>
  );
}

const RING = 2 * Math.PI * 118;

/** นั่งสมาธิ: วงหายใจ พุท–โธ วงนับเวลา และระฆังเมื่อครบ */
export function MeditationOverlay({
  practice,
  onExit,
}: {
  practice: MeditatePractice;
  onExit: () => void;
}) {
  const t = useT();
  const total = practice.minutes * 60_000;
  const [stats, setStats] = useState<ReturnType<typeof recordMeditation> | null>(null);
  const left = useCountdown(practice.startedAt, practice.startedAt + total, () => {
    getChantEngine().chime(3);
    setStats(recordMeditation(practice.minutes));
  });
  const progress = Math.min(1, 1 - left / total);

  return (
    <div className={styles.meditation}>
      <div className={`${styles.dial} ${stats ? styles.dialDone : ""}`}>
        <svg viewBox="0 0 260 260" className={styles.ring} aria-hidden>
          <circle cx="130" cy="130" r="118" className={styles.ringTrack} />
          <circle
            cx="130"
            cy="130"
            r="118"
            className={styles.ringFill}
            style={{ strokeDasharray: RING, strokeDashoffset: RING * (1 - progress) }}
          />
        </svg>
        {stats ? (
          <div className={styles.doneText} role="status">
            <Icon name="lotus" className={styles.doneIcon} />
            <p className={styles.doneTitle}>{t.meditationDone(practice.minutes)}</p>
            <p className={styles.doneSub}>{t.sadhu}</p>
          </div>
        ) : (
          <>
            <div className={styles.breath} aria-hidden />
            <div className={styles.words} aria-hidden>
              <span className={styles.inWord}>
                {t.breatheIn}
                <small>{t.breatheInHint}</small>
              </span>
              <span className={styles.outWord}>
                {t.breatheOut}
                <small>{t.breatheOutHint}</small>
              </span>
            </div>
          </>
        )}
      </div>
      {stats ? (
        <>
          <p className={styles.stats}>{t.stats(stats)}</p>
          <button className={styles.quiet} onClick={onExit}>
            {t.back}
          </button>
        </>
      ) : (
        <>
          <p className={styles.remaining} role="timer">
            {clock(left)}
          </p>
          <button className={styles.quiet} onClick={onExit}>
            {t.end}
          </button>
        </>
      )}
    </div>
  );
}
