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
        let totalResponseTime=0;
        for(const question of questions){
            const id= question.id
            const startTime = Date.now()
            const response= await getOpenAIResponse(question.question)
            const endTime = Date.now()
            const responseTime = endTime - startTime;
            minResponseTime= Math.min(minResponseTime, responseTime)
            totalResponseTime+= responseTime

            if(response){
                await History.findByIdAndUpdate(id, {response: response})
            }else {
                console.log(`Failed to get an answer for: ${question.question}`);
            }
        }
        avgResponseTime= totalResponseTime/num
        console.log("avg:",avgResponseTime, ' min:',minResponseTime,)
        res.send("Done")
    }catch(error){
        console.error('Error fetching entries:', error);
    }
})

app.get('/social-science', async(req,res)=>{
    try{
        const questions= await SocialScience.find()
        const num= questions.length
        let avgResponseTime=0;
        let minResponseTime=Number.MAX_VALUE;
        let totalResponseTime=0;
        for(const question of questions){
            const id= question.id
            const startTime = Date.now()
            const response= await getOpenAIResponse(question.question)
            const endTime = Date.now()
            const responseTime = endTime - startTime;
            minResponseTime= Math.min(minResponseTime, responseTime)
            totalResponseTime+= responseTime

            if(response){
                await SocialScience.findByIdAndUpdate(id, {response: response})
            }else {
                console.log(`Failed to get an answer for: ${question.question}`);
            }
        }
        avgResponseTime= totalResponseTime/num
        console.log("avg:",avgResponseTime, ' min:',minResponseTime,)
        res.send("Done")
    }catch(error){
        console.error('Error fetching entries:', error);
    }
})


app.get('/computer-security', async(req,res)=>{
    try{
        const questions= await ComputerSecurity.find()
        const num= questions.length
        let avgResponseTime=0;
        let minResponseTime=Number.MAX_VALUE;
        let totalResponseTime=0;
        for(const question of questions){
            const id= question.id
            const startTime = Date.now()
            const response= await getOpenAIResponse(question.question)
            const endTime = Date.now()
            const responseTime = endTime - startTime;
            minResponseTime= Math.min(minResponseTime, responseTime)
            totalResponseTime+= responseTime

            if(response){
                await ComputerSecurity.findByIdAndUpdate(id, {response: response})
            }else {
                console.log(`Failed to get an answer for: ${question.question}`);
            }
        }
        avgResponseTime= totalResponseTime/num
        console.log("avg:",avgResponseTime, ' min:',minResponseTime,)
        res.send("Done")
    }catch(error){
        console.error('Error fetching entries:', error);
    }
})

app.get('/history-accuracy', async(req,res)=>{
    const questions= await History.find()
    let accuracyNum=0
    for(const question of questions){
        const anticipatedAnswer= question.anticipatedAnswer
        const response= question.response
        if(anticipatedAnswer== response){
            accuracyNum+=1
        }
    }
    const msg= "the accracy rate is: "+ accuracyNum/questions.length
    res.send(msg) //0.75
})

app.get('/social-accuracy', async(req,res)=>{
    const questions= await SocialScience.find()
    let accuracyNum=0
    for(const question of questions){
        const anticipatedAnswer= question.anticipatedAnswer
        const response= question.response
        if(anticipatedAnswer== response){
            accuracyNum+=1
        }
    }
    const msg= "the accracy rate is: "+ accuracyNum/questions.length
    res.send(msg) // 0.8
})

app.get('/computer-accuracy', async(req,res)=>{
    const questions= await ComputerSecurity.find()
    let accuracyNum=0
    for(const question of questions){
        const anticipatedAnswer= question.anticipatedAnswer
        const response= question.response
        if(anticipatedAnswer== response){
            accuracyNum+=1
        }
    }
    const msg= "the accracy rate is: "+ accuracyNum/questions.length
    res.send(msg) // 0.783
})

app.get('/', (req, res)=>{
    res.send('hello world')
})


app.listen(PORT, ()=>{
    console.log("Server is running")
})