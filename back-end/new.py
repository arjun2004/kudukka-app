
import requests
from bs4 import BeautifulSoup
import yfinance as yf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout, Bidirectional
from keras.callbacks import EarlyStopping
import pandas as pd
import re
import csv
from collections import defaultdict
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.metrics import accuracy_score
from datetime import datetime

# ============= FETCH TOP CRYPTOS =============
def fetch_crypto_prices(limit=5):
    api_key = 'f0f4417e-74fd-4ede-86e7-be4e69c68dd0'  # CoinMarketCap API key
    url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
    headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': api_key,
    }
    parameters = {
        'start': '1',
        'limit': str(limit),
        'convert': 'USD'
    }

    try:
        response = requests.get(url, headers=headers, params=parameters)
        response.raise_for_status()
        data = response.json()

        if 'data' not in data:
            print("API error:", data.get('status', {}).get('error_message', 'Unknown error'))
            return []

        crypto_data = [f"{crypto['symbol']}-USD" for crypto in data['data']]
        print("Top Cryptocurrencies:", crypto_data)
        return crypto_data

    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

# ============= DATA PREPARATION =============
def prepare_data(ticker, start_date='2017-01-01', end_date=datetime.today().strftime('%Y-%m-%d')):
    try:
        data = yf.download(ticker, start=start_date, end=end_date)
        if data.empty:
            raise ValueError(f"No data for {ticker}")

        data['Returns'] = data['Close'].pct_change()
        data['MA7'] = data['Close'].rolling(window=7).mean()
        data['MA14'] = data['Close'].rolling(window=14).mean() 
        data = data.dropna()

        features = data[['Close', 'Returns', 'MA7', 'MA14']].values          #Parameters
        scaler = MinMaxScaler()
        scaled_data = scaler.fit_transform(features)

        return data, scaled_data, scaler
    except Exception as e:
        print(f"Error preparing data for {ticker}: {e}")
        return None, None, None

# ============= LSTM MODEL =============
def build_lstm_model(input_shape):
    model = Sequential([
        Bidirectional(LSTM(units=100, return_sequences=True), input_shape=input_shape),
        Dropout(0.2),
        LSTM(units=100, return_sequences=True),
        Dropout(0.2),
        LSTM(units=50),
        Dropout(0.2),
        Dense(units=25),
        Dense(units=1)
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

# ============= PREDICTION FUNCTION =============
def predict_crypto(crypto_pairs):
    results = {}

    for pair in crypto_pairs:
        print(f"\nProcessing {pair}...")

        data, scaled_data, scaler = prepare_data(pair)
        if data is None:
            continue

        seq_length = 60
        X, y = [], []
        for i in range(seq_length, len(scaled_data)):
            X.append(scaled_data[i-seq_length:i])
            y.append(scaled_data[i, 0])

        X, y = np.array(X), np.array(y)
        train_size = int(0.8 * len(X))
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]

        model = build_lstm_model((seq_length, scaled_data.shape[1]))
        early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

        model.fit(
            X_train, y_train,
            epochs=50,
            batch_size=32,
            validation_split=0.1,
            callbacks=[early_stopping],
            verbose=0
        )

        predictions = model.predict(X_test, verbose=0)
        dummy_array = np.zeros((len(predictions), scaled_data.shape[1]))
        dummy_array[:, 0] = predictions[:, 0]
        predictions_transformed = scaler.inverse_transform(dummy_array)[:, 0]

        actual = data['Close'].values[train_size + seq_length:]
        mape = np.mean(np.abs((actual - predictions_transformed) / actual)) * 100
        accuracy = 100 - mape

        results[pair] = {
            'dates': data.index[train_size + seq_length:],
            'actual': actual,
            'predicted': predictions_transformed,
            'accuracy': accuracy
        }

        print(f"{pair} Model Accuracy: {accuracy:.2f}%")

    return results

# ============= SENTIMENT ANALYSIS =============
def analyze_twitter_sentiment():
    url = "https://api.twitterapi.io/twitter/tweet/advanced_search"     ## Twitter API
    headers = {"X-API-Key": "d85c40bc799b4397b8dc817ffa7b3610"}
    params = {"query": "from:CryptoNikyous OR from:saylor OR from:WatcherGuru since:2025-04-19"}

    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    tweets_list = data.get("tweets", [])

    df = pd.DataFrame(tweets_list)
    if df.empty:
        print("No tweets found.")
        return {}

    def extract_coins(text):
        return re.findall(r'\$[A-Za-z]+', text)

    analyzer = SentimentIntensityAnalyzer()
    coin_sentiments = defaultdict(list)

    for text in df["text"]:
        coins = extract_coins(text)
        sentiment_score = analyzer.polarity_scores(text)['compound']
        for coin in coins:
            coin_sentiments[coin].append(sentiment_score)

    coin_scores = {coin: np.mean(scores) for coin, scores in coin_sentiments.items() if scores}
    return coin_scores

# ============= COMBINE MODEL AND SENTIMENT =============
def recommend_best_coins(prediction_results, sentiment_scores):
    combined_scores = {}
    for pair, result in prediction_results.items():
        symbol = f"${pair.split('-')[0]}"
        sentiment = sentiment_scores.get(symbol, 0)
        model_score = result['accuracy']
        combined_scores[symbol] = 0.5 * model_score + 0.5 * (sentiment * 100)

    sorted_coins = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
    return [(coin, round(score, 2)) for coin, score in sorted_coins]


# ============= EXECUTION =============
if __name__ == "__main__":
    print("Fetching current cryptocurrency prices...")
    crypto_pairs = fetch_crypto_prices(limit=5)
    if not crypto_pairs:
        print("No cryptocurrencies found.")
    else:
        prediction_results = predict_crypto(crypto_pairs)
        sentiment_scores = analyze_twitter_sentiment()
        recommend_best_coins(prediction_results, sentiment_scores)
