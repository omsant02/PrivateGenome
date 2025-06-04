# create_mock_model.py
# Run this script to create a mock ML model for testing

import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Create synthetic genomic data for training
np.random.seed(42)
n_samples = 1000

# Generate synthetic genetic variants (0, 1, 2 for AA, AG, GG etc.)
data = {
    'rs1801133': np.random.choice([0, 1, 2], n_samples),
    'rs7412': np.random.choice([0, 1, 2], n_samples),
    'rs429358': np.random.choice([0, 1, 2], n_samples),
}

df = pd.DataFrame(data)

# Create synthetic risk labels based on simple rules
# Higher values = higher risk (this is just for demo)
risk_score = (
    df['rs1801133'] * 0.3 + 
    df['rs7412'] * 0.4 + 
    df['rs429358'] * 0.3 + 
    np.random.normal(0, 0.2, n_samples)
)

# Convert to binary classification (0 = low risk, 1 = high risk)
y = (risk_score > np.median(risk_score)).astype(int)

# Train a simple model
X = df[['rs1801133', 'rs7412', 'rs429358']]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Use a simple model for compatibility
model = RandomForestClassifier(n_estimators=10, random_state=42, max_depth=3)
model.fit(X_train, y_train)

# Test the model
test_accuracy = model.score(X_test, y_test)
print(f"Mock model accuracy: {test_accuracy:.3f}")

# Test with sample data
sample_data = pd.DataFrame([{
    'rs1801133': 0,  # AA
    'rs7412': 0,     # CC  
    'rs429358': 2,   # TT
}])

prediction = model.predict(sample_data)
risk_prob = model.predict_proba(sample_data)[:, 1][0]
print(f"Sample prediction: {prediction[0]} (risk prob: {risk_prob:.3f})")

# Save the model
joblib.dump(model, 'genetic_risk_model.pkl')
print("Mock model saved as 'genetic_risk_model.pkl'")

print("\nModel info:")
print(f"- Features: {list(X.columns)}")
print(f"- Classes: {model.classes_}")
print(f"- Feature importances: {dict(zip(X.columns, model.feature_importances_))}")

# Test different genotype combinations
test_cases = [
    {'rs1801133': 0, 'rs7412': 0, 'rs429358': 0},  # AA CC AA
    {'rs1801133': 1, 'rs7412': 1, 'rs429358': 1},  # AG CT AG
    {'rs1801133': 2, 'rs7412': 2, 'rs429358': 2},  # GG TT GG
]

print("\nTest predictions:")
for i, case in enumerate(test_cases):
    test_df = pd.DataFrame([case])
    pred = model.predict(test_df)[0]
    prob = model.predict_proba(test_df)[:, 1][0]
    print(f"Case {i+1}: {case} → Risk: {'High' if pred else 'Low'} ({prob:.3f})")