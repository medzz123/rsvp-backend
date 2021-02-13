import * as functions from "firebase-functions";

import * as express from "express";
import * as cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({origin: true}));

app.get("/", (_, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
  res.send(`Some time now ${hours}`);
});

app.get("/api", (req, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
  res.json({bongs: "BONG ".repeat(hours)});
});

app.post("/body", (req, res) => {
  const body = req.body;
  console.log("Body", body);
  res.json(body);
});


exports.app = functions.https.onRequest(app);
