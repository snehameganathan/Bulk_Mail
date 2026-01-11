require("dotenv").config();

const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer");
const mongoose = require("mongoose")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI).then(function(){
    console.log("Connected to DB")
}).catch(function(){
    console.log("Failed to connect DB")
})

const credentialSchema = new mongoose.Schema({
    user: String,
    pass: String
  });

const credential = mongoose.model("credential",credentialSchema,"bulkmail")

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.




app.post("/sendmail", async function (req, res) {
    try {
      const { msg, emailList } = req.body;
  
      const data = await credential.find();
  
      if (!data.length) {
        console.error("No credentials found in DB");
        return res.send(false);
      }
  
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: data[0].user,
          pass: data[0].pass,
        },
      });
  
      for (let i = 0; i < emailList.length; i++) {
        await transporter.sendMail({
          from: data[0].user,
          to: emailList[i],
          subject: "Message from Bulk Mail App",
          text: msg,
        });
      }
  
      res.send(true);
  
    } catch (error) {
      // ✅ THIS IS WHERE THE CATCH GOES
      console.error("REAL EMAIL ERROR 👉", error.message);
      console.error(error); // full nodemailer error
      res.send(false);
    }
    
  });
  
    

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});


