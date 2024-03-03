const { ActivityHandler, MessageFactory } = require('botbuilder');
const OPENAI_COMPLETION_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const axios = require('axios');
const model = "gpt-3.5-turbo";
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

console.log('Bearer ' +OPENAI_API_KEY)


// let getCompletion = async function(text){
//     const data = {
//         messages:[
//             {
//                 role: 'user',
//                 content: text
//             }
//         ]   
//     };
//     const res = await axios({
//         method: 'post',
//         url: OPENAI_COMPLETION_URL,
//         headers: {
//           'Authorization': `Bearer ' +OPENAI_API_KEY,
//           'Content-Type': 'application/json',
//         },
//         data
//     });
//     return (res.data.choices[0] || []).message?.content;
// };


// async function getCompletion(text, model) {
//     const data = {
//       messages: [{ role: "user", content: text }],
//       model,
//     };
  
//     const headers = {
//       'Authorization': 'Bearer ' +OPENAI_API_KEY,
//       'Content-Type': 'application/json',
//     };
    
//     const response = await axios.post(OPENAI_COMPLETION_URL, data, { headers });
  
//     if (response.status !== 200) {
//       throw new Error(`Error fetching completion from OpenAI: ${response.statusText}`);
//     }

//     return response.data.choices[0].text;
// };

// async function getCompletion(text, model) {
//     const data = {
//       messages: [{ role: "user", content: text }],
//       model,
//     };
  
//     const headers = {
//       'Authorization': `Bearer ${OPENAI_API_KEY}`,
//       'Content-Type': 'application/json',
//     };
  
//     try {
//       const response = await axios.post(OPENAI_COMPLETION_URL, data, { headers });
  
//       if (response.status !== 200) {
//         throw new Error(`Error fetching completion from OpenAI: ${response.statusText}`);
//       }
  
//       const completion = response.data.choices[0];
  
//       if (!completion || !completion.text) {
//         throw new Error('Unexpected API response format: missing completion text.');
//       }
  
//       return completion.text; // Return the entire completion text by default
//     } catch (error) {
//       console.error('Error retrieving completion:', error);
  
//       // Log detailed error messages or provide user-friendly prompts
//       return null; // Or return a more suitable value based on your API usage
//     }
//   }

async function getCompletion(text) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: text }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content
}

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            try{
                const replyText = await getCompletion(context.activity.text);
                await context.sendActivity(replyText);
            } catch(e){
                console.log(e);
            }
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
