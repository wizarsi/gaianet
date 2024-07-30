'use strict';

const fs = require('fs').promises;
const https = require('https');

const data = require ('./config.json');
const pathToFile = data["pathToFile"],
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

function postToNode(phrase) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: phrase }
      ]
    });

    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`${data}\n`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Error posting to node: ${e}`);
      reject(e);
    });

    req.write(postData);
    req.end();
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
