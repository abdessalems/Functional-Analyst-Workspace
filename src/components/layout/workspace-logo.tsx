import * as React from "react";

/**
 * Workspace mark.
 *
 * Keeps the portfolio's rounded-square container and teal gradient
 * (#34e3cf → #12a594) so the two properties read as one brand, but carries an
 * analysis glyph rather than the portfolio's own mark: one node branching into
 * two, which is what this tool is for — a requirement traced to the rule and
 * the test that prove it.
 */
export function WorkspaceLogo({
  className,
  title = "Analyst Workspace",
}: {
  className?: string;
  title?: string;
}) {
  const gradientId = React.useId();

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34e3cf" />
          <stop offset="1" stopColor="#12a594" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${gradientId})`} />

      {/* Requirement branching to the artefacts that evidence it. */}
      <g
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      >
        <path d="M23 32 H31 a4 4 0 0 0 4 -4 V23" />
        <path d="M23 32 H31 a4 4 0 0 1 4 4 V41" />
      </g>

      <g fill="#ffffff">
        <circle cx="20" cy="32" r="6.4" />
        <circle cx="43" cy="21" r="5.2" />
        <circle cx="43" cy="43" r="5.2" />
      </g>

      {/* A tick inside the lower node: the branch that proves the requirement. */}
      <path
        d="M40.6 43.1 L42.4 44.9 L45.6 41.3"
        stroke="#0f8f80"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
