/**
 * AuroraShaderBackground.tsx  (Native fallback)
 *
 * On iOS/Android, we don't have a DOM canvas, so this is a no-op.
 * The native AuroraCurtains component is used instead (in AmbientBackground.tsx).
 */
import React from "react";

interface Props {
  opacity?: number;
}

export function AuroraShaderBackground(_props: Props) {
  // Native: aurora is rendered by AuroraCurtains — nothing to render here.
  return null;
}
