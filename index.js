const express = require('express');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios')
const { TwitterApi } = require('twitter-api-v2');
const { GoogleGenAI } = require("@google/genai");
const path = require("path")
const fs = require("fs");
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
const tweet=twitterClient.readWrite
const getTweet = async () => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate a concise, engaging, and insightful tweet about current technologies (e.g., React, Node.js, Golang, AI, DevOps, etc.).
        
        - Within 280 characters.
        - Informative or engaging.
        - Include 1-3 relevant hashtags.
        - No extra text, only the tweet content.`,
    });
    const prompt = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate a high quality  prompt for generating images based on the following tweet: ${response.candidates[0].content.parts[0].text} it should be kind of meme or message giving type with proper texts and no spelling mistake or no grammatrtical mistake and correct words also texts should perfectly aligned to the prompt and image and just generate prompt not anything else no other text or word should be included and generate one one prompt no need for options`,
    })
    const fullResponse = {
        prompt: prompt.candidates[0].content.parts[0].text.replace(/\*/g, ''),
        tweet: response.candidates[0].content.parts[0].text
    }
    return fullResponse;
};
const generateImage = async (prompt) => {
    try {
        const imageUrl = `https://ai-image-api.xeven.workers.dev/img?prompt=${encodeURIComponent(prompt)}&model=flux-schnell`;
        const imagePath = path.join(__dirname, "image.jpg");

        const response = await axios.get(imageUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => resolve(imagePath));
            writer.on("error", reject);
        });
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image.");
    }
};
app.post('/tweet', async (req, res) => {
    try {
        const rp = await getTweet();
        const tweetText = rp.tweet;
        const prompt = rp.prompt;
        console.log("Generated Tweet:", tweetText);
        await generateImage(prompt)
        const imagePath = path.join(__dirname, "image.jpg");
        const mediaId = await tweet.v1.uploadMedia(imagePath);
        // const tweetResponse = await twitterClient.v2.tweet(tweetText);
        const tweetResponse = await tweet.v2.tweet({
            text: tweetText,
            media: { media_ids: [mediaId] },
          });
        // console.log("Tweet Response:", tweetResponse);

        // res.json({ message: "Tweet posted successfully!", tweet: tweetText, response: tweetResponse });
        res.json({ message: "Tweet posted successfully!", tweet: tweetText,media:mediaId,tweetResponse:tweetResponse });
    } catch (err) {
        console.error("Error posting tweet:", err);
        res.status(500).json({ error: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
