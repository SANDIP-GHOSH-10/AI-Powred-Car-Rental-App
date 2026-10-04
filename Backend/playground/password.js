import bcrypt from "bcryptjs";
const password = "Secret@123";

async function register(){
    try {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        console.log("Salt:", salt); //29 characters
        console.log("Hashed Password:", hash); //60 characters
    } catch (err) {
        console.error("Error generating salt:", err);
    }
}


register();