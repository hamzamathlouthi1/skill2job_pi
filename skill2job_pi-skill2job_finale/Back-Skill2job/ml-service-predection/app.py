from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, 'model.pkl'))
scaler = joblib.load(os.path.join(BASE_DIR, 'scaler.pkl'))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    features = np.array([[
        data['previous_score'],
        data['attendance_rate'],
        data['completed_trainings'],
        data['engagement_score'],
        data['submission_rate']
    ]])

    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]
    probability = model.predict_proba(features_scaled)[0]

    return jsonify({
        'prediction': 'PASS' if prediction == 1 else 'FAIL',
        'successProbability': round(float(probability[1]) * 100, 2),
        'failProbability': round(float(probability[0]) * 100, 2)
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)