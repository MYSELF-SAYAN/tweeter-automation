const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const axios = require('axios');
const FormData = require("form-data"); // Corrected import
const fs = require('fs');
const dotenv = require('dotenv');
const { GoogleGenAI } = require("@google/genai");
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getTweet = async () => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate a concise, engaging, and insightful tweet about current technologies (e.g., React, Node.js, Golang, ChatGPT, AI tools, DevOps, automation, coding humor, DevSecOps, Spring Boot, Java, Python, data science, and more).

Requirements:

Short & impactful (within 280 characters).

Informative (share a fact, insight, or tip).

Engaging (thought-provoking, humorous, or opinionated).

Hashtags (Include 1-3 relevant ones).

Call-to-Action (optional) (Encourage replies, opinions, or engagement).

Tweet styles:

Quick Tip: "Did you know JavaScript was created in just 10 days? 🚀 #TechTip"

Hot Take: "I might get roasted for this, but JavaScript can lead to unexpected outcomes. Thoughts? 🤔"

Comparison: "React vs Vue: Which one wins in 2025? Let’s break it down... 🧵"

Only generate the tweet, no extra explanation or formatting. `,
    });
    const tweetText = response.candidates[0].content.parts[0].text;
    return tweetText
}
app.get('/', async (req, res) => {
    // try {


    //     const imagePrompt = `Generate an image related to tweetcontent "${tweetText}" which is about ${tweetText} and also related to ${tweetText} it should be kind of like meme.`;

    //     const formData = new FormData(); 
    //     formData.append("prompt", imagePrompt);
    //     formData.append("output_format", "jpeg");

    //     const imageResponse = await axios.post(
    //        ` https://api.stability.ai/v2beta/stable-image/generate/sd3`,
    //         formData,
    //         {
    //             headers: {
    //                 ...formData.getHeaders(),
    //                 Authorization: `Bearer ${process.env.IMAGE_API}`,
    //                 Accept: "image/*"
    //             },
    //             responseType: "arraybuffer"
    //         }
    //     );

    //     if (imageResponse.status === 200) {
    //         fs.writeFileSync("./lighthouse.jpeg", Buffer.from(imageResponse.data));
    //         res.send({ tweet: tweetText, image: "Image saved as lighthouse.jpeg" });
    //     } else {
    //         res.status(500).json({ error: `${imageResponse.status}: ${imageResponse.data.toString()}` });
    //     }
    // } catch (error) {
    //     console.error("Error:", error);
    //     res.status(500).json({ error: error.message });
    // }
    return res.send({ message: "hello" });
});
app.post('/tweet', async (req, res) => {
    try {
        const tweetText = await getTweet();
        console.log(tweetText)
        res.send({ tweet: tweetText });
    }
    catch (err) {
        console.log(err)
    }
})
app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});
