// export function ButtonPrimary({ children, className = "", ...props }) {
//   return (
//     <button
//       {...props}
//       className={`w-full py-3 bg-accent text-accent-bg border-none rounded-app-md text-sm font-medium cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// export function ButtonOutline({ children, className = "", ...props }) {
//   return (
//     <button
//       {...props}
//       className={`inline-flex items-center justify-center whitespace-nowrap px-4 py-[11px] bg-transparent text-text-primary border border-border-secondary rounded-app-md text-sm cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
//     >
//       {children}
//     </button>
//   );
// }










// export function ButtonPrimary({ children, className = "", full = false, ...props }) {
//   return (
//     <button
//       {...props}
//       className={`inline-flex items-center justify-center gap-1.5 ${full ? "w-full" : ""} h-10 px-4 bg-accent text-white border border-accent rounded-app-md text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[#3a5a3d] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-accent ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// export function ButtonOutline({ children, className = "", full = false, ...props }) {
//   return (
//     <button
//       {...props}
//       className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${full ? "w-full" : ""} h-10 px-4 bg-bg-primary text-text-primary border border-border-secondary rounded-app-md text-[13px] font-medium cursor-pointer transition-colors hover:bg-bg-secondary disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-bg-primary ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// export function ButtonText({ children, className = "", ...props }) {
//   return (
//     <button
//       {...props}
//       className={`inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${className}`}
//     >
//       {children}
//     </button>
//   );
// }











export function ButtonPrimary({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[42px] px-4 py-2.5
        bg-accent
        text-white
        border border-accent
        rounded-app-md
        text-sm font-semibold leading-none
        cursor-pointer
        shadow-[0_2px_5px_rgba(31,109,71,0.20)]
        transition-all duration-150

        hover:bg-accent-hover
        hover:border-accent-hover
        hover:shadow-[0_3px_8px_rgba(31,109,71,0.24)]
        active:translate-y-[1px]

        focus:outline-none
        focus:ring-2
        focus:ring-accent/20
        focus:ring-offset-1

        disabled:opacity-50
        disabled:cursor-not-allowed

        ${className}
      `}
    >
      {children}
    </button>
  );
}


export function ButtonOutline({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[42px] px-4 py-2.5
        bg-white
        text-accent-text
        border border-accent
        rounded-app-md
        text-sm font-semibold leading-none
        cursor-pointer
        shadow-[0_1px_3px_rgba(0,0,0,0.05)]
        transition-all duration-150

        hover:bg-accent
        hover:text-white
        hover:border-accent
        hover:shadow-[0_2px_6px_rgba(31,109,71,0.16)]
        active:translate-y-[1px]

        focus:outline-none
        focus:ring-2
        focus:ring-accent/15
        focus:ring-offset-1

        disabled:opacity-50
        disabled:cursor-not-allowed

        ${className}
      `}
    >
      {children}
    </button>
  );
}


export function ButtonGhost({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[38px] px-3 py-2
        bg-transparent
        text-accent-text
        border border-transparent
        rounded-app-md
        text-sm font-semibold leading-none
        cursor-pointer
        transition-all duration-150

        hover:bg-accent-bg
        hover:text-accent
        hover:border-accent/20

        focus:outline-none
        focus:ring-2
        focus:ring-accent/15

        disabled:opacity-50
        disabled:cursor-not-allowed

        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function ButtonDanger({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[42px] px-4 py-2.5
        bg-fail-bg
        text-fail-text
        border border-fail-text/20
        rounded-app-md
        text-sm font-semibold leading-none
        cursor-pointer
        transition-all duration-150

        hover:bg-[#B42318]
        hover:text-white
        hover:border-[#B42318]
        hover:shadow-[0_3px_8px_rgba(180,35,24,0.20)]

        active:translate-y-[1px]

        focus:outline-none
        focus:ring-2
        focus:ring-red-500/20
        focus:ring-offset-1

        disabled:opacity-50
        disabled:cursor-not-allowed

        ${className}
      `}
    >
      {children}
    </button>
  );
}