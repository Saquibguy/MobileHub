import { useId } from "react";

export default function Logo({ size = "md", className = "" }) {
  const gradientId = useId();

  const dims = {
    sm: { box: 28, text: "text-base" },
    md: { box: 36, text: "text-xl" },
    lg: { box: 48, text: "text-2xl" },
  };

  const { box, text } = dims[size] || dims.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={box}
        height={box}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`${gradientId}-bg`}
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4338CA" />
            <stop offset="1" stopColor="#9333EA" />
          </linearGradient>

          <linearGradient
            id={`${gradientId}-phone`}
            x1="9"
            y1="4"
            x2="24"
            y2="29"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E9E5FF" />
          </linearGradient>
        </defs>

        {/* Gradient background */}
        <rect
          width="32"
          height="32"
          rx="9"
          fill={`url(#${gradientId}-bg)`}
        />

        {/* Smartphone body */}
        <rect
          x="9"
          y="3.5"
          width="14"
          height="25"
          rx="4"
          fill={`url(#${gradientId}-phone)`}
        />

        {/* Screen */}
        <rect
          x="10.8"
          y="7.5"
          width="10.4"
          height="16"
          rx="1.8"
          fill="#4C1DCE"
        />

        {/* Screen highlight */}
        <path
          d="M12.5 8.5H19L12 16V9.5C12 8.95 12.45 8.5 12.5 8.5Z"
          fill="#A78BFA"
          fillOpacity="0.5"
        />

        {/* Center accent */}
        <circle cx="16" cy="15.5" r="2.1" fill="white" />

        {/* Speaker */}
        <rect
          x="14"
          y="5"
          width="4"
          height="0.9"
          rx="0.45"
          fill="#6D28D9"
        />

        {/* Bottom indicator */}
        <rect
          x="14"
          y="25.5"
          width="4"
          height="1"
          rx="0.5"
          fill="#6D28D9"
        />
      </svg>

      {/* Brand name */}
      <span
        className={`font-extrabold ${text} bg-gradient-to-br from-indigo-700 to-purple-600 bg-clip-text text-transparent tracking-tight`}
      >
        MobileHub
      </span>
    </div>
  );
}