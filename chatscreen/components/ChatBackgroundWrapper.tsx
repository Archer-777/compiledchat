import React, { ReactNode } from "react";
import { useChatAmbientBackground } from "../hooks/useChatAmbientBackground";
import { AuroraLayer } from "./AuroraLayer";

interface ChatBackgroundWrapperProps {
  children: ReactNode;
  /** Dev/QA flag — instantly show the aurora instead of waiting 3 min. */
  testAurora?: boolean;
  className?: string;
  style?: React.CSSProperties | any;
}

/**
 * Drop this around your existing chat UI. It renders nothing extra in the
 * layout — the gradient + aurora sit at z-0 behind `children`, which you
 * should keep on a higher stacking context (e.g. `relative z-10`) with
 * `backdrop-blur-md` on message bubbles/input bar for legibility.
 *
 * Example:
 *   <ChatBackgroundWrapper testAurora={debugAurora}>
 *     <div className="relative z-10">
 *       <ChatMessages />
 *       <ChatInput />
 *     </div>
 *   </ChatBackgroundWrapper>
 */
export function ChatBackgroundWrapper({
  children,
  testAurora = false,
  className = "",
  style,
}: ChatBackgroundWrapperProps) {
  const { timeMode, auroraActive } = useChatAmbientBackground({ testAurora });

  return (
    <div
      style={style}
      className={`relative min-h-full w-full overflow-hidden chat-bg chat-bg--${timeMode} ${className}`}
    >
      <AuroraLayer active={auroraActive} />
      <div className="relative z-10 flex h-full flex-col flex-1" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
