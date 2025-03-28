const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { TwitterApi } = require('twitter-api-v2');
const { GoogleGenAI } = require("@google/genai");

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Twitter Client
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET
});

const getTweet = async () => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate a concise, engaging, and insightful tweet about current technologies (e.g., React, Node.js, Golang, AI, DevOps, etc.).
        
        - Within 280 characters.
        - Informative or engaging.
        - Include 1-3 relevant hashtags.
        - No extra text, only the tweet content.`,
    });

    return response.candidates[0].content.parts[0].text;
};

app.post('/tweet', async (req, res) => {
    try {
        const tweetText = await getTweet();
        console.log("Generated Tweet:", tweetText);

        const tweetResponse = await twitterClient.v2.tweet(tweetText);
        console.log("Tweet Response:", tweetResponse);

        res.json({ message: "Tweet posted successfully!", tweet: tweetText, response: tweetResponse });
    } catch (err) {
        console.error("Error posting tweet:", err);
        res.status(500).json({ error: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
