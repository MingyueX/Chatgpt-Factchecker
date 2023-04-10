# ChatGPT Fact-Checker

ChatGPT Fact-Checker is a chrome extension that helps the user fact-check the output from OpenAI's ChatGPT. This project is currently not publicly published and is in its demo stage.

## Pre-requisite

Need python installed with packages

`python3 -m pip install bs4` <br />
`python3 -m pip install transformers` <br />
`python3 -m pip install torch` <br />
`python3 -m pip install requests` <br />
`python3 -m pip install spacy` <br />
`python3 -m pip install scikit-learn` <br />

Then 

`python3 -m spacy download en_core_web_sm`

Please also replace the `OPENAI_API_KEY` in `fact_checker.py` with your personal secret apiKey (has to be with a paid plan)

For <ins>cs492 project reviewers</ins>, an available apiKey is provided in the 1-page deliverable

## Installation

1. Clone this repository to your local machine.
2. Open the browser and navigate to the extensions page.
3. Enable developer mode and click on the "Load unpacked" button.
4. Select the folder containing the cloned repository.

Further information about loading an unpacked extension can be found here: https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked

## Usage

Before using the extension demo, make sure to start the Flask server by running `python3 fact_checker_api.py` on your local machine terminal console.

It will take several minutes to install for the first run. 

Once installed, a Fact-Check Helper will be available at the bottom of the last chatbox.

You can use it to filter out sentences to perform fact-check or fact-check a custom sentence.


## Citation

This project makes use of a well performing NLI model on the Hugging Face Hub: https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli

Citation:
Laurer, Moritz, Wouter van Atteveldt, Andreu Salleras Casas, and Kasper Welbers. 2022. ‘Less Annotating, More Classifying – Addressing the Data Scarcity Issue of Supervised Machine Learning with Deep Transfer Learning and BERT - NLI’. Preprint, June. Open Science Framework. https://osf.io/74b8k.

## Features under development

- Fact check on citations

    Plan: Analyze info from [Crossref](https://www.crossref.org/documentation/retrieve-metadata/rest-api/a-non-technical-introduction-to-our-api/) and [Google Scholar](https://pypi.org/project/scholarly/)
    
- Check code snippet

    Plan: Verify with the software verification language [Dafny](https://dafny.org/)
    
    Existing research: https://patricklam.ca/papers/22.hatra.copilot-verifiability.pdf

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
