app.get('/history', async(req, res)=>{
    const questions = [];
    fs.createReadStream('/Users/wzj/Downloads/prehistory_test.csv') 
        .pipe(csv({ headers: false }))
        .on('data', (row)=>{
            if(questions.length< 60){
                const question= `${row[0]}\nA: ${row[1]}\nB: ${row[2]}\nC:${row[3]}\nD:${row[4]}`
                const anticipatedAnswer= row[5]

                questions.push({
                    question,
                    anticipatedAnswer,
                    response: null
                })
            }
        })
        .on('end', async () => {
            try {
              // Insert questions into the collection
              await History.insertMany(questions);
              console.log('Questions inserted successfully');
              mongoose.connection.close();
            } catch (error) {
              console.error('Error inserting questions:', error);
            }
        });  
})

app.get('/social', async(req, res)=>{
    const questions = [];
    fs.createReadStream('/Users/wzj/Downloads/sociology_test.csv') 
        .pipe(csv({ headers: false }))
        .on('data', (row)=>{
            if(questions.length< 60){
                const question= `${row[0]}\nA: ${row[1]}\nB: ${row[2]}\nC:${row[3]}\nD:${row[4]}`
                const anticipatedAnswer= row[5]

                questions.push({
                    question,
                    anticipatedAnswer,
                    response: null
                })
            }
        })
        .on('end', async () => {
            try {
              // Insert questions into the collection
              await SocialScience.insertMany(questions);
              console.log('Questions inserted successfully');
              mongoose.connection.close();
            } catch (error) {
              console.error('Error inserting questions:', error);
            }
        });  
})

app.get('/computer', async(req, res)=>{
    const questions = [];
    fs.createReadStream('/Users/wzj/Downloads/computer_security_test.csv') 
        .pipe(csv({ headers: false }))
        .on('data', (row)=>{
            if(questions.length< 60){
                const question= `${row[0]}\nA: ${row[1]}\nB: ${row[2]}\nC:${row[3]}\nD:${row[4]}`
                const anticipatedAnswer= row[5]

                questions.push({
                    question,
                    anticipatedAnswer,
                    response: null
                })
            }
        })
        .on('end', async () => {
            try {
              // Insert questions into the collection
              await ComputerSecurity.insertMany(questions);
              console.log('Questions inserted successfully');
              mongoose.connection.close();
            } catch (error) {
              console.error('Error inserting questions:', error);
            }
        });  
})
