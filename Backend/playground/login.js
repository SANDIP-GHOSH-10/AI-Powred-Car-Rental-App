import bcrypt from "bcryptjs";

async function login() {
    const password = "Secret@123";
    const hashedPassword = "$2b$10$XB/zw8F7ggYTGhccz9IoMu0GZRlzIyJeMrIo4qGcAAN1U3X5impYC";
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        console.log("Password match:", isMatch); // true or false
    } catch (err) {
        console.error("Error comparing passwords:", err);
    }
}

login();