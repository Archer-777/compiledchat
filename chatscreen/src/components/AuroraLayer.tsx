import React, { useMemo } from "react";

interface AuroraLayerProps {
  /** 0 = fully hidden, 1 = fully visible. Drives opacity for the fade-in. */
  active: boolean;
  className?: string;
}

/**
 * Purely decorative. Absolutely positioned, zero pointer events, animates
 * only `transform` + `opacity` so it never triggers layout/paint thrash.
 * Colors are pulled from Next Archer's existing dark/cosmic + gold-halo
 * palette (deep obsidian base, violet/indigo aurora bands, a faint warm
 * gold glow echoing the AI halo mark) rather than a generic neon aurora.
 */
export function AuroraLayer({ active, className = "" }: AuroraLayerProps) {
  const blobs = useMemo(
    () => [
      { cls: "aurora-blob aurora-blob--violet", style: { top: "-10%", left: "-15%" } },
      { cls: "aurora-blob aurora-blob--indigo", style: { top: "10%", right: "-20%" } },
      { cls: "aurora-blob aurora-blob--gold", style: { bottom: "-15%", left: "20%" } },
      { cls: "aurora-blob aurora-blob--teal", style: { bottom: "-10%", right: "5%" } },
    ],
    []
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-[1500ms] ease-out ${
        active ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {blobs.map((b, i) => (
        <span key={i} className={b.cls} style={b.style} />
      ))}
      {/* subtle grain/vignette so bubbles stay readable over the glow */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
