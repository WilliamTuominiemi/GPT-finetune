const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");

const configuration = new Configuration({
    organization: "org-xxx",
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const models = async () => {
    const response = await openai.listModels();
    return response;
};

async function upload() {
    const response = await openai.createFile(
        fs.createReadStream("joke.jsonl"),
        "fine-tune"
    );

    return response.data;
}

async function createModel(id) {
    const response = await openai.createFineTune({
        training_file: id,
        model: "davinci",
    });

    return response.data;
}

const newModel = () => {
    upload().then((file) => {
        createModel(file.id).then((model) => {
            console.log(model);
        });
    });
};

async function getRes(model) {
    const question = "Why did the chicken cross the road?";
    console.log("\x1b[35m%s\x1b[0m", question);
    const completion = await openai.createCompletion({
        model: model,
        prompt: question,
        max_tokens: 50,
        temperature: 0.7,
        frequency_penalty: 0.2,
        presence_penalty: 0.2,
    });

    let result;
    for (let i = 0; i < completion.data.choices.length; i++) {
        result += completion.data.choices[i].text + "\n";
    }
    return result;
}

async function getModel(id) {
    const response = await openai.retrieveFineTune(id);

    return response.data;
}

const run = () => {
    models().then((res) => {
        // console.log(res.data.data[res.data.data.length - 1]);
        getRes(res.data.data[res.data.data.length - 1].id).then((res) => {
            console.log(res);
            fs.writeFile("result.jsonl", JSON.stringify({ res }), (err) => {
                if (err) throw err;
            });
        });
    });
};

// newModel();

run();
