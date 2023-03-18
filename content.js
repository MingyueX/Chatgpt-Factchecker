
let talkBlockToFactCheck;

const main = document.querySelector("body");

let mutationObserverTimer = undefined;

const obs = new MutationObserver(() => {
    const talkBlocks = document.querySelectorAll(
        ".text-base.gap-4.md\\:gap-6.m-auto.md\\:max-w-2xl.lg\\:max-w-2xl.xl\\:max-w-3xl.p-4.md\\:py-6.flex.lg\\:px-0:not(.custom-buttons-area)"
    );
    if (!talkBlocks || !talkBlocks.length) {
        return;
    }

    clearTimeout(mutationObserverTimer);
    mutationObserverTimer = setTimeout(() => {

        stop();

        if (talkBlockToFactCheck != talkBlocks[talkBlocks.length - 1]) {

            talkBlockToFactCheck = talkBlocks[talkBlocks.length - 1];

            factCheck();
        }

        start();

    }, 600);

    async function factCheck() {
        let chatgptOutput = talkBlockToFactCheck.innerText;

        const CLAIMBUSTER_API_ENDPOINT = 'https://idir.uta.edu/claimbuster/api/v2/score/text/';

        const response = await fetch(CLAIMBUSTER_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': "233df54ecb1842eb8f2845a722582f9f"
            },
            body: JSON.stringify({
                'input_text': chatgptOutput
            }, null, 2)
        });

        const data = await response.json();
        console.log(data);
        const score = data.results[0].score;

        const claimScoreElement = document.createElement("span");
        claimScoreElement.style.color =
            score > 0.5 ? "green" : "red";
        claimScoreElement.textContent = ` (Claim Score: ${score ? score.toFixed(
            2
        ) : "N/A"})`;

        // append the claim score to the chatgpt response
        talkBlockToFactCheck.appendChild(claimScoreElement);

    }
});

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


