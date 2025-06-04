import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# ----------------------------
# 1. Load dataset
# ----------------------------

data = pd.read_csv("finalcleaned.csv")

# ----------------------------
# 2. Handle missing values
# ----------------------------

print("Rows before fillna/dropna:", len(data))
print(data.isna().sum())

# Fill missing gender with 'M' (or you can use 'F' or 'Unknown')
data['gender'].fillna('M', inplace=True)

# Define features including age and gender
feature_cols = ['rs1801133', 'rs7412', 'rs429358', 'age', 'gender']

# Drop rows with missing values in these features or target 'risk'
data.dropna(subset=feature_cols + ['risk'], inplace=True)

print("Rows after dropna:", len(data))
print(data.isna().sum())

# ----------------------------
# 3. Encode categorical/genotype data
# ----------------------------

encoding_map = {
    'AA': 0, 'AG': 1, 'GG': 2,
    'TT': 0, 'TC': 1, 'CT': 1, 'CC': 2,
    'M': 0, 'F': 1
}

data.replace(encoding_map, inplace=True)

# ----------------------------
# 4. Prepare data for training
# ----------------------------

X = data[feature_cols]
y = data['risk']

# ----------------------------
# 5. Split data
# ----------------------------

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ----------------------------
# 6. Train the model
# ----------------------------

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# ----------------------------
# 7. Evaluate the model
# ----------------------------

y_pred = model.predict(X_test)
print("✅ Accuracy:", accuracy_score(y_test, y_pred))
print("📊 Classification Report:\n", classification_report(y_test, y_pred))

# ----------------------------
# 8. Save the model
# ----------------------------

joblib.dump(model, "genetic_risk_model.pkl")
print("✅ Model saved as genetic_risk_model.pkl")
