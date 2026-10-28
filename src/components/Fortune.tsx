"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { getChantEngine } from "@/lib/audio/engine";
import { FORTUNES, type Fortune as FortuneData } from "@/lib/fortunes";
import { thaiNumber, useLang, UI, type Lang } from "@/lib/i18n";
import { Icon } from "./Icon";
import styles from "./Fortune.module.css";

gsap.registerPlugin(useGSAP);

type Stage = "ready" | "shaking" | "slip";

// ไม้เซียมซีในกระบอก: [ตำแหน่งซ้าย px, มุมเอียง deg, ยื่นสูงกว่าปกติ px]
const STICKS: [number, number, number][] = [
  [20, -10, 4],
  [28, -7, -6],
  [36, -4, 10],
  [44, -2, 0],
  [52, 1, 14],
  [60, 3, -4],
  [68, 5, 8],
  [76, 7, 2],
  [84, 10, -8],
  [32, -5, -14],
  [64, 4, -12],
  [48, 0, -18],
];
const SPARKS = 14;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** iOS ต้องขออนุญาตก่อนอ่านการเขย่าเครื่อง (ต้องเรียกจาก gesture ของผู้ใช้) */
function askMotionPermission() {
  const motion = window.DeviceMotionEvent as unknown as
    | { requestPermission?: () => Promise<string> }
    | undefined;
  motion?.requestPermission?.().catch(() => {});
}

function Slip({
  number,
  fortune,
  lang,
  onAgain,
  onClose,
}: {
  number: number;
  fortune: FortuneData;
  lang: Lang;
  onAgain: () => void;
  onClose: () => void;
}) {
  const t = UI[lang];
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".js-slip", {
        y: 60,
        rotationX: 65,
        opacity: 0,
        transformPerspective: 900,
        transformOrigin: "50% 0%",
        duration: 0.8,
        ease: "power3.out",
      })
        .fromTo(
          ".js-paper",
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power2.inOut" },
          "-=0.35",
        )
        .from(".js-sheen", { xPercent: -120, duration: 1.4, ease: "power1.inOut" }, "<0.3")
        .from(".js-line", { y: 14, opacity: 0, duration: 0.5, stagger: 0.07 }, "<0.25")
        .from(
          ".js-seal",
          { scale: 2.6, rotation: -40, opacity: 0, duration: 0.45, ease: "back.out(2.4)" },
          "-=0.2",
        )
        .call(() => getChantEngine().clack(undefined, 1, 520))
        .fromTo(
          ".js-spark",
          { x: 0, y: 0, scale: 1, opacity: 1 },
          {
            x: () => gsap.utils.random(-90, 90),
            y: () => gsap.utils.random(-80, 70),
            scale: 0,
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
          },
          "<",
        )
        .from(".js-actions", { y: 12, opacity: 0, duration: 0.4 }, "-=0.4");
      if (reducedMotion()) tl.progress(1);
    },
    { scope: root },
  );

  const topics = ["work", "money", "love", "health"] as const;

  return (
    <div ref={root} className={styles.slipWrap}>
      <article className={`${styles.slip} js-slip`} aria-live="polite">
        <div className={`${styles.paper} js-paper`}>
          <span className={`${styles.sheen} js-sheen`} aria-hidden />
          <header className={`${styles.slipHead} js-line`}>
            <span className={styles.slipLabel}>{lang === "th" ? "ใบเซียมซี" : t.fortuneTitle}</span>
            <span className={styles.slipNo}>{thaiNumber(number)}</span>
            {lang === "en" && <span className={styles.slipLabel}>{t.slipNumber(number)}</span>}
          </header>
          <div className={`${styles.seal} ${styles[fortune.level]} js-seal`}>
            {t.levels[fortune.level]}
            {Array.from({ length: SPARKS }, (_, i) => (
              <span key={i} className={`${styles.spark} js-spark`} aria-hidden />
            ))}
          </div>
          <p className={`${styles.verse} js-line`}>
            {fortune.verse[lang].split("\n").map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </p>
          <dl className={styles.topics}>
            {topics.map((k) => (
              <div key={k} className="js-line">
                <dt>{t.topics[k]}</dt>
                <dd>{fortune[k][lang]}</dd>
              </div>
            ))}
          </dl>
          <p className={`${styles.advice} js-line`}>
            <span>{t.reflection}</span>
            {fortune.advice[lang]}
          </p>
          <p className={`${styles.note} js-line`}>{t.fortuneNote}</p>
        </div>
      </article>
      <div className={`${styles.actions} js-actions`}>
        <button className={styles.primary} onClick={onAgain}>
          {t.again}
        </button>
        <button className={styles.secondary} onClick={onClose}>
          {t.close}
        </button>
      </div>
    </div>
  );
}

export function Fortune({ onClose }: { onClose: () => void }) {
  const lang = useLang();
  const t = UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [stage, setStage] = useState<Stage>("ready");
  const [pick, setPick] = useState(0);
  const [round, setRound] = useState(0);

  // กระบอกลอยขึ้นมาทุกครั้งที่เริ่มรอบใหม่
  const { contextSafe } = useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(".js-shaker", { y: 50, opacity: 0, duration: 0.9, ease: "power3.out" });
      gsap.from(".js-sticks > span", {
        y: 40,
        duration: 0.7,
        stagger: 0.035,
        ease: "back.out(2)",
        delay: 0.25,
      });
    },
    { scope: root, dependencies: [round] },
  );

  const animateShake = contextSafe(() => {
    const engine = getChantEngine();
    engine.rattle(2.4);

    const tl = gsap.timeline({ onComplete: () => setStage("slip") });
    // เขย่าไปมา ไม้ในกระบอกกระเด้งขึ้นลง ไม้ที่ถูกเลือกค่อยๆ เลื่อนขึ้น
    tl.to(".js-shaker", { rotation: -9, duration: 0.08, ease: "sine.out" })
      .to(".js-shaker", { rotation: 9, duration: 0.13, ease: "sine.inOut", yoyo: true, repeat: 15 })
      .to(
        ".js-jiggle",
        {
          y: () => gsap.utils.random(-16, 2),
          duration: 0.07,
          repeat: 31,
          yoyo: true,
          repeatRefresh: true,
          ease: "none",
        },
        0,
      )
      .to(".js-stick", { y: -34, duration: 1.4, ease: "power1.in" }, 0.5)
      // เอียงกระบอกไปข้างหน้า ไม้หลุดออกมาหนึ่งอัน
      .to(".js-shaker", { rotation: -24, y: -8, duration: 0.3, ease: "power2.out" })
      .set(".js-stick", { opacity: 0 })
      .set(".js-fallen", { x: 51, y: 40, rotation: -24, opacity: 1 })
      .to(".js-fallen", { x: 30, y: -14, rotation: -52, duration: 0.3, ease: "power2.out" })
      .to(".js-fallen", { x: 76, y: 255, rotation: -86, duration: 0.6, ease: "bounce.out" })
      .call(() => engine.clack(undefined, 1.3, 1150), [], "<0.22")
      .to(".js-shaker", { rotation: 0, y: 0, duration: 0.6, ease: "power2.inOut" }, "<")
      .fromTo(
        ".js-number",
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.2)" },
        "-=0.1",
      )
      .to(".js-stage", { opacity: 0, y: 20, duration: 0.45, ease: "power2.in" }, "+=0.8");
    if (reducedMotion()) tl.timeScale(4);
  });

  const shake = () => {
    if (stage !== "ready") return;
    setPick(Math.floor(Math.random() * FORTUNES.length));
    setStage("shaking");
    animateShake();
  };

  const onMotion = useEffectEvent(() => shake());
  useEffect(() => {
    let last = 0;
    const motion = (e: DeviceMotionEvent) => {
      const a = e.acceleration?.x != null ? e.acceleration : e.accelerationIncludingGravity;
      if (!a) return;
      const force = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      const threshold = a === e.acceleration ? 14 : 24;
      if (force > threshold && performance.now() - last > 1200) {
        last = performance.now();
        onMotion();
      }
    };
    window.addEventListener("devicemotion", motion);
    return () => window.removeEventListener("devicemotion", motion);
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const again = () => {
    setStage("ready");
    setRound((r) => r + 1);
  };

  return (
    <div ref={root} className={styles.overlay} role="dialog" aria-modal="true" aria-label={t.fortune}>
      <header className={styles.top}>
        <h2 className={styles.title}>{t.fortuneTitle}</h2>
        <button ref={closeRef} className={styles.close} onClick={onClose} aria-label={t.close}>
          <Icon name="close" />
        </button>
      </header>

      {stage === "slip" ? (
        <Slip number={pick + 1} fortune={FORTUNES[pick]} lang={lang} onAgain={again} onClose={onClose} />
      ) : (
        <div key={round} className={`${styles.ready} js-stage`}>
          <p className={styles.intro}>{t.fortuneIntro}</p>
          <div className={styles.stage}>
            <div className={`${styles.shaker} js-shaker`}>
              <div className={styles.mouth} />
              <div className={`${styles.sticks} js-sticks`}>
                {STICKS.map(([left, angle, rise], i) => (
                  <span
                    key={i}
                    className={`${styles.stickWrap} js-jiggle`}
                    style={{ left, bottom: rise, rotate: `${angle}deg` }}
                  >
                    <span className={styles.stick} />
                  </span>
                ))}
                <span className={`${styles.chosen} js-stick`}>
                  <span className={styles.stick} />
                </span>
              </div>
              <div className={styles.body}>
                <span className={styles.bodyText}>เซียมซี</span>
              </div>
            </div>
            <span className={`${styles.fallen} js-fallen`} aria-hidden>
              <span className={styles.stick} />
            </span>
            <span className={`${styles.number} js-number`}>
              {stage === "shaking" ? thaiNumber(pick + 1) : ""}
            </span>
          </div>
          <button
            className={styles.shake}
            onClick={() => {
              askMotionPermission();
              shake();
            }}
            disabled={stage !== "ready"}
          >
            {stage === "ready" ? t.shake : t.shaking}
          </button>
          <p className={styles.hint}>{t.shakeHint}</p>
        </div>
      )}
    </div>
  );
}
