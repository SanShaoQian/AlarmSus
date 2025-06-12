# 🚨 AlarmSus

AlarmSus is a cross-agency community-powered **emergency reporting app** designed to make urban environments safer, smarter, and more responsive. It integrates verified data, crowdsourced reports, and real-time community interaction to support emergency preparedness and response.

---

## Features

### Verified Reports Map
- View nearby **verified emergency resources**:
  - Automated External Defibrillators (**AEDs**)
  - Fire Extinguishers
  - First Aid Kits
- Uses location services to show nearby equipment and incidents.

### Community Forum
- Comment and discuss reports with other users.
- Stay informed about emerging incidents around you.
- Upvote meaningful updates and promote active civic participation.

### Report an Incident
- Submit cross-agency reports (e.g., SCDF, NEA, HDB).
- Attach descriptions, photos, and location details.
- AI-powered urgency analysis helps filter and triage submissions.

### News & Alerts
- Browse a curated list of **manually verified** major incidents.
- Push notifications alert **nearby users** of critical emergencies.
- Acts as a trusted layer of verified safety news.

### Rewards System
- Earn points and badges for:
  - Completing **first aid courses**
  - Submitting **verified reports**
  - Participating in community engagement
- Redeem for recognition or community perks (e.g. leaderboard, profile tags).

---

## Tech Stack

- **React Native (Expo)** for mobile frontend
- **Supabase** for real-time backend and authentication
- **OpenRouter (Claude API)** for report urgency scoring
- **React native maps** for web map rendering
- **data.gov.sg APIs** and **OneMap API** for verified AED/fire equipment data

---

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/SanShaoQian/AlarmSus.git
   cd alarmsus
   npm run start
   ```
2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a .env file with your API keys:
    ```bash
    OPENROUTER_API_KEY=your-openrouter-api-key
    SUPABASE_URL=your-supabase-url
    SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4. Run on android:
    ```bash
    npx expo start --android
    ```
    
---

## Security & Moderation

- All forum posts and reports are subject to moderation.

- Urgency and legitimacy are assessed with both AI and manual curation.

- Data privacy is enforced through Supabase's secure RLS policies.


