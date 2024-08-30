'use strict';

const fs = require('fs').promises;
const axios = require('axios');
const data = require ('./config.json');

const pathToFile = data["pathToFile"], // do not forget to switch prod/debug
    url = data["url"];
let modifiedString = '';

async function readFile(path) {
  try {
    const data = await fs.readFile(path, { encoding: 'utf8' });
    return data.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
} // reading file with phrases

let proceedString = async (string) => {

  const resultString = `${string[0]}${string[1]}${string[2]}`;
  const charsCount = [1, 3];

  let deepProceedString = (chars) => {
     modifiedString = string
        .substring(chars, string.length-1)
        .replace(/\\n/g, ' ')
        .replace(/\\n\\n/g, ' ')
        .replace(/\\"/g, '"')
        .replace(/ {2,}/g, " ");
    return modifiedString;
  }

  if (resultString === '": ') {
    deepProceedString(charsCount[1]);
    return modifiedString;
  }else{
    deepProceedString(charsCount[0]);
    return modifiedString;
  }
} // removing unnecessary chars from response

async function postToNode(phrase) {
  return await axios.post(url, {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: phrase }
    ]
  })
      .then(response => {
        let string = JSON
            .stringify(response.data["choices"][0].message.content);
        proceedString(string);
        console.log(`${modifiedString}\n`);
      })
      .catch(error => {
        throw error;
      });
} // post to node

let isRunning = true;

(async () => {
  const dataArr = await readFile(pathToFile);

  while (isRunning) {
    for (const phrase of dataArr) {
      try {
        await postToNode(phrase);
        // Add a delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error handling phrase "${phrase}": ${error}`);
      }
    }
  }
})(); // postToNode in infinite loop
