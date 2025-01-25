import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import User from './models/usersModel.js';

//ROUTER
import authRouter from './routers/authRouter.js';


dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
dotenv.config();
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Database connected');
}).catch(err=>{
 console.log(err);
});

app.use('/api/auth', authRouter);






app.get('/', async (req, res) => {
    try{
        const users = await User.find({});
        res.status(200).json({ success: true, data: users });
    }catch(error){
        res.status(500).json({ error: error.message});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
