import { Configuration, OpenAIApi } from 'openai'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

// Configure OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // https://platform.openai.com/account/api-keys
})
const openai = new OpenAIApi(configuration)

// Uploads the data.jsonl training file to OpenAI website
const upload = async () => {
    const response = await openai.createFile(fs.createReadStream('data.jsonl'), 'fine-tune')

    return response.data
}

// Trains a model with the use of the uploaded file
const createModel = async (id) => {
    const response = await openai.createFineTune({
        training_file: id, // the id of the uploaded file
        model: 'davinci', // sub-model to use for fine-tuning, existing model supported by OpenAI
    })

    return response.data
}

// Lists all the models on your OpenAI account
const models = async () => {
    const response = await openai.listModels()
    return response
}

const test = async (model) => {
    const prompt = 'Is there any way to get a discount?' // Same as typing it into ChatGPT site

    try {
        const completion = await openai.createCompletion({
            model: model,
            prompt: prompt,
            max_tokens: 50, // The maximum number of tokens to return
            temperature: 0.7, // 0 - 1 indicating the randomness of the completion
            frequency_penalty: 0.2, // 0 - 1 indicating the degree to which the model should avoid highly-used words
            presence_penalty: 0.2, // 0 - 1 indicating the degree to which the model should avoid words that don't appear in the prompt
        })

        let result = ''

        for (let i = 0; i < completion.data.choices.length; i++) {
            result += completion.data.choices[i].text + '\n'
        }

        return result
    } catch (error) {
        console.error(error)
    }
}

// Create a new model from the training data and log it's id
const newModel = () => {
    upload().then((file) => {
        createModel(file.id).then((model) => console.log(model)) // Save the ID somewhere for later use
    })
}

const run = () => {
    models().then((res) => {
        // The id of the newest model
        const model_id = res.data.data[res.data.data.length - 1].id
        test(model_id).then((res) => {
            console.log(res)
        })
    })
}

// newModel() // Create model
run() // Test model
