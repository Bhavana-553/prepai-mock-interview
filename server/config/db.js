import * as dotenv from "dotenv";
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_user,
    host: process.env.DB_host,
    password: process.env.DB_password,
    database: process.env.DB_database,
    port: Number(process.env.DB_port)
});

export default pool;