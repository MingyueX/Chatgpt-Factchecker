# Chatgpt-Factchecker

Chatgpt-Factchecker is a chrome extension that helps user fact-check the output from chatgpt.

## Installation

1. Clone this repository to your local machine.
2. Open the browser and navigate to the extensions page.
3. Enable developer mode and click on the "Load unpacked" button.
4. Select the folder containing the cloned repository.

## Usage

Before using the extension demo, make sure to start the Flask server by running `python3 fact_checker_api.py` on your local machine.

Once installed, a Fact-Check Helper will be available at the bottom of the last chatbox.

You can use it to filter out sentences to perform fact-check or fact-check a custom sentence.


## Citation

This project makes use of a well performing NLI model on the Hugging Face Hub: https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli

Citation:
Laurer, Moritz, Wouter van Atteveldt, Andreu Salleras Casas, and Kasper Welbers. 2022. ‘Less Annotating, More Classifying – Addressing the Data Scarcity Issue of Supervised Machine Learning with Deep Transfer Learning and BERT - NLI’. Preprint, June. Open Science Framework. https://osf.io/74b8k.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.