# Fitur Remot TV — Task List

## Phase 1: Python TV Bridge
- `[x]` Create `tv-bridge/` directory structure
- `[x]` Create `requirements.txt`
- `[x]` Create `main.py` (FastAPI setup)
- `[x]` Create Samsung TV adapter using `samsungtvws`
- `[x]` Create IP Resolver (MAC to IP via ARP)
- `[x]` Create endpoints (`/send-key`, `/power`)

## Phase 2: Laravel Backend
- `[x]` Create `TvBridgeService.php` to call the Python API
- `[x]` Create `TvRemoteController.php` with shift guards and logic
- `[x]` Modify `SessionService.php` to add automatic Power ON/OFF hooks
- `[x]` Add API routes for TV Remote in `routes/api.php`
- `[x]` Add environment variables to `.env`

## Phase 3: React Frontend
- `[x]` Create Context/Zustand slice for global Modal state
- `[x]` Modify `Sidebar.jsx` to open the Modal instead of navigating
- `[x]` Create `TvRemoteModal.jsx` component (UI layout, restrictions for Cashier)
- `[x]` Update `services/api.js` with remote TV endpoints

## Phase 4: Verification
- `[x]` Test Python API manually (if possible)
- `[x]` Verify Laravel guard logic
- `[x]` Verify Frontend UI (Power button hidden for cashier, device list filtered)
- `[x]` Write walkthrough
