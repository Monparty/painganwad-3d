"use client";

import { useEffect, useRef } from "react";
import { MANNERS } from "@/lib/etiquette";
import { thaiNumber, useLang, UI } from "@/lib/i18n";
import { Icon } from "./Icon";
import styles from "./Etiquette.module.css";

export function Etiquette({
  onClose,
  onBow,
  onLookOffering,
}: {
  onClose: () => void;
  onBow: () => void;
  onLookOffering: () => void;
}) {
  const lang = useLang();
  const t = UI[lang];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="etiquette-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.head}>
          <div>
            <h2 id="etiquette-title" className={styles.title}>
              {t.etiquette}
            </h2>
            <p className={styles.intro}>{t.etiquetteIntro}</p>
          </div>
          <button ref={closeRef} className={styles.close} onClick={onClose} aria-label={t.close}>
            <Icon name="close" />
          </button>
        </header>

        <ol className={styles.list}>
          {MANNERS.map((m, i) => (
            <li key={i} className={styles.card} style={{ animationDelay: `${0.05 * i}s` }}>
              <span className={styles.num} aria-hidden>
                {lang === "th" ? thaiNumber(i + 1) : i + 1}
              </span>
              <div className={styles.text}>
                <h3 className={styles.cardTitle}>{m.title[lang]}</h3>
                <p className={styles.body}>{m.body[lang]}</p>
                {(m.term || m.action) && (
                  <div className={styles.foot}>
                    {m.term && (
                      <span className={styles.term} lang="th">
                        {m.term.thai}
                        <span lang="en">{m.term.roman}</span>
                      </span>
                    )}
                    {m.action && (
                      <button
                        className={styles.try}
                        onClick={m.action === "bow" ? onBow : onLookOffering}
                      >
                        {m.action === "bow" ? t.tryBow : t.tryLook}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
