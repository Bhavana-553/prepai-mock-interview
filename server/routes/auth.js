import express from 'express';
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import pool from "../config/db.js";


const router=express.Router();

router.post("/signUp",async(req,res)=>{
    const {name,email,password}=req.body;
    try{
const hashedPassword= await bcrypt.hash(password,10);

const result= await pool.query("INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *"
    ,[name,email,hashedPassword]);

    res.json(result.rows[0]);
    }catch(err)

    {
        console.log("SIGNUP ERROR:", err);
        res.status(400).json({msg:"User alredy exists"});
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * from users where email=$1", [email]);
        
        if (user.rows.length == 0) {
            return res.status(400).json({ msg: "User does not exist" });
        }

        const match = await bcrypt.compare(password, user.rows[0].password);
        
        if (!match) {
            return res.status(400).json({ msg: "Incorrect password" });
        }

        const token = jwt.sign(
            { userId: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });

    } catch (err) {
        console.log("LOGIN ERROR:", err);
        res.status(400).json({ msg: "Server error" });
    }
});
export default router;
