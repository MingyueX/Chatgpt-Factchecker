const CLAIMBUSTER_API_URL = 'https://idir.uta.edu/claimbuster/api/v2/score/text/';
const CLAIMBUSTER_API_KEY = '233df54ecb1842eb8f2845a722582f9f';

const GOOGLE_API_KEY = 'AIzaSyAiIFM0IcRbxkC1uHfeB3tXmVbmZLdZdvk';

const panelHTML = `
  <div class="div-2">ChatGPT Fact-Checker</div>
  <div 
    class="the-score-comes-from-claim-bust"
  >The score comes from ClaimBuster, ranges from 0 to 1, the higher the score, the more check-worthy the sentence.</div>
  <div class="div-3">FilterLevel <span class="sliderValue"></span></div>
  <div class="slidecontainer"><input type="range" min="0" max="1" value="0.5" step="0.05" class="slider"></div>
  <div class="div-4">Scored-Sentences</div>
  <div class="sentence-list">
  </div>
  <div class="div-16">Fact-Check</div>
  <select class="select" value="fact">
    <option value="fact">sentence</option>
    <option value="url">url</option>
  </select>
  <div class="input-container">
    <input
        type="text"
        placeholder="Select sentence from Results or Enter custom input"
        class="form-input"
        data-el="form-input"
    ></input>
    <button class="checkbutton">Check</button>
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
  .sentence-list {
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
  .checkbutton {
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
let panelCounter = 0;

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
            talkBlockToFactCheck = talkBlocks[talkBlocks.length - 1];
            addShowHelperButton(panelCounter);
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

function addShowHelperButton(id) {
    const FactCheckButton = generateButton('Display Fact-Check Helper');
    FactCheckButton.className = 'helper';
    FactCheckButton.setAttribute("index", id)
    FactCheckButton.addEventListener('click', showHidePanel);
    talkBlockToFactCheck.appendChild(FactCheckButton);
}

function showHidePanel(evt) {
    // const panel = document.getElementById('fact-check-panel');
    counter = evt.currentTarget.getAttribute("index");
    const panel = document.getElementsByClassName('check-panel')[counter];
    // const helperButton = document.getElementById('helper');
    const helperButton = document.getElementsByClassName('helper')[counter];
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        helperButton.innerText = 'Hide Fact-Check Helper';
    } else {
        panel.style.display = 'none';
        helperButton.innerText = 'Display Fact-Check Helper';
    }
}

async function createFactCheckPanel() {
    panelCounter++;

    let scoredSentences = new Map();
    let paragraphs = talkBlockToFactCheck.getElementsByTagName('p');

    for (let i = 0; i < paragraphs.length; i++) {
        let sentences = paragraphs[i].innerText.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);

        let results = await Promise.all(sentences.map((sentence) => fetchClaimBusterScore(sentence)));

        results.forEach((result, index) => {
            scoredSentences.set(result.score, generateSentence(sentences[index], result.score));
        });
    }

    const panel = document.createElement('div');
    panel.className = 'check-panel';
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

    // const checkButton = document.getElementById('checkbutton');
    const checkButton = document.getElementsByClassName('checkbutton')[panelCounter - 1];
    checkButton.addEventListener('click', async () => {
        // const factCheckResult = document.getElementById('result-list');
        if (document.getElementsByClassName('result-list') && document.getElementsByClassName('result-list').length > panelCounter - 1) {
            const factCheckResult = document.getElementsByClassName('result-list')[panelCounter - 1];
            factCheckResult.remove();
        }
        // const factInput = document.getElementById("form-input");
        const factInput = document.getElementsByClassName('form-input')[panelCounter - 1];
        const input = factInput.value;

        if (!input) {
            alert('Please include a fact to check.');
            return;
        }

        // const selectedOption = document.getElementById('select').value;
        const selectedOption = document.getElementsByClassName('select')[panelCounter - 1].value;
        if (selectedOption === 'fact') {
            try {
                const factCheckResult = await fetchGoogleFactCheck(input);
                if (factCheckResult.claims) {
                    let resultList = document.createElement('div');
                    resultList.className = 'result-list';
                    // resultList.id = 'result-list';
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
                    alert('There was no information regarding that fact. Maybe try being more specific?');
                }
            } catch (error) {
                alert('There was an error checking that fact. Please try again later.');
            }
        } else if (selectedOption === 'url') {
            const available = await isUrlAvailable(input);
            alert(`URL is ${available ? 'available' : 'not available'}`);
        }
    });

    // let slider = document.getElementById('slider');
    // let output = document.getElementById('sliderValue');
    let slider = document.getElementsByClassName('slider')[panelCounter - 1];
    let output = document.getElementsByClassName('sliderValue')[panelCounter - 1];
    output.innerHTML = slider.value;

    slider.oninput = function () {
        output.innerHTML = this.value;
        sentenceList.innerHTML = '';
        scoredSentences.forEach((sentence, score) => {
            if (score >= slider.value) {
                sentenceList.appendChild(sentence);
            }
        });
    }

    // let sentenceList = document.getElementById('sentence-list');
    let sentenceList = document.getElementsByClassName('sentence-list')[panelCounter - 1];

    scoredSentences.forEach((sentence, score) => {
        if (score >= slider.value) {
            sentenceList.appendChild(sentence);
        }
    });
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
    try {
        const response = await fetch(url, {
            method: 'HEAD', // Use HEAD request to minimize the amount of data transferred
            cache: 'no-store', // Do not use the cache to ensure a fresh request is sent
        });

        // Check if the status code is a success (2xx) or a redirection (3xx)
        console.log(response.status);
        return response.status >= 200 && response.status < 400;
    } catch (error) {
        // Return false in case of network errors or other issues
        return false;
    }
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
    scoredSentence.textContent = `[${score.toFixed(2)}] ${text}`;
    scoredSentence.onclick = () => {
        // document.getElementById("form-input").value = text;
        document.getElementsByClassName("form-input")[panelCounter - 1].value = text;
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
