import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import {History, SocialScience, ComputerSecurity} from './schema.js'
import 'dotenv/config'
import OpenAI from "openai";



const app= express()
app.use(cors());
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
        const questions= await History.find()
        const num= questions.length
        let avgResponseTime=0;
        let minResponseTime=Number.MAX_VALUE;
        let maxResponseTime=0;
        let totalResponseTime=0;
        for(const question of questions){
            const id= question.id
            const startTime = Date.now()
            const response= await getOpenAIResponse(question.question)
            const endTime = Date.now()
            const responseTime = endTime - startTime;
            minResponseTime= Math.min(minResponseTime, responseTime)
            maxResponseTime= Math.max(maxResponseTime, responseTime)
            totalResponseTime+= responseTime

            if(response){
                await History.findByIdAndUpdate(id, {response: response})
            }else {
                res.status(500).json({ error: `Failed to get an answer for:${question.question}。` });
            }
        }
        avgResponseTime= totalResponseTime/num
        res.json({
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
        const questions= await SocialScience.find()
        const num= questions.length
        let avgResponseTime=0;
        let minResponseTime=Number.MAX_VALUE;
        let maxResponseTime=0;
        let totalResponseTime=0;
        for(const question of questions){
            const id= question.id
            const startTime = Date.now()
            const response= await getOpenAIResponse(question.question)
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
        const questions= await ComputerSecurity.find()
        const num= questions.length
        let avgResponseTime=0;
        let minResponseTime=Number.MAX_VALUE;
        let maxResponseTime=0;
        let totalResponseTime=0;
        for(const question of questions){
            const id= question.id
            const startTime = Date.now()
            const response= await getOpenAIResponse(question.question)
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
            avg: avgResponseTime,
            min: minResponseTime,
            max: maxResponseTime
        });
    }catch(error){
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.get('/history-accuracy', async(req,res)=>{
    try {
        const questions= await History.find()
        let accuracyNum=0
        for(const question of questions){
            const anticipatedAnswer= question.anticipatedAnswer
            const response= question.response
            if(anticipatedAnswer== response){
                accuracyNum+=1
            }
        }
        const accuracyRate= accuracyNum/questions.length
        res.json({ historyAccuracy: accuracyRate }); 
    } catch (error) {
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.get('/social-accuracy', async(req,res)=>{
    try {
        const questions= await SocialScience.find()
        let accuracyNum=0
        for(const question of questions){
            const anticipatedAnswer= question.anticipatedAnswer
            const response= question.response
            if(anticipatedAnswer== response){
                accuracyNum+=1
            }
        }
        const accuracyRate= accuracyNum/questions.length
        res.json({ socialAccuracy: accuracyRate }); 
    } catch (error) {
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.get('/computer-accuracy', async(req,res)=>{
    try {
        const questions= await ComputerSecurity.find()
        let accuracyNum=0
        for(const question of questions){
            const anticipatedAnswer= question.anticipatedAnswer
            const response= question.response
            if(anticipatedAnswer== response){
                accuracyNum+=1
            }
        }
        const accuracyRate= accuracyNum/questions.length
        res.json({ computerAccuracy: accuracyRate }); 
    } catch (error) {
        res.status(500).json({ error: `Something went wrong:${error}` });
    }
})

app.get('/', (req, res)=>{
    res.send('hello world')
})

