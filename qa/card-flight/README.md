# 2026-10-03 Chapter 6 freeze regression

Live release e0230e9, fully current modules: water card advances normally.
Injected Thursday d277bc1 boss/audio.js with the current card-flight module: uncaught `sound.impact is not a function` at elapsed 0.9833; freezes on the water dialogue in the reported screenshot. This reproduces a plausible cause, not proof of the friend's browser cache contents.

Fix: optional, isolated audio cues; version the two card chapters' animation/audio imports. No save format or narrative changes.

Regression script covers current audio, old cached audio, throwing impact audio, and restoring a saved cast at 0.98 seconds. Each completes all three cards with no page errors and cleans up animation elements. Run with GAME_URL to target a deployment.

Also ran the shared Chapter 2 correct/incorrect/pause and Chapter 6 three-card browser checks, 17 relevant state/audio tests, 13 opening state tests, and production build.
