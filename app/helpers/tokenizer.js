import jwt from 'jsonwebtoken'; 

const Tokenizer = async (payload) => {
if (!verifyPayload(payload)) return false; 
const token = jwt.sign(payloadm, process.env.SECRET_KEY);
return token; 
}