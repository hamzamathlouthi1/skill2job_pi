from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load model and scaler
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

    success_probability = round(float(probability[1]) * 100, 2)

    return jsonify({
        'prediction': 'PASS' if prediction == 1 else 'FAIL',
        'success_probability': success_probability,
        'fail_probability': round(float(probability[0]) * 100, 2)
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'running'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)