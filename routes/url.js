const express = require('express');
const router = express.Router();
const nanoid = require('nanoid');
const Url = require('../models/url');

const baseURL = process.env.baseURL;

router.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    const shortId = nanoid(7);

    try {
        let url = await Url.findOne({ originalUrl });
        if (url) {
            res.json(url);
        } 
        else {
            url = new Url({ originalUrl, shortId });
            await url.save();
            res.json({shortUrl: `${baseURL}/${shortId}`});
        }
    } 
    catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

router.get('/:shortId', async (req, res) =>{
    const { shortId } = req.params;

    try {
        const url = await Url.findOne({ shortId });
        if (url){
            url.clicks += 1; // Increment click count
            await url.save();
            res.redirect(url.originalUrl);
        }
        else
            res.status(404).json('No URL found');
    } 
    catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

module.exports = router;
