/**
 * Minimal PTZ proxy for ONVIF cameras (e.g., TP-Link VIGI) running on your LAN.
 *
 * Why: Browsers cannot call ONVIF (SOAP over HTTP) directly due to CORS and auth.
 * This tiny server accepts HTTP JSON and issues ONVIF PTZ commands to your camera.
 *
 * Usage:
 *   1) npm i
 *   2) node tools/ptz-proxy/server.js
 *   3) Set VITE_PTZ_PROXY_URL in the web app to http://<this-host>:4000
 *   4) PTZ endpoints:
 *      POST /ptz/continuous { host, port, user, pass, x, y, z }
 *      POST /ptz/stop       { host, port, user, pass, panTilt, zoom }
 *      POST /ptz/preset     { host, port, user, pass, token, action, name, presetToken }
 */

/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Cam } = require('onvif');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

function withCam({ host, port = 80, user, pass }) {
    return new Promise((resolve, reject) => {
        const cam = new Cam(
            {
                hostname: host,
                port,
                username: user,
                password: pass,
                timeout: 5000,
            },
            function (err) {
                if (err) return reject(err);
                resolve(cam);
            }
        );
    });
}

app.post('/ptz/continuous', async (req, res) => {
    const { host, port, user, pass, x = 0, y = 0, z = 0 } = req.body || {};
    if (!host || !user || !pass) return res.status(400).json({ error: 'Missing host/user/pass' });
    try {
        const cam = await withCam({ host, port, user, pass });
        cam.continuousMove({ x: Number(x), y: Number(y), zoom: Number(z) }, (err) => {
            if (err) return res.status(500).json({ error: String(err) });
            res.json({ ok: true });
        });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
});

app.post('/ptz/stop', async (req, res) => {
    const { host, port, user, pass, panTilt = true, zoom = true } = req.body || {};
    if (!host || !user || !pass) return res.status(400).json({ error: 'Missing host/user/pass' });
    try {
        const cam = await withCam({ host, port, user, pass });
        cam.stop({ panTilt, zoom }, (err) => {
            if (err) return res.status(500).json({ error: String(err) });
            res.json({ ok: true });
        });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
});

app.post('/ptz/preset', async (req, res) => {
    const { host, port, user, pass, token, action, name, presetToken } = req.body || {};
    if (!host || !user || !pass || !action) return res.status(400).json({ error: 'Missing fields' });
    try {
        const cam = await withCam({ host, port, user, pass });
        if (action === 'goto') {
            cam.gotoPreset({ preset: presetToken || token }, (err) => {
                if (err) return res.status(500).json({ error: String(err) });
                res.json({ ok: true });
            });
        } else if (action === 'set') {
            cam.setPreset({ presetName: name || 'Preset' }, (err, data) => {
                if (err) return res.status(500).json({ error: String(err) });
                res.json({ ok: true, data });
            });
        } else if (action === 'remove') {
            cam.removePreset({ preset: presetToken || token }, (err) => {
                if (err) return res.status(500).json({ error: String(err) });
                res.json({ ok: true });
            });
        } else {
            res.status(400).json({ error: 'Unknown action' });
        }
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`PTZ proxy running on http://localhost:${PORT}`));
