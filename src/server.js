import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req,res)=>{
    res.status(404).json({err:"Route not found"})
});

app.listen(port,()=>{
    console.log(`Server is live at PORT ${port}`)
});

export default app;

