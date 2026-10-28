"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { CHANTS, paliWords } from "@/lib/audio/chants";
import { getChantEngine } from "@/lib/audio/engine";
import { chantStore, useChant, type ChantSnapshot } from "@/lib/audio/store";
import { RECORDING } from "@/lib/audio/recording";
import { BOW_COUNT, BOW_TIME, requestBow } from "@/lib/bow";
import { requestGaze } from "@/lib/gaze";
import { langStore, useLang, useT, UI, type Lang } from "@/lib/i18n";
import { sleepFadeSeconds, type Practice } from "@/lib/practice";
import { Etiquette } from "./Etiquette";
import { Fortune } from "./Fortune";
import { Icon } from "./Icon";
import { Menu } from "./Menu";
import { MeditationOverlay, SleepOverlay } from "./Practice";
import styles from "./TempleExperience.module.css";

function Loading() {
  return <div className={styles.loading}>{useT().loading}</div>;
}

const TempleScene = dynamic(() => import("./TempleScene"), {
  ssr: false,
  loading: () => <Loading />,
});

/** มองพานดอกไม้ธูปเทียนตรงหน้า (ซ้ายมือเล็กน้อย) */
const OFFERING_GAZE = { yaw: 0.36, pitch: -0.85 };

type Panel = "fortune" | "etiquette" | null;

function Ornament({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-50 -50 100 100" aria-hidden>
      {[0, 90, 180, 270].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <path d="M0 -6 C 18 -14 10 -32 0 -44 C -10 -32 -18 -14 0 -6Z" />
          <path transform="rotate(45)" d="M0 -8 Q 7 -18 0 -26 Q -7 -18 0 -8Z" />
        </g>
      ))}
      <circle r="10" />
      <circle r="4.5" className={styles.ornamentHole} />
    </svg>
  );
}

function LangSwitch({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <div className={`${styles.modeSwitch} ${className ?? ""}`} role="group" aria-label={UI[lang].language}>
      {(
        [
          ["th", "ไทย"],
          ["en", "EN"],
        ] as [Lang, string][]
      ).map(([l, label]) => (
        <button
          key={l}
          lang={l}
          className={lang === l ? styles.modeOn : styles.modeOff}
          aria-pressed={lang === l}
          onClick={() => langStore.set(l)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Credit({ lang }: { lang: Lang }) {
  return (
    <p className={styles.credit}>
      {UI[lang].audio}:{" "}
      <a href={RECORDING.sourceUrl} target="_blank" rel="noopener noreferrer">
        {RECORDING.title[lang]}
      </a>{" "}
      {RECORDING.place[lang]} · {RECORDING.credit[lang]} ·{" "}
      <a href={RECORDING.licenseUrl} target="_blank" rel="noopener noreferrer">
        {RECORDING.license}
      </a>{" "}
      · {RECORDING.changes[lang]}
    </p>
  );
}

function Subtitles({ chant, lang, hidden }: { chant: ChantSnapshot; lang: Lang; hidden: boolean }) {
  const t = UI[lang];
  const cls = `${styles.subtitles} ${hidden ? styles.away : ""}`;
  if (chant.mode === "recording") {
    return (
      <div className={cls}>
        <p className={styles.sectionTitle}>{RECORDING.title[lang]}</p>
        <p className={styles.recordingTitle}>
          {t.recordingLabel} · {RECORDING.place[lang]}
        </p>
        <p className={styles.meaning}>{RECORDING.meaning[lang]}</p>
        <Credit lang={lang} />
      </div>
    );
  }
  const section = CHANTS[chant.section];
  const line = section.lines[chant.line];
  const words = lang === "th" ? line.thai.split(" ") : paliWords(line);
  const next = section.lines[chant.line + 1];
  return (
    <div className={cls} aria-live="polite">
      <p className={styles.sectionTitle}>{section.title[lang]}</p>
      <p className={styles.line} key={`${chant.section}:${chant.line}`}>
        {words.map((w, i) => (
          <span
            key={i}
            className={
              i < chant.word ? styles.wordDone : i === chant.word ? styles.wordNow : styles.wordTodo
            }
          >
            {w}
          </span>
        ))}
      </p>
      <p className={styles.nextLine}>
        {next ? (lang === "th" ? next.thai : paliWords(next).join(" ")) : " "}
      </p>
      <p className={styles.meaning}>{section.meaning[lang]}</p>
    </div>
  );
}

export default function TempleExperience() {
  const [entered, setEntered] = useState(false);
  const [looked, setLooked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bowing, setBowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [practice, setPractice] = useState<Practice | null>(null);
  const [asleep, setAsleep] = useState(false);
  const chant = useChant();
  const lang = useLang();
  const t = UI[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const enter = () => {
    getChantEngine().start();
    setEntered(true);
  };

  const bow = () => {
    requestBow();
    setBowing(true);
  };

  useEffect(() => {
    if (!bowing) return;
    const id = setTimeout(() => setBowing(false), BOW_TIME * BOW_COUNT * 1000);
    return () => clearTimeout(id);
  }, [bowing]);

  const toggleMute = () => {
    getChantEngine().setVolume(muted ? 1 : 0);
    setMuted(!muted);
  };

  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  const onLook = useCallback(() => setLooked(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closePanel = useCallback(() => setPanel(null), []);

  const startSleep = (minutes: number) => {
    const engine = getChantEngine();
    const total = minutes * 60;
    const fade = sleepFadeSeconds(minutes);
    engine.resume();
    engine.fadeTo(0, fade, total - fade);
    setMenuOpen(false);
    setPractice({ kind: "sleep", minutes, startedAt: Date.now() });
  };

  const startMeditation = (minutes: number, withChant: boolean) => {
    const engine = getChantEngine();
    const resumeAfter = !withChant && chantStore.get().status === "chanting";
    if (withChant) engine.resume();
    else engine.pause();
    engine.chime(1);
    setMenuOpen(false);
    setPractice({ kind: "meditate", minutes, startedAt: Date.now(), withChant, resumeAfter });
  };

  const endPractice = () => {
    const engine = getChantEngine();
    if (practice?.kind === "sleep") engine.fadeTo(1, 1.5);
    if (practice?.kind === "meditate" && practice.resumeAfter) engine.resume();
    setAsleep(false);
    setPractice(null);
  };

  const openPanel = (p: Exclude<Panel, null>) => {
    setMenuOpen(false);
    setPanel(p);
  };

  const away = practice !== null;

  return (
    <main className={styles.root}>
      <div className={styles.canvas}>
        <TempleScene active={entered && !away} asleep={asleep} onLook={onLook} />
      </div>

      <div className={`${styles.intro} ${entered ? styles.introGone : ""}`} aria-hidden={entered}>
        <LangSwitch lang={lang} className={styles.introLang} />
        <Ornament className={styles.ornament} />
        <h1 className={styles.title}>{t.title}</h1>
        {t.subtitle && <p className={styles.subtitle}>{t.subtitle}</p>}
        <p className={styles.tagline}>{t.tagline}</p>
        <button className={styles.enter} onClick={enter} disabled={entered}>
          {t.enter}
        </button>
        <p className={styles.note}>{t.note}</p>
      </div>

      {entered && (
        <>
          <header className={`${styles.top} ${away ? styles.away : ""}`} inert={away}>
            <div className={styles.brand}>
              <button
                className={styles.iconButton}
                onClick={() => setMenuOpen(true)}
                aria-label={t.menu}
                aria-expanded={menuOpen}
                title={t.menu}
              >
                <Icon name="menu" />
              </button>
              <Ornament className={styles.brandMark} />
              <span>{t.brand}</span>
            </div>
            <nav className={styles.actions}>
              {chant.recordingAvailable && (
                <div className={styles.modeSwitch} role="group" aria-label={t.chantSource}>
                  {(
                    [
                      ["recording", t.modeRecording],
                      ["synth", t.modeSynth],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      className={chant.mode === mode ? styles.modeOn : styles.modeOff}
                      aria-pressed={chant.mode === mode}
                      onClick={() => getChantEngine().setMode(mode)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <button className={styles.bow} onClick={bow} disabled={bowing}>
                {bowing ? t.bowing : t.bow}
              </button>
              <button
                className={styles.iconButton}
                onClick={() => getChantEngine().toggle()}
                aria-label={chant.status === "chanting" ? t.pause : t.resume}
                title={chant.status === "chanting" ? t.pause : t.resume}
              >
                <Icon name={chant.status === "chanting" ? "pause" : "play"} />
              </button>
              <button
                className={styles.iconButton}
                onClick={toggleMute}
                aria-label={muted ? t.unmute : t.mute}
                title={muted ? t.unmute : t.mute}
              >
                <Icon name={muted ? "mute" : "sound"} />
              </button>
              <button className={styles.iconButton} onClick={fullscreen} aria-label={t.fullscreen} title={t.fullscreen}>
                <Icon name="expand" />
              </button>
            </nav>
          </header>

          <Subtitles chant={chant} lang={lang} hidden={away} />

          <p className={`${styles.hint} ${looked || away ? styles.hintGone : ""}`}>{t.hint}</p>

          {practice?.kind === "sleep" && (
            <SleepOverlay practice={practice} onAsleep={() => setAsleep(true)} onExit={endPractice} />
          )}
          {practice?.kind === "meditate" && <MeditationOverlay practice={practice} onExit={endPractice} />}

          <Menu
            open={menuOpen}
            onClose={closeMenu}
            onSleep={startSleep}
            onMeditate={startMeditation}
            onFortune={() => openPanel("fortune")}
            onEtiquette={() => openPanel("etiquette")}
          />

          {panel === "fortune" && <Fortune onClose={closePanel} />}
          {panel === "etiquette" && (
            <Etiquette
              onClose={closePanel}
              onBow={() => {
                setPanel(null);
                bow();
              }}
              onLookOffering={() => {
                setPanel(null);
                requestGaze(OFFERING_GAZE.yaw, OFFERING_GAZE.pitch);
              }}
            />
          )}
        </>
      )}
    </main>
  );
}
