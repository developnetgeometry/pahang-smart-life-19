# PTZ Proxy (ONVIF)

A tiny Node server that relays PTZ commands to ONVIF cameras on your LAN. Used by the web app to control PTZ safely (avoids CORS and credential exposure).

## Install and run

```bash
cd tools/ptz-proxy
npm init -y
npm install express cors body-parser onvif
node server.js
```

Then set `VITE_PTZ_PROXY_URL` in `.env`, for example:

```
VITE_PTZ_PROXY_URL="http://<proxy-host>:4000"
```

## Endpoints

- POST /ptz/continuous { host, port, user, pass, x, y, z }
- POST /ptz/stop { host, port, user, pass, panTilt, zoom }
- POST /ptz/preset { host, port, user, pass, token, action, name, presetToken }

TP-Link VIGI defaults in your case:
- host: 192.168.0.60
- ONVIF port: 80
- user: admin
- pass: Netgeometry@200

## Notes
- Run this proxy on the same LAN as the camera.
- Keep credentials only on the proxy; the frontend sends them to this service.
- Secure the proxy if exposed beyond your LAN.
