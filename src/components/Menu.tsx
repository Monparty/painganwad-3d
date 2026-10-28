"use client";

import { useEffect, useRef, useState } from "react";
import { CHANTS } from "@/lib/audio/chants";
import { getChantEngine } from "@/lib/audio/engine";
import { RECORDING } from "@/lib/audio/recording";
import { useChant } from "@/lib/audio/store";
import { langStore, useLang, UI, type Lang } from "@/lib/i18n";
import { loadStats, MEDITATE_MINUTES, SLEEP_MINUTES } from "@/lib/practice";
import { Icon, type IconName } from "./Icon";
import styles from "./Menu.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onSleep: (minutes: number) => void;
  onMeditate: (minutes: number, withChant: boolean) => void;
  onFortune: () => void;
  onEtiquette: () => void;
};

type Expand = "sleep" | "meditate" | null;

function Chips({
  values,
  value,
  label,
  onChange,
}: {
  values: number[];
  value: number;
  label: (n: number) => string;
  onChange: (n: number) => void;
}) {
  return (
    <div className={styles.chips} role="radiogroup">
      {values.map((v) => (
        <button
          key={v}
          role="radio"
          aria-checked={v === value}
          className={v === value ? styles.chipOn : styles.chip}
          onClick={() => onChange(v)}
        >
          {label(v)}
        </button>
      ))}
    </div>
  );
}

function Row({
  icon,
  title,
  desc,
  expanded,
  onClick,
}: {
  icon: IconName;
  title: string;
  desc: string;
  expanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button className={styles.row} onClick={onClick} aria-expanded={expanded}>
      <span className={styles.rowIcon}>
        <Icon name={icon} />
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowDesc}>{desc}</span>
      </span>
      <Icon name="chevron" className={expanded ? styles.chevronOpen : styles.chevron} />
    </button>
  );
}

function MeditationStats() {
  const t = UI[useLang()];
  const [stats] = useState(loadStats);
  return <p className={styles.stats}>{stats.sessions ? t.stats(stats) : t.noStats}</p>;
}

export function Menu({ open, onClose, onSleep, onMeditate, onFortune, onEtiquette }: Props) {
  const lang = useLang();
  const t = UI[lang];
  const chant = useChant();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expand, setExpand] = useState<Expand>(null);
  const [sleepMin, setSleepMin] = useState(30);
  const [meditateMin, setMeditateMin] = useState(10);
  const [withChant, setWithChant] = useState(false);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, onClose]);

  const toggle = (e: Exclude<Expand, null>) => setExpand((cur) => (cur === e ? null : e));
  const playing = chant.status === "chanting";

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOn : ""}`} onClick={onClose} aria-hidden />
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOn : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.menu}
        inert={!open}
      >
        <header className={styles.head}>
          <span className={styles.headTitle}>{t.menu}</span>
          <button ref={closeRef} className={styles.close} onClick={onClose} aria-label={t.close}>
            <Icon name="close" />
          </button>
        </header>

        <div className={styles.body}>
          <section>
            <h2 className={styles.heading}>{t.listen}</h2>
            <ul className={styles.chants}>
              {chant.recordingAvailable && (
                <li>
                  <button
                    className={chant.mode === "recording" ? styles.chantOn : styles.chant}
                    aria-current={chant.mode === "recording"}
                    onClick={() => getChantEngine().playRecording()}
                  >
                    <span className={styles.chantTitle}>{RECORDING.title[lang]}</span>
                    <span className={styles.chantSub}>{t.recordingLabel}</span>
                    {chant.mode === "recording" && playing && <span className={styles.eq} aria-hidden />}
                  </button>
                </li>
              )}
              {CHANTS.map((c, i) => {
                const on = chant.mode === "synth" && chant.section === i;
                return (
                  <li key={c.id}>
                    <button
                      className={on ? styles.chantOn : styles.chant}
                      aria-current={on}
                      onClick={() => getChantEngine().playSection(i)}
                    >
                      <span className={styles.chantTitle}>{c.title[lang]}</span>
                      <span className={styles.chantSub}>{lang === "th" ? c.title.en : c.title.th}</span>
                      {on && playing && <span className={styles.eq} aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h2 className={styles.heading}>{t.practice}</h2>
            <div className={styles.group}>
              <Row
                icon="moon"
                title={t.sleep}
                desc={t.sleepDesc}
                expanded={expand === "sleep"}
                onClick={() => toggle("sleep")}
              />
              {expand === "sleep" && (
                <div className={styles.options}>
                  <Chips values={SLEEP_MINUTES} value={sleepMin} label={t.minutes} onChange={setSleepMin} />
                  <button className={styles.start} onClick={() => onSleep(sleepMin)}>
                    {t.start}
                  </button>
                </div>
              )}
              <Row
                icon="lotus"
                title={t.meditate}
                desc={t.meditateDesc}
                expanded={expand === "meditate"}
                onClick={() => toggle("meditate")}
              />
              {expand === "meditate" && (
                <div className={styles.options}>
                  <Chips
                    values={MEDITATE_MINUTES}
                    value={meditateMin}
                    label={t.minutes}
                    onChange={setMeditateMin}
                  />
                  <div className={styles.segment} role="radiogroup">
                    {(
                      [
                        [false, t.silent],
                        [true, t.withChant],
                      ] as const
                    ).map(([v, label]) => (
                      <button
                        key={label}
                        role="radio"
                        aria-checked={withChant === v}
                        className={withChant === v ? styles.segOn : styles.seg}
                        onClick={() => setWithChant(v)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <MeditationStats />
                  <button className={styles.start} onClick={() => onMeditate(meditateMin, withChant)}>
                    {t.start}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className={styles.heading}>{t.temple}</h2>
            <div className={styles.group}>
              <Row icon="fortune" title={t.fortune} desc={t.fortuneDesc} onClick={onFortune} />
              <Row icon="etiquette" title={t.etiquette} desc={t.etiquetteDesc} onClick={onEtiquette} />
            </div>
          </section>

          <section>
            <h2 className={styles.heading}>
              <Icon name="globe" className={styles.headingIcon} />
              {t.language}
            </h2>
            <div className={styles.segment} role="radiogroup" aria-label={t.language}>
              {(
                [
                  ["th", "ไทย"],
                  ["en", "English"],
                ] as [Lang, string][]
              ).map(([l, label]) => (
                <button
                  key={l}
                  role="radio"
                  aria-checked={lang === l}
                  lang={l}
                  className={lang === l ? styles.segOn : styles.seg}
                  onClick={() => langStore.set(l)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
