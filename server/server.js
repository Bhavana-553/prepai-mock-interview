
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/auth.js";
import interviewRoutes from "./routes/interview.js";




const app=express();

app.use(express.json());
app.use(cors());


app.use("/api/auth",authRoutes);


app.use("/api/interview", interviewRoutes);





app.listen(process.env.PORT || 5000 ,()=>{
    console.log("Server Succesully running ");
})
