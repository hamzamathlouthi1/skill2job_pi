import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib

# Load your dataset
df = pd.read_csv(r'C:\Users\Mayssa Klibi\Downloads\student-performance (1).csv')
features = ['previous_score', 'attendance_rate', 'completed_trainings', 
            'engagement_score', 'submission_rate']
X = df[features]
y = (df['success'] >= 0.5).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

model = LogisticRegression(random_state=42)
model.fit(X_train_scaled, y_train)

joblib.dump(model, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')

print("Done! model.pkl and scaler.pkl saved.")