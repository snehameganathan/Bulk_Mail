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




app.post("/sendmail",function(req,res){

    var msg = req.body.msg
    var emailList = req.body.emailList

    credential.find().then(function(data){
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
            user: data[0].user,
            pass: data[0].pass,
          },
        });
    
        new Promise(async function(resolve,reject){
            try
            {
                for(var i=0; i<emailList.length;i++)
                {
                    await transporter.sendMail(
                        {
                            from: data[0].user,
                            to:emailList[i],
                            subject: " Message from Bulk Mail App",
                            text:msg
                        }            
                    )  
                
                }
                resolve("Success")
            }
            catch(error){
                reject("Failed")
            }
        }).then(function(){
            res.send(true)
        }).catch(function(){
            res.send(false)
        })
        
    }).catch(function(error){
        console.log(error)
    })
    

    

    
})
    

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});


