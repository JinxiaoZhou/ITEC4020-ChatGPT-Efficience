


const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "hi",
        },
    ],
});

console.log(completion.choices[0].message);