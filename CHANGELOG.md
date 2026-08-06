# Change Log

All changes made to the application from this point forward will be documented here.

---

## [Unreleased] - 2026-08-06

### User Flow Restructuring
- **AuraScannerPage**: Removed the Aura Sticker Studio button and eliminated the webcam aura color overlay field.
- **SuperchargePage**: Updated `Start Supercharging` button to redirect to the AI Chat Screen (`/chat`).
- **ChatScreenPage**: Added `End Session & Heal Me ✨` button to redirect users to the Heal Me Screen (`/heal-me`).
- **HealMePage & HealMeScreen**: Placed `✈️ TRAVEL MODE` button directly beside the `BEGIN SESSION` button on the sanctuary chat form, routing to `/travel`.
- **HealingPage & HealingScreen**: Neatly integrated `First-Time User? Complete Registration →` action buttons in both top navigation bar and below primary healing button, routing to `/register`.
- **TravelModePage & TravelModeScreen**: Neatly placed `Proceed to Register →` button in header bar and `First-Time User? Complete Registration →` action button in controls column, routing to `/register`.
- **RegisterPage**: Updated final registration completion button to redirect to Digital Twin Screen (`/digital-twin`).
- **Global Returning User Navbar**: Created `GlobalNavbar.jsx` (`src/components/layout/GlobalNavbar.jsx`) and integrated it into `App.jsx`. Automatically displays a sticky top navigation bar once a user unlocks their Digital Twin or registers, allowing free navigation between all 8 app sections.

### Initial Setup
- Initialized `CHANGELOG.md` for recording ongoing codebase modifications.
- Configured project rules in `.agents/AGENTS.md` to ensure all changes are systematically logged.

