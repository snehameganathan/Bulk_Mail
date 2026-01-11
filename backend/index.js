require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error:", err.message));

const credentialSchema = new mongoose.Schema({
  sendgridApiKey: String,
  senderEmail: String
});

const Credential = mongoose.model(
  "credential",
  credentialSchema,
  "bulkmail"
);

app.post("/sendmail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;

    const creds = await Credential.findOne();
    if (!creds) return res.send(false);

    sgMail.setApiKey(creds.sendgridApiKey);

    const mails = emailList.map(email => ({
      to: email,
      from: creds.senderEmail,
      subject: "Message from Bulk Mail App",
      text: msg
    }));

    await sgMail.send(mails);
    console.log("✅ Emails sent successfully");

    res.send(true);
  } catch (error) {
    console.error("❌ SENDGRID ERROR:", error.response?.body || error.message);
    res.send(false);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Server running on", PORT));
