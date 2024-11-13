import mongoose from "mongoose";

const schema= new mongoose.Schema({
    question: String,
    anticipatedAnswer: { type: String, default: null },
    response: { type: String, default: null },
})

export const History = mongoose.model('History', schema, 'History');
export const SocialScience= mongoose.model('Social_Science', schema, 'Social_Science');
export const ComputerSecurity= mongoose.model('Computer_Security', schema, 'Computer_Security');

