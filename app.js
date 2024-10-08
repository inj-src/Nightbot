const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

const pageAccessToken = `EAANF2wYjShwBO3UjOfgSkkuVHEzTl6shZCbUYS6USj3QVRj1ZCo1WnHnvhEPhaKZA3XraN7hZAzit5mnb2zW43uE019OwDHuYTZAnOXsZAG6VNKqESq9AeWBBEsIaF3P3earVsT4V7KhJHXPq6yZAXc1A186ZB4flm6TIpMOXvIOHsN0ZACYPhbPZBoxhhUr3PDAJa2QZDZD`;

// Setup express
app.use(bodyParser.json());

// Facebook Verification
app.get("/webhook", (req, res) => {
   const VERIFY_TOKEN = "your-verification-token";
   const mode = req.query["hub.mode"];
   const token = req.query["hub.verify_token"];
   const challenge = req.query["hub.challenge"];

   if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
         console.log("WEBHOOK_VERIFIED");
         res.status(200).send(challenge);
      } else {
         res.sendStatus(403);
      }
   }
});

// Handle incoming messages
app.post("/webhook", (req, res) => {
   const body = req.body;

   if (body.object === "page") {
      body.entry.forEach((entry) => {
         const webhook_event = entry.messaging[0];
         const sender_psid = webhook_event.sender.id;

         if (webhook_event.message) {
            handleMessage(sender_psid, webhook_event.message);
         }
      });
      res.status(200).send("EVENT_RECEIVED");
   } else {
      res.sendStatus(404);
   }
});

function handleMessage(sender_psid, received_message) {
   let response;

   if (received_message.text) {
      response = { text: `You sent the message: "${received_message.text}"` };
   }

   axios({
      method: "POST",
      url: `https://graph.facebook.com/v12.0/me/messages?access_token=${pageAccessToken}`,
      data: {
         recipient: { id: sender_psid },
         message: response,
      },
   });
}

app.listen(3000, () => console.log("server is running"));
