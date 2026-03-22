// Navbar icons

export type IconProps = {
  className?: string;
  title?: string;
};

function SvgTitle({ title }: { title?: string }) {
  if (!title) return null;
  return <title>{title}</title>;
}

export function HomeIcon({ className, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <SvgTitle title={title} />
      <path
        d="M2.25 12L11.2045 3.04545C11.6438 2.60611 12.3562 2.60611 12.7955 3.04545L21.75 12M4.5 9.74995V19.875C4.5 20.4963 5.00368 21 5.625 21H9.75V16.125C9.75 15.5036 10.2537 15 10.875 15H13.125C13.7463 15 14.25 15.5036 14.25 16.125V21H18.375C18.9963 21 19.5 20.4963 19.5 19.875V9.74995M8.25 21H16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SongsIcon({ className, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 18 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <SvgTitle title={title} />
      <path
        d="M6 7.5L16.5 4.5M16.5 11.0528V14.8028C16.5 15.8074 15.834 16.6903 14.8681 16.9663L13.5481 17.3434C12.3964 17.6724 11.25 16.8077 11.25 15.6099C11.25 14.805 11.7836 14.0975 12.5576 13.8764L14.8681 13.2163C15.834 12.9403 16.5 12.0574 16.5 11.0528ZM16.5 11.0528V0.75L6 3.75V14.0528M6 14.0528V17.8028C6 18.8074 5.33405 19.6903 4.36812 19.9663L3.04814 20.3434C1.89645 20.6724 0.75 19.8077 0.75 18.6099C0.75 17.805 1.2836 17.0975 2.05757 16.8764L4.36812 16.2163C5.33405 15.9403 6 15.0574 6 14.0528Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AddIcon({ className, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <SvgTitle title={title} />
      <path
        d="M8.25 0.75V15.75M15.75 8.25L0.75 8.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FavoritesIcon({ className, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <SvgTitle title={title} />
      <path
        d="M9.38808 1.09648C9.58023 0.634506 10.2347 0.634506 10.4268 1.09648L12.5528 6.20794C12.6338 6.4027 12.817 6.53577 13.0272 6.55262L18.5455 6.99502C19.0442 7.035 19.2464 7.65741 18.8664 7.98291L14.6621 11.5844C14.5019 11.7216 14.432 11.9369 14.4809 12.1421L15.7654 17.5269C15.8815 18.0136 15.352 18.3983 14.925 18.1375L10.2007 15.2519C10.0206 15.1419 9.79425 15.1419 9.61424 15.2519L4.88986 18.1375C4.46286 18.3983 3.93341 18.0136 4.0495 17.5269L5.33399 12.1421C5.38293 11.9369 5.31297 11.7216 5.15278 11.5844L0.948457 7.98292C0.568467 7.65741 0.7707 7.035 1.26944 6.99502L6.78769 6.55262C6.99795 6.53577 7.1811 6.4027 7.26211 6.20794L9.38808 1.09648Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SettingsIcon({ className, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 19 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <SvgTitle title={title} />
      <path
        d="M6.93703 1.69005C7.02744 1.14759 7.49678 0.75 8.04673 0.75H10.6407C11.1906 0.75 11.66 1.14759 11.7504 1.69005L11.9639 2.9711C12.0262 3.34514 12.2762 3.65671 12.608 3.84036C12.6821 3.88142 12.7555 3.92383 12.8279 3.96757C13.1529 4.16384 13.5483 4.22486 13.9038 4.09166L15.1207 3.63578C15.6357 3.44284 16.2147 3.65051 16.4897 4.12677L17.7866 6.37321C18.0616 6.84948 17.952 7.45473 17.5274 7.80426L16.523 8.63108C16.2305 8.87188 16.0855 9.24372 16.0925 9.62253C16.0933 9.66492 16.0937 9.70742 16.0937 9.75C16.0937 9.79258 16.0933 9.83507 16.0925 9.87746C16.0855 10.2563 16.2305 10.6281 16.523 10.8689L17.5274 11.6957C17.952 12.0453 18.0616 12.6505 17.7866 13.1268L16.4897 15.3732C16.2147 15.8495 15.6357 16.0571 15.1207 15.8642L13.9038 15.4083C13.5483 15.2751 13.1529 15.3362 12.8279 15.5324C12.7555 15.5762 12.6822 15.6186 12.608 15.6596C12.2762 15.8433 12.0262 16.1549 11.9639 16.5289L11.7504 17.8099C11.66 18.3524 11.1906 18.75 10.6407 18.75H8.04673C7.49678 18.75 7.02744 18.3524 6.93703 17.8099L6.72353 16.5289C6.66118 16.1549 6.41121 15.8433 6.07944 15.6596C6.00527 15.6186 5.93195 15.5762 5.85952 15.5324C5.53448 15.3362 5.13915 15.2751 4.78359 15.4083L3.56672 15.8642C3.05173 16.0572 2.47274 15.8495 2.19777 15.3732L0.900784 13.1268C0.625812 12.6505 0.735466 12.0453 1.16005 11.6957L2.1644 10.8689C2.45691 10.6281 2.6019 10.2563 2.59489 9.87747C2.5941 9.83507 2.59371 9.79258 2.59371 9.75C2.59371 9.70742 2.5941 9.66493 2.59489 9.62254C2.6019 9.24373 2.4569 8.87189 2.1644 8.63109L1.16005 7.80427C0.735465 7.45475 0.625812 6.84949 0.900784 6.37323L2.19777 4.12679C2.47274 3.65052 3.05173 3.44286 3.56672 3.63579L4.78357 4.09167C5.13914 4.22487 5.53447 4.16385 5.8595 3.96758C5.93194 3.92384 6.00526 3.88142 6.07944 3.84036C6.41121 3.65671 6.66118 3.34514 6.72353 2.9711L6.93703 1.69005Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.3435 9.74992C12.3435 11.4068 11.0003 12.7499 9.34348 12.7499C7.68662 12.7499 6.34348 11.4068 6.34348 9.74992C6.34348 8.09307 7.68662 6.74992 9.34348 6.74992C11.0003 6.74992 12.3435 8.09307 12.3435 9.74992Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EditIcon({ className, title }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <SvgTitle title={title} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

export function SunIcon({ className, title }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillOpacity="0.9"
      className={className}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <SvgTitle title={title} />
      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75M7.5 12a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0m11.394-5.834a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061zM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75m-3.916 6.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06zM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18m-4.242-.697a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061zM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12m.697-4.243a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06z" />
    </svg>
  );
}
