"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { CHANTS } from "@/lib/audio/chants";
import { getChantEngine } from "@/lib/audio/engine";
import { chantStore, type ChantSnapshot } from "@/lib/audio/store";
import { RECORDING } from "@/lib/audio/recording";
import { BOW_COUNT, BOW_TIME, requestBow } from "@/lib/bow";
import styles from "./TempleExperience.module.css";

const TempleScene = dynamic(() => import("./TempleScene"), {
  ssr: false,
  loading: () => <div className={styles.loading}>กำลังเปิดประตูโบสถ์…</div>,
});

function useChant(): ChantSnapshot {
  return useSyncExternalStore(chantStore.subscribe, chantStore.get, chantStore.get);
}

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

function Credit() {
  return (
    <p className={styles.credit}>
      เสียง: <a href={RECORDING.sourceUrl} target="_blank" rel="noopener noreferrer">{RECORDING.title}</a>{" "}
      {RECORDING.place} · {RECORDING.credit} ·{" "}
      <a href={RECORDING.licenseUrl} target="_blank" rel="noopener noreferrer">{RECORDING.license}</a> ·{" "}
      {RECORDING.changes}
    </p>
  );
}

function Subtitles({ chant }: { chant: ChantSnapshot }) {
  const section = CHANTS[chant.section];
  if (chant.mode === "recording") {
    return (
      <div className={styles.subtitles}>
        <p className={styles.sectionTitle}>{RECORDING.title}</p>
        <p className={styles.recordingTitle}>เสียงสวดจริง · {RECORDING.place}</p>
        <p className={styles.meaning}>{RECORDING.meaning}</p>
        <Credit />
      </div>
    );
  }
  const line = section.lines[chant.line];
  const words = line.thai.split(" ");
  const next = section.lines[chant.line + 1];
  return (
    <div className={styles.subtitles} aria-live="polite">
      <p className={styles.sectionTitle}>{section.title}</p>
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
      <p className={styles.nextLine}>{next ? next.thai : " "}</p>
      <p className={styles.meaning}>{section.meaning}</p>
    </div>
  );
}

function Icon({ name }: { name: "pause" | "play" | "sound" | "mute" | "expand" }) {
  const paths = {
    pause: <path d="M7 5h3v14H7zM14 5h3v14h-3z" />,
    play: <path d="M8 5v14l11-7z" />,
    sound: (
      <path d="M4 9h4l5-4v14l-5-4H4zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />
    ),
    mute: <path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6" />,
    expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  };
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden>
      {paths[name]}
    </svg>
  );
}

export default function TempleExperience() {
  const [entered, setEntered] = useState(false);
  const [looked, setLooked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bowing, setBowing] = useState(false);
  const chant = useChant();

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

  return (
    <main className={styles.root}>
      <div className={styles.canvas}>
        <TempleScene active={entered} onLook={onLook} />
      </div>

      <div className={`${styles.intro} ${entered ? styles.introGone : ""}`} aria-hidden={entered}>
        <Ornament className={styles.ornament} />
        <h1 className={styles.title}>ไปวัด</h1>
        <p className={styles.tagline}>ถอดรองเท้าไว้หน้าโบสถ์ แล้วนั่งพับเพียบฟังพระสวดมนต์</p>
        <button className={styles.enter} onClick={enter} disabled={entered}>
          เข้าพระอุโบสถ
        </button>
        <p className={styles.note}>ใส่หูฟังจะได้ยินเสียงสวดรอบทิศ · ลากเพื่อหันมองซ้ายขวา</p>
      </div>

      {entered && (
        <>
          <header className={styles.top}>
            <div className={styles.brand}>
              <Ornament className={styles.brandMark} />
              <span>พระอุโบสถ</span>
            </div>
            <nav className={styles.actions}>
              {chant.recordingAvailable && (
                <div className={styles.modeSwitch} role="group" aria-label="แหล่งเสียงสวด">
                  {(
                    [
                      ["recording", "เสียงจริง"],
                      ["synth", "บทสวด+คำอ่าน"],
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
                {bowing ? "กำลังกราบ…" : "กราบพระ"}
              </button>
              <button
                className={styles.iconButton}
                onClick={() => getChantEngine().toggle()}
                aria-label={chant.status === "chanting" ? "หยุดสวด" : "สวดต่อ"}
                title={chant.status === "chanting" ? "หยุดสวด" : "สวดต่อ"}
              >
                <Icon name={chant.status === "chanting" ? "pause" : "play"} />
              </button>
              <button
                className={styles.iconButton}
                onClick={toggleMute}
                aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}
                title={muted ? "เปิดเสียง" : "ปิดเสียง"}
              >
                <Icon name={muted ? "mute" : "sound"} />
              </button>
              <button className={styles.iconButton} onClick={fullscreen} aria-label="เต็มจอ" title="เต็มจอ">
                <Icon name="expand" />
              </button>
            </nav>
          </header>

          <Subtitles chant={chant} />

          <p className={`${styles.hint} ${looked ? styles.hintGone : ""}`}>
            ลากเพื่อหันมอง · ปุ่มลูกศร ← → · ล้อเมาส์เพื่อซูม
          </p>
        </>
      )}
    </main>
  );
}
