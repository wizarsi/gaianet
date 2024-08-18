'use strict';

const fs = require('fs').promises;
const axios = require('axios');
const data = require ('./config.json');

const pathToFile = data["pathToFile"], // do not forget to switch prod/debug
    url = data["url"];

async function readFile(path) {
  try {
    const data = await fs.readFile(path, { encoding: 'utf8' });
    return data.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    process.exit(1);
  }
}

async function postToNode(phrase) {
  return await axios.post(url, {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: phrase }
    ]
  })
      .then(response => {
        let str = JSON.stringify(response.data["choices"][0].message.content);
        str = str.substring(3, str.length-1);
        console.log(`${str}\n`);
      })
      .catch(error => {
        console.error(`Error posting to node: ${error.message}\n`);
        throw error;
      });
}

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
})();
