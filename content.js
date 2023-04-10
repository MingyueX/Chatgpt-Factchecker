const CLAIMBUSTER_API_URL = 'https://idir.uta.edu/claimbuster/api/v2/score/text/';
const CLAIMBUSTER_API_KEY = '233df54ecb1842eb8f2845a722582f9f';

const GOOGLE_API_KEY = 'AIzaSyAiIFM0IcRbxkC1uHfeB3tXmVbmZLdZdvk';

const panelHTML = `
  <div class="div-2">ChatGPT Fact-Checker</div>
  <div 
    class="the-score-comes-from-claim-bust"
  >The score comes from ClaimBuster, ranges from 0 to 1, the higher the score, the more check-worthy the sentence.</div>
  <div class="div-3">FilterLevel <span id="sliderValue"></span></div>
  <div class="slidecontainer"><input type="range" min="0" max="1" value="0.3" step="0.05" class="slider" id="sliderRange"></div>
  <div class="div-4">Scored-Sentences</div>
  <div class="div-5" id="sentence-list">
  </div>
  <div class="div-6" id="url-title">URLs</div>
  <div class="div-7" id="url-list">
  </div>
  <div class="div-16">Fact-Check</div>
  <select class="select" id="fact-check select" value="fact">
    <option value="fact">sentence</option>
    <option value="url">url</option>
  </select>
  <div class="input-container">
    <input
        type="text"
        placeholder="Select sentence from Results or Enter custom input"
        id="fact-check input"
        class="form-input"
        data-el="form-input"
        autocomplete="off"
    ></input>
    <button id="checkbutton" class="check-button">Check</button>
  </div>
<style>
  .div-2 {
    max-width: 100%;
    color: rgba(255, 255, 255, 1);
    font-size: 20px;
    letter-spacing: 0%;
    text-align: left;
    font-family: "Ubuntu Mono", sans-serif;
    font-weight: bold;
  }
  .the-score-comes-from-claim-bust {
    max-width: 100%;
    align-self: stretch;
    width: 727px;
    opacity: 0.6;
    line-height: 1.2;
    color: rgba(255, 255, 255, 1);
    font-size: 15px;
    text-align: left;
    font-family: "Ubuntu Mono", sans-serif;
  }
  .div-3 {
    max-width: 100%;
    margin-top: 8px;
    color: rgba(255, 255, 255, 1);
    font-size: 15px;
    letter-spacing: 0%;
    text-align: left;
    font-family: "Ubuntu Mono", sans-serif;
    font-weight: bold;
  }
  .div-4 {
    max-width: 100%;
    margin-top: 8px;
    color: rgba(255, 255, 255, 1);
    font-size: 15px;
    letter-spacing: 0%;
    text-align: left;
    font-family: "Ubuntu Mono", sans-serif;
    font-weight: bold;
  }
  .div-5 {
    display: flex;
    margin-top: 8px;
    flex-direction: column;
    max-width: 100%;
    justify-content: flex-start;
    align-self: stretch;
    align-items: center;
    overflow-y: auto;
    max-height: 160px;
  }
  .div-6 {
    max-width: 100%;
    margin-top: 8px;
    color: rgba(255, 255, 255, 1);
    font-size: 15px;
    letter-spacing: 0%;
    text-align: left;
    font-family: "Ubuntu Mono", sans-serif;
    font-weight: bold;
  }
  .div-7 {
    display: flex;
    margin-top: 8px;
    flex-direction: column;
    max-width: 100%;
    justify-content: flex-start;
    align-self: stretch;
    align-items: center;
    overflow-y: auto;
    max-height: 160px;
  }
  .div-16 {
    max-width: 100%;
    margin-top: 8px;
    color: rgba(255, 255, 255, 1);
    font-size: 15px;
    letter-spacing: 0%;
    text-align: left;
    font-family: "Ubuntu Mono", sans-serif;
    font-weight: bold;
  }
  .select {
    margin-top: 8px;
    padding-top: 2px;
    padding-bottom: 2px;
    padding-left: 5px;
    padding-right: 5px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.2);
    width: 20%;
  }
  .input-container {
    display: flex;
    flex-direction: row;
    margin-top: 8px;
    max-width: 100%;
    align-self: stretch;
    justify-content: space-between;
  }
  .check-button {
    justify-content: flex-center;
    align-items: flex-center;
    border-radius: 5px;
    border: 1px solid #d1d5db;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 5px;
    padding-right: 5px;
    margin: 0 auto;
    text-weight: bold;
  }

  .form-input {
    display: flex;
    flex-grow: 1;
    margin-right: 8px;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 5px;
    padding-right: 5px;
    border-radius: 4px;
    max-width: 100%;
    align-self: stretch;
    background-color: rgba(255, 255, 255, 0.20000000298023224);
  }
  .slidecontainer {
    width: 100%;
  }
  .slider {
      -webkit-appearance: none;
      width: 100%;
      height: 8px;
      border-radius: 5px;
      background: #d3d3d3;
      outline: none;
      opacity: 0.8;
      -webkit-transition: .2s;
      transition: opacity .2s;
  }
  .slider:hover {
      opacity: 1;
  }
  .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #74AA9C;
      cursor: pointer;
  }
  .slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #74AA9C;
      cursor: pointer;
  }
</style>
`;


const main = document.querySelector('body');
let talkBlockToFactCheck;
let mutationObserverTimer = undefined;

const obs = new MutationObserver(() => {
    // const talkBlocks = document.querySelectorAll('.markdown.prose.w-full.break-words.dark\\:prose-invert.dark');
    const talkBlocks = document.querySelectorAll('[class^=markdown]');
    if (!talkBlocks || !talkBlocks.length) {
        return;
    }

    clearTimeout(mutationObserverTimer);
    mutationObserverTimer = setTimeout(() => {
        stop();

        if (talkBlockToFactCheck != talkBlocks[talkBlocks.length - 1]) {
            if (document.getElementById('fact-check-panel')) {
                document.getElementById('fact-check-panel').remove();
            }
            if (document.getElementById('helper')) {
                document.getElementById('helper').remove();
            }
            talkBlockToFactCheck = talkBlocks[talkBlocks.length - 1];
            // addGetScoreButton();
            addShowHelperButton();
            createFactCheckPanel();
        }

        start();
    }, 600);
});

function addGetScoreButton() {
    const GetScoreButton = generateButton('Get ClaimBuster Score');
    GetScoreButton.addEventListener('click', CheckScore);
    talkBlockToFactCheck.appendChild(GetScoreButton);
}

function addShowHelperButton() {
    const FactCheckButton = generateButton('Display Fact-Check Helper');
    FactCheckButton.id = 'helper';
    FactCheckButton.addEventListener('click', showHidePanel);
    talkBlockToFactCheck.appendChild(FactCheckButton);
}

function showHidePanel() {
    const panel = document.getElementById('fact-check-panel');
    const helperButton = document.getElementById('helper');
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        helperButton.innerText = 'Hide Fact-Check Helper';
    } else {
        panel.style.display = 'none';
        helperButton.innerText = 'Display Fact-Check Helper';
    }
}

async function createFactCheckPanel() {
    let scoredSentences = new Map();
    let paragraphs = talkBlockToFactCheck.getElementsByTagName('p');
    let urls = talkBlockToFactCheck.getElementsByTagName('a');

    for (let i = 0; i < paragraphs.length; i++) {
        let sentences = paragraphs[i].innerText.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);

        let results = await Promise.all(sentences.map((sentence) => fetchClaimBusterScore(sentence)));

        results.forEach((result, index) => {
            scoredSentences.set(generateSentence(sentences[index], result.score), result.score);
        });
    }

    const panel = document.createElement('div');
    panel.id = 'fact-check-panel';
    panel.innerHTML = panelHTML;

    panel.style.cssText = `
    display: none;
    margin-top: 8px;
    flex-direction: column;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 20px;
    padding-top: 15px;
    padding-right: 15px;
    padding-bottom: 15px;
    padding-left: 15px;
    background-color: rgba(0, 14, 32, 1);
    `;

    talkBlockToFactCheck.appendChild(panel);

    const checkButton = document.getElementById('checkbutton');
    checkButton.addEventListener('click', async () => {
        if (document.getElementById('result-list')) {
            document.getElementById('result-list').remove();
        }
        if (document.getElementById('fact-check-result')) {
            document.getElementById('fact-check-result').remove();
        }
        if (document.getElementById('ext-resource')) {
            document.getElementById('ext-resource').remove();
        }
        if (document.getElementById('url-info')) {
            document.getElementById('url-info').remove();
        }
        const factInput = document.getElementById("fact-check input");
        const input = factInput.value;

        if (!input) {
            alert('Please include a fact to check.');
            return;
        }

        const selectedOption = document.getElementById('fact-check select').value;
        if (selectedOption === 'fact') {
            try {
                // Create the temporary "Fact-checking..." message element
                let tempMessage = document.createElement('div');
                tempMessage.id = 'fact-check-temp-message';
                tempMessage.innerHTML = '<p style="margin:0;"><strong>Fact-checking...Please wait for the result.</strong></p>';
                panel.appendChild(tempMessage);

                const checkResult = await verifyFact(input);
                console.log(checkResult);

                // Remove the temporary message element
                tempMessage.parentNode.removeChild(tempMessage);

                var output;
                if (checkResult.result === 'No evidence found') {
                    output = "Cannot verify this statement. No evidence found."
                } else {
                    let evidenceLinks = checkResult.evidence.map(url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`).join('<br>');
                    output = `This statement is likely to be ${checkResult.result}.<br>Confidence: ${checkResult.score}%.${checkResult.evidence.length == 0 ? "" : "<br>Evidence:<br>"}${evidenceLinks}`;
                }
                let res = document.createElement('div');
                res.id = 'fact-check-result';
                res.innerHTML = `<p style="margin:0;"><strong>${output}</strong></p>`;
                panel.appendChild(res);

                const factCheckResult = await fetchGoogleFactCheck(input);
                if (factCheckResult.claims) {
                    let ext_resource = document.createElement('div');
                    ext_resource.id = 'ext-resource';
                    ext_resource.innerHTML = `<p style="margin:0;"><strong>Extensive Resources from Google fact-checker:</strong></p>`;
                    panel.appendChild(ext_resource);

                    let resultList = document.createElement('div');
                    resultList.className = 'result-list';
                    resultList.id = 'result-list';
                    factCheckResult.claims.forEach((claim) => {
                        let review = claim.claimReview[0];
                        let factCheckStatus = review.textualRating;
                        let factCheckSource = review.publisher.site;
                        let factCheckUrl = review.url;

                        let resultDiv = document.createElement('div');
                        resultDiv.innerHTML = `<p style="margin:0;"><strong>${factCheckSource}</strong></p><p style="margin:0;"><a href="${factCheckUrl}" target="_blank">${claim.text} <i class="external-link-icon">&#x1F517;</i></a></p><p style="margin:0; margin-top:5px"><span class="status">${factCheckStatus}</span></p>`;
                        resultDiv.style.cssText = `
                    flex-direction: column;
                    align-self: stretch;
                    margin-bottom: 10px;
                    max-width: 100%;
                    background-color: #1F2937;
                    border-radius: 5px;
                    padding-top: 2px;
                    padding-right: 5px;
                    padding-bottom: 5px;
                    padding-left: 5px;
                    line-height: 1.5;
                    `;

                        let status = resultDiv.getElementsByClassName('status')[0];
                        status.style.cssText = `
                    border-radius: 5px;
                    weight: bold;
                    padding-top: 2px;
                    padding-right: 5px;
                    padding-bottom: 2px;
                    padding-left: 5px;
                    color: white;
                    `;

                        if (factCheckStatus === 'False') {
                            status.style.backgroundColor = '#9C0000';
                        } else if (factCheckStatus === 'True') {
                            status.style.backgroundColor = '#5C877C';
                        } else {
                            status.style.backgroundColor = '#DBA925';
                        }


                        resultList.appendChild(resultDiv);
                    });

                    resultList.style.cssText = `
                display: flex;
                margin-top: 8px;
                flex-direction: column;
                max-width: 100%;
                justify-content: flex-start;
                align-self: stretch;
                align-items: center;
                overflow-y: auto;
                max-height: 140px;
                `;

                    panel.appendChild(resultList);

                } else {
                    console.log('There was no information regarding that fact. Maybe try being more specific?');
                }
            } catch (error) {
                alert('There was an error checking that fact. Please try again later.');
                if (document.getElementById('fact-check-temp-message')) {
                    document.getElementById('fact-check-temp-message').remove();
                }
            }
        } else if (selectedOption === 'url') {
            // Create the temporary "checking..." message element
            let tempMessage = document.createElement('div');
            tempMessage.id = 'url-check-temp-message';
            tempMessage.innerHTML = '<p style="margin:0;"><strong>Checking URL...Please wait for the result.</strong></p>';
            panel.appendChild(tempMessage);

            const available = await isUrlAvailable(input);

            tempMessage.parentNode.removeChild(tempMessage);

            let url_info = document.createElement('div');
            url_info.id = 'url-info';
            let output = `URL is ${available ? 'available' : 'not available'}`;
            url_info.innerHTML = `<p style="margin:0;"><strong>${output}</strong></p>`;
            panel.appendChild(url_info);
        }
    });

    let slider = document.getElementById('sliderRange');
    let output = document.getElementById('sliderValue');
    output.innerHTML = slider.value;

    slider.oninput = function () {
        output.innerHTML = this.value;
        sentenceList.innerHTML = '';
        scoredSentences.forEach((score, sentence) => {
            if (score >= slider.value) {
                sentenceList.appendChild(sentence);
            }
        });
    }

    let sentenceList = document.getElementById('sentence-list');

    scoredSentences.forEach((score, sentence) => {
        if (score >= slider.value) {
            sentenceList.appendChild(sentence);
        }
    });

    let urlTitle = document.getElementById('url-title');
    let urlList = document.getElementById('url-list');
    if (urls.length > 0) {
        for (let i = 0; i < urls.length; i++) {
            urlList.appendChild(generateSentence(urls[i].getAttribute("href"), -1));
        }
    } else {
        urlTitle.innerHTML = '';
    }
}

async function CheckScore() {
    let sentences = [];
    let results = [];
    let paragraphs = [];

    paragraphs = talkBlockToFactCheck.getElementsByTagName('p');
    console.log(paragraphs);

    for (let i = 0; i < paragraphs.length; i++) {
        sentences = paragraphs[i].innerText.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);

        results = await Promise.all(sentences.map((sentence) => fetchClaimBusterScore(sentence)));

        paragraphs[i].innerText = '';

        results.forEach((result, index) => {
            console.log(result);
            paragraphs[i].innerText += `${sentences[index]} `;
            paragraphs[i].innerText += `[${result.score.toFixed(2)}]`;
        });
    }
}

async function verifyFact(statement) {
    const response = await fetch("http://127.0.0.1:5000/fact_check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ statement }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
}

async function fetchGoogleFactCheck(query) {
    console.log(query);
    const response = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?` + new URLSearchParams({
        key: GOOGLE_API_KEY,
        query: query,
        languageCode: 'en-US',
    }));
    console.log(response);
    const result = await response.json();
    return result;
}

async function isUrlAvailable(url) {
    const response = await fetch("http://127.0.0.1:5000/url_check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const res = await response.json();
    return res.result;
}

function generateButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.border = "1px solid #d1d5db";
    button.style.borderRadius = "5px";
    button.style.padding = "0.3rem 0.8rem";
    button.style.margin = "0.3rem";
    return button;
}

function generateSentence(text, score) {
    const scoredSentence = document.createElement('botton');
    scoredSentence.textContent = `${score < 0 ? "" : "[" + score.toFixed(2) + "] "}${text}`;
    scoredSentence.onclick = () => {
        document.getElementById("fact-check input").value = text;
    };

    scoredSentence.style.cssText = `
    max-width: 100%;
    align-self: stretch;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.20000000298023224);
    padding-top: 2px;
    padding-bottom: 2px;
    padding-right: 5px;
    padding-left: 5px;
    margin-top: 5px;
    flex-direction: column;
    display: flex;
    line-height: 1.3;
    cursor: pointer;
    `;

    return scoredSentence;
}

function splitIntoSentences(text) {
    return text
        .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
        .split('|')
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0);
}

async function fetchClaimBusterScore(text) {
    const response = await fetch(CLAIMBUSTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAIMBUSTER_API_KEY,
        },
        body: JSON.stringify({ input_text: text }, null, 2),
    });

    const result = await response.json();
    return result.results[0];
}

const start = () => {
    obs.observe(main.parentElement, {
        childList: true,
        attributes: true,
        subtree: true,
    });
};

const stop = () => {
    obs.disconnect();
};

start();