'use client';

export function SearchField() {
  return (
    <div className="mb-6">
      <div
        className="
            flex items-center rounded-xl 
            border border-neutral-300 dark:border-neutral-700
            bg-white dark:bg-neutral-900
            px-3 py-2 shadow-sm
            focus-within:border-neutral-400 dark:focus-within:border-neutral-500
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
          />
        </svg>

        <input
          type="text"
          placeholder="Søk etter sanger..."
          className="
                w-full bg-transparent text-sm outline-none
                text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
      </div>
    </div>
  );
}
