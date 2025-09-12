const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

app.get('/screenshot', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing URL parameter');

    try {
        const apiUrls = [
            `https://image.thum.io/get/width/800/crop/600/${url}`,
            `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=800`
        ];

        for (const apiUrl of apiUrls) {
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const imageBuffer = await response.buffer();
                    res.set('Content-Type', response.headers.get('content-type'));
                    return res.send(imageBuffer);
                }
            } catch (e) {
                console.log(`API ${apiUrl} failed:`, e);
            }
        }
        throw new Error('All screenshot APIs failed');
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).send('Failed to get screenshot');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});