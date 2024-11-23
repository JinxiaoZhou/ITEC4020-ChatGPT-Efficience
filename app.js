import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import {History, SocialScience, ComputerSecurity} from './schema.js'
import 'dotenv/config'
import OpenAI from "openai";



const app= express()
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const mongoDBURI =  process.env.MONGODB_URI;
const openai = new OpenAI({apiKey:process.env.OPENAI_API_SECRET_KEY});

mongoose.connect(mongoDBURI)
.then(()=> console.log('connected to MongoDB'))
.catch((error)=> console.error('something went wrong with MongoDB connection', error))

const getOpenAIResponse=async(question)=>{
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: `please only give me the answer: ${question}` },
            ],
        });
        const responseMsg= response.choices[0].message.content.charAt(0)
        return responseMsg
    } catch (error) {
        if (error.status === 429) {
            console.error("rate-limiting issue. Waiting 1 minute...");
            setTimeout(() => getCompletion(), 60000);
        }
        console.error('Error with OpenAI API:', error);
    }
}

app.get('/history', async(req,res)=>{
    try{
        const randomQuestions= await History.aggregate([{ $sample: { size: 5 } }]);
        const num= randomQuestions.length
        let avgResponseTime=0;
        let minResponseTime=Number.MAX_VALUE;
        let maxResponseTime=0;
        let totalResponseTime=0;
        for(const question of randomQuestions){
            const id= question.id
            const startTime = Date.now()
            let response;
            try {
                response = await getOpenAIResponse(question.question);
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    res.status(429).json({ error: 'OpenAI API exceeded its limit.' });
                } else {
                    res.status(500).json({ error: `Failed to get an answer for: ${question.question}.` });
                }
            }
            const endTime = Date.now()
            const responseTime = endTime - startTime;
            minResponseTime= Math.min(minResponseTime, responseTime)
            maxResponseTime= Math.max(maxResponseTime, responseTime)
            totalResponseTime+= responseTime

            if(response){
                await History.findByIdAndUpdate(id, {response: response})
            }
        }
        avgResponseTime= totalResponseTime/num
        res.json({
            questions: randomQuestions,
            avg: avgResponseTime,
            min: minResponseTime,
            max: maxResponseTime
        });
    }catch(error){
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.get('/social-science', async(req,res)=>{
    try{
        const randomQuestions= await SocialScience.aggregate([{ $sample: { size: 5 } }]);
        const num= randomQuestions.length
        let avgResponseTime=0;
        let minResponseTime=Number.MAX_VALUE;
        let maxResponseTime=0;
        let totalResponseTime=0;
        for(const question of randomQuestions){
            const id= question.id
            const startTime = Date.now()
            let response;
            try {
                response = await getOpenAIResponse(question.question);
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    res.status(429).json({ error: 'OpenAI API exceeded its limit.' });
                } else {
                    res.status(500).json({ error: `Failed to get an answer for: ${question.question}.` });
                }
            }
            const endTime = Date.now()
            const responseTime = endTime - startTime;
            minResponseTime= Math.min(minResponseTime, responseTime)
            maxResponseTime= Math.max(maxResponseTime, responseTime)
            totalResponseTime+= responseTime

            if(response){
                await SocialScience.findByIdAndUpdate(id, {response: response})
            }else {
                res.status(500).json({ error: `Failed to get an answer for:${question.question}。` });
            }
        }
        avgResponseTime= totalResponseTime/num
        res.json({
            questions: randomQuestions,
            avg: avgResponseTime,
            min: minResponseTime,
            max: maxResponseTime
        });
    }catch(error){
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})


app.get('/computer-security', async(req,res)=>{
    try{
        const randomQuestions= await ComputerSecurity.aggregate([{ $sample: { size: 5 } }]);
        const num= randomQuestions.length
        let avgResponseTime=0;
        let minResponseTime=Number.MAX_VALUE;
        let maxResponseTime=0;
        let totalResponseTime=0;
        for(const question of randomQuestions){
            const id= question.id
            const startTime = Date.now()
            let response;
            try {
                response = await getOpenAIResponse(question.question);
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    res.status(429).json({ error: 'OpenAI API exceeded its limit.' });
                } else {
                    res.status(500).json({ error: `Failed to get an answer for: ${question.question}.` });
                }
            }
            const endTime = Date.now()
            const responseTime = endTime - startTime;
            minResponseTime= Math.min(minResponseTime, responseTime)
            maxResponseTime= Math.max(maxResponseTime, responseTime)
            totalResponseTime+= responseTime

            if(response){
                await ComputerSecurity.findByIdAndUpdate(id, {response: response})
            }else {
                res.status(500).json({ error: `Failed to get an answer for:${question.question}。` });
            }
        }
        avgResponseTime= totalResponseTime/num
        res.json({
            questions: randomQuestions,
            avg: avgResponseTime,
            min: minResponseTime,
            max: maxResponseTime
        });
    }catch(error){
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.post('/history-accuracy', async(req,res)=>{
    try {
        const questionIds = req.body.ids;
        if(!Array.isArray(questionIds) || questionIds.length==0){
            return res.status(400).json({ error: 'Invalid input, please provide an array of question IDs.'})
        }
        let accuracyNum=0
        for(const questionId of questionIds){
            const question= await History.findById(questionId)
            const anticipatedAnswer= question.anticipatedAnswer
            const response= question.response
            if(anticipatedAnswer== response){
                accuracyNum+=1
            }
        }
        const accuracyRate= accuracyNum/questionIds.length
        res.json({ historyAccuracy: accuracyRate }); 
    } catch (error) {
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.post('/social-accuracy', async(req,res)=>{
    try {
        const questionIds = req.body.ids;
        if(!Array.isArray(questionIds) || questionIds.length==0){
            return res.status(400).json({ error: 'Invalid input, please provide an array of question IDs.'})
        }
        let accuracyNum=0
        for(const questionId of questionIds){
            const question=await SocialScience.findById(questionId)
            const anticipatedAnswer= question.anticipatedAnswer
            const response= question.response
            if(anticipatedAnswer== response){
                accuracyNum+=1
            }
        }
        const accuracyRate= accuracyNum/questionIds.length
        res.json({ socialAccuracy: accuracyRate }); 
    } catch (error) {
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.post('/computer-accuracy', async(req,res)=>{
    try {
        const questionIds = req.body.ids;
        if(!Array.isArray(questionIds) || questionIds.length==0){
            return res.status(400).json({ error: 'Invalid input, please provide an array of question IDs.'})
        }
        let accuracyNum=0
        for(const questionId of questionIds){
            const question=await ComputerSecurity.findById(questionId)
            const anticipatedAnswer= question.anticipatedAnswer
            const response= question.response
            if(anticipatedAnswer== response){
                accuracyNum+=1
            }
        }
        const accuracyRate= accuracyNum/questionIds.length
        res.json({ computerAccuracy: accuracyRate }); 
    } catch (error) {
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.get('/', (req, res)=>{
    res.send('hello world')
})

app.listen(PORT, ()=>{
    console.log("Server is running")
})

