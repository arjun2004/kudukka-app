from flask import Flask, render_template, jsonify
from new import fetch_crypto_prices, predict_crypto, analyze_twitter_sentiment, recommend_best_coins

app = Flask(__name__)

# ========== RUN BEFORE FLASK STARTS ==========
print("Fetching top cryptocurrencies...")
crypto_pairs = fetch_crypto_prices(limit=5)

if not crypto_pairs:
    print("No cryptocurrencies found.")
    recommended_coins = []
else:
    print("Running prediction and sentiment analysis...")
    prediction_results = predict_crypto(crypto_pairs)
    sentiment_scores = analyze_twitter_sentiment()
    recommended_coins = recommend_best_coins(prediction_results, sentiment_scores)

# ========== ROUTE ==========
@app.route('/')
def index():
    return render_template("index.html", scores=recommended_coins)

@app.route('/predict', methods=["GET"])
def predict():
    return jsonify({"message": recommended_coins[0]})

@app.route('/recommend', methods=["GET"])
def recommend():
    return jsonify({"message": recommended_coins})

# ========== START APP ==========
if __name__ == "__main__":
    app.run(debug=True)
