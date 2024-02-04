import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Store conversation messages in memory
let conversationMessages = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
];

const fn = (req, res) => {
  res.send("Hello World!!");
};

app.get("/", fn);

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [...conversationMessages, ...messages],
      }),
    });

    const json = await response.json();

    // Extract the model's reply from the choices array
    const modelReply = json.choices[0].message.content;

    // Update conversation messages for continuous conversation
    conversationMessages = [...conversationMessages, ...messages, { role: "user", content: modelReply }];

    // Send streaming response
    res.write(`${modelReply}`);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(8000, () => {
  console.log("Server is running");
});