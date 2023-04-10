from fact_checker import check_fact_with_evidence, gather_evidence
from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/fact_check", methods=["POST"])
def check_fact_api():
    data = request.get_json()
    statement = data.get("statement", "")
    evidence = gather_evidence(statement)
    result = check_fact_with_evidence(statement, evidence)
    return jsonify(result)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
