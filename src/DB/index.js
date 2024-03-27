import mongoose from "mongoose";

const connectDB = async () => {
    const DB_NAME="hostel"
    try {
        const connectioninstance = await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
        console.log(`mongodb connected successfully ${connectioninstance.connection.host}`);
    } catch (error) {
        console.log(`mongo db connection error ${error}`);
        throw error
    }
}

export default connectDB