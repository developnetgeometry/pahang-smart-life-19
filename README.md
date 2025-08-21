# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a44ffb98-9454-4379-8a8d-73f9f837f1f5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a44ffb98-9454-4379-8a8d-73f9f837f1f5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## CCTV streaming setup

This app supports multiple stream types for CCTV: HLS (.m3u8), MP4/WebM, MJPEG, and RTSP (via gateway). To ensure streams play in browsers and across networks, configure the following:

1) Copy environment template

Create a local `.env` from `.env.example` and fill your Supabase keys. Optionally set the streaming vars now or later:

```
cp .env.example .env
# edit .env and set VITE_* variables
```

2) Deploy the MJPEG proxy (optional but recommended)

Browser CORS often blocks direct MJPEG URLs. We include a Supabase Edge Function at `supabase/functions/proxy-mjpeg` that safely proxies the stream with proper headers.

- Deploy the function in your Supabase project (edge functions must be enabled):
	- Name: `proxy-mjpeg`
	- URL will look like: `https://<project-ref>.functions.supabase.co/proxy-mjpeg`
- Set `VITE_MJPEG_PROXY_URL` in `.env` to that URL.

After this, MJPEG links like `http://camera-ip/.../nphMotionJpeg?...` will play through the proxy.

3) Enable RTSP via a gateway (optional)

Browsers cannot play `rtsp://` directly. Use a gateway that converts RTSP to HLS:

- Self-host MediaMTX or an FFmpeg-based service that exposes an `.m3u8` given a `?src=rtsp://...` query.
- Set `VITE_STREAM_GATEWAY_URL` in `.env` to the gateway endpoint that returns an HLS manifest.
	- Example: `https://your-gateway.example.com/hls.m3u8` (the app appends `?src=...`).

Alternatively, if your provider exposes an HLS URL, paste the HLS `.m3u8` directly and leave the gateway unset.

4) Try a known working demo feed

On the Admin CCTV page, click “Add Demo Camera” to insert a tested HLS stream. This verifies playback end-to-end without any extra setup.

5) Validating and saving cameras

When adding/editing a camera, the app validates the URL based on type:
- HLS: fetches the manifest and checks it loads / contains HLS tags
- MP4/WebM: attempts a HEAD/GET to verify it is accessible
- MJPEG: pings via the proxy if configured
- RTSP: requires the gateway to be set, then validates the HLS output from the gateway

If validation fails, the save button will show the error so you can fix the URL or configuration.

Environment variables

- `VITE_MJPEG_PROXY_URL`: Supabase Edge Function URL of `proxy-mjpeg`
- `VITE_STREAM_GATEWAY_URL`: RTSP→HLS gateway URL returning an `.m3u8` for `?src=rtsp://...`

Notes

- HLS and MP4/WebM work out of the box in modern browsers. Safari/iOS can play HLS natively; other browsers use hls.js automatically.
- MJPEG requires the proxy in most cases due to CORS.
- RTSP must be converted to HLS or another browser-friendly format before playback.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a44ffb98-9454-4379-8a8d-73f9f837f1f5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
