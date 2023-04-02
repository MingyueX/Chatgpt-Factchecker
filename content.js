const CLAIMBUSTER_API_URL = 'https://idir.uta.edu/claimbuster/api/v2/score/text/';
const CLAIMBUSTER_API_KEY = '233df54ecb1842eb8f2845a722582f9f';

const panelHTML = `
  <div class="div-2">ChatGPT Fact-Checker</div>
  <div 
    class="the-score-comes-from-claim-bust"
  >The score comes from ClaimBuster, ranges from 0 to 1, the higher the score, the more check-worthy the sentence.</div>
  <div class="div-3">FilterLevel <span id="sliderValue"></span></div>
  <div class="slidecontainer"><input type="range" min="0" max="1" value="0.5" step="0.05" class="slider" id="sliderRange"></div>
  <div class="div-4">Results</div>
  <div class="div-5" id="sentence-list">
  </div>
  <div class="div-16">Fact-Check</div>
  <input
    type="text"
    placeholder="Select sentence from Results or Enter custom input"
    id="fact-check input"
    class="form-input"
    data-el="form-input"
  ></input>
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
    height: 200px;
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
  .form-input {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    padding-top: 8px;
    padding-bottom: 8px;
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
            talkBlockToFactCheck = talkBlocks[talkBlocks.length - 1];
            addGetScoreButton();
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

    for (let i = 0; i < paragraphs.length; i++) {
        let sentences = paragraphs[i].innerText.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);

        let results = await Promise.all(sentences.map((sentence) => fetchClaimBusterScore(sentence)));

        results.forEach((result, index) => {
            scoredSentences.set(result.score, generateSentence(sentences[index], result.score));
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
    color: white;
    `;

    const checkButton = document.createElement('button');
    checkButton.textContent = 'Check';
    checkButton.style.cssText = `
    display: flex;
    justify-content: flex-center;
    align-items: flex-center;
    border-radius: 5px;
    border: 1px solid #d1d5db;
    padding-top: 7px;
    padding-right: 10px;
    padding-bottom: 7px;
    padding-left: 10px;
    margin: 0 auto;
    margin-top: 8px;
    text-weight: bold;
    `;
    checkButton.addEventListener('click', () => { });
    panel.appendChild(checkButton);

    talkBlockToFactCheck.appendChild(panel);

    let slider = document.getElementById('sliderRange');
    let output = document.getElementById('sliderValue');
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

    let sentenceList = document.getElementById('sentence-list');

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
