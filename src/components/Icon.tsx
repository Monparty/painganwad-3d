import styles from "./Icon.module.css";

const PATHS = {
  pause: <path d="M7 5h3v14H7zM14 5h3v14h-3z" />,
  play: <path d="M8 5v14l11-7z" />,
  sound: <path d="M4 9h4l5-4v14l-5-4H4zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />,
  mute: <path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6" />,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  moon: <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z" />,
  lotus: (
    <path d="M12 19c-4.5 0-7.5-2-8.5-5.5 3.5 0 6 1.5 8.5 5.5zm0 0c4.5 0 7.5-2 8.5-5.5-3.5 0-6 1.5-8.5 5.5zm0 0c-2.6-2.3-3.6-6-1.8-10.5.8.6 1.5 1.5 1.8 2.6.3-1.1 1-2 1.8-2.6 1.8 4.5.8 8.2-1.8 10.5z" />
  ),
  chant: <path d="M6 4h9a3 3 0 0 1 3 3v13H9a3 3 0 0 1-3-3zM6 17a3 3 0 0 1 3-3h9M10 8h4" />,
  fortune: <path d="M7.5 11h9l-1.2 9.5H8.7zM9.5 11l-1.5-7M12 11V3.5M14.5 11l1.5-6.5M7 14h10" />,
  etiquette: (
    <path d="M12 6.5C9.5 5 6.5 4.8 4 5.5v13c2.5-.7 5.5-.5 8 1 2.5-1.5 5.5-1.7 8-1v-13c-2.5-.7-5.5-.5-8 1zM12 6.5v13" />
  ),
  globe: (
    <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.5 9h17M3.5 15h17M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9" />
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${styles.icon} ${className ?? ""}`} aria-hidden>
      {PATHS[name]}
    </svg>
  );
}
