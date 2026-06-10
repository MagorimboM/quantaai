import OpenAi from 'openai';

/*
Qaunta AI: Quanta AI turns company policy documents into an always available,
 instantly searchable, scenario aware QS companion that helps John quantify accurately and completely every single time. 
 */

const openAi = new OpenAi({
  apiKey: process.env.OPEN_AI_KEY,
});

export { openAi };
