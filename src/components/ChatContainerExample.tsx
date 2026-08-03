import React, { useState } from "react";
import { ChatBackgroundWrapper } from "./ChatBackgroundWrapper";

/**
 * Illustrative only — swap the inner markup for your real ChatContainer.
 * Shows: (1) wiring testAurora to a query param for QA, (2) keeping the
 * message layer above the background with backdrop-blur for readability.
 */
export function ChatContainerExample() {
  const [testAurora] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("testAurora")
  );

  return (
    <ChatBackgroundWrapper testAurora={testAurora} className="flex h-screen flex-col">
      <div className="relative z-10 flex h-full flex-col">
        <header className="border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
          <h1 className="text-sm font-medium text-white/90">Hey Neha</h1>
        </header>

        <main className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
          <div className="max-w-[80%] rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
            Hello! How are you today?
          </div>
          <div className="ml-auto max-w-[80%] rounded-2xl bg-violet-500/30 px-4 py-2 text-sm text-white backdrop-blur-md">
            This would be a normal conversation within 30 words.
          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
          <input
            className="w-full rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder-white/40 outline-none"
            placeholder="Message..."
          />
        </footer>
      </div>
    </ChatBackgroundWrapper>
  );
}
