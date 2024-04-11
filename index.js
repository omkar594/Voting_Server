const express = require('express');
const cors = require("cors")
const app = express();
require('dotenv').config()
const {Web3} = require("web3");
const ABI = require("./ABI.json")

app.use(express.json())
app.use(cors())

const API_KEY= process.env.API_KEY;
const PORT = process.env.PORT || 3000;
const web3 = new Web3(`https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`)
const contractAddress = "0x300f0EBF8d93310AC00c4420d1Ea735410e786bf";
const contract = new web3.eth.Contract(ABI,contractAddress);

const genderVerification = (gender)=>{
   const genderData = gender.toLowerCase();
   if(genderData==="male" || genderData==="female" || genderData==="others"){
     return true;
   }else{
     return false;
   }
}

const partyClashStatus=async(party)=>{
   const candidateInfo = await contract.methods.candidateList().call();
   const exists = candidateInfo.some((candidate)=>candidate.party===party);
   return exists;
}

app.post("/api/voter-verfication",(req,res)=>{
    const {gender} = req.body;
    const status = genderVerification(gender)
    if(status){
       res.status(200).json({message:"Gender Valid"})
    }else{
        res.status(403).json({message:"Gender Invalid"})
    } 
})

app.post("/api/time-bound",(req,res)=>{
    const {startTimeSeconds,endTimeSeconds}=req.body;
    if(endTimeSeconds-startTimeSeconds<86400){
        res.status(200).json({message:"Voting Timer Started"})
    }else{
        res.status(403).json({message:"Voting Time Must Be Less Than 24 hours"})
    }
})

app.post("/api/candidate-verification",async(req,res)=>{
    const {gender,party}=req.body;
    const partyStatus = await partyClashStatus(party);
    const genderStatus = genderVerification(gender);

    if(genderStatus===true && partyStatus!==true){
        res.status(200).json({message:"Gender and Party Are Valid"})
    }else{
        res.status(403).json({message:"Either Party Name or Gender is not valid"})
    }
})

app.listen(PORT,()=>{
    console.log(`Server is running ${PORT}`)
})