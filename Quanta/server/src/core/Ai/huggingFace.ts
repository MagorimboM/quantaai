import { InferenceClient } from '@huggingface/inference';

/*
Qaunta AI: Quanta AI turns company policy documents into an always available,
 instantly searchable, scenario aware QS companion that helps John quantify accurately and completely every single time. 
 */
const client = new InferenceClient(process.env.HF_TOKEN);

export { client };
