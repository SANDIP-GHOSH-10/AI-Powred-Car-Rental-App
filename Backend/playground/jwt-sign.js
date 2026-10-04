import jwt from "jsonwebtoken";

const user ={ _id: 1, email: "user@example.com", password: "" };
const tokenData = { userId : user._id };
const token = jwt.sign(tokenData, "dct@123", { expiresIn: "1h" });
console.log("Generated JWT:", token);