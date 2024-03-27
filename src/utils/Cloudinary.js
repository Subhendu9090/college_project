import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key:process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary= async(localfilePath)=>{
   try {
     if (!localfilePath) {
         return null;
     }
   const responce= await cloudinary.uploader.upload(localfilePath,{
    resource_type:"auto",
   })
    
   fs.unlinkSync(localfilePath);
   return responce

   } catch (error) {

    fs.unlinkSync(localfilePath);

    console.log("error occuring during uploading the file in cloudinary",error);
   }
}

export {uploadOnCloudinary}