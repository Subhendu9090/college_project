import dotenv from "dotenv";

import connectDB from "./DB/index.js";
import { app } from "./app.js";

dotenv.config()

const port=process.env.PORT || 5000;

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`app is running at :${port}`);
    })
  }).catch((err)=>{
  console.log(`mongo db connection faild ${err}`);
})