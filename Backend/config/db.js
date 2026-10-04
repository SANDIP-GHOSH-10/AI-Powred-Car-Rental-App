import mongoose from "mongoose";

const configureDB = async ()=>{ 
    try {
        const db = await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
};


export default configureDB;