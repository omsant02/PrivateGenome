import joblib
import pandas as pd

# Load the trained model
model = joblib.load('genetic_risk_model.pkl')

# Encoding map (same as used during training)
encoding_map = {
    'AA': 0, 'AG': 1, 'GA': 1, 'GG': 2,
    'CC': 0, 'CT': 1, 'TC': 1, 'TT': 2,
    'AC': 1, 'CA': 1, 'GT': 1, 'TG': 1,
}

# Take user input
age = int(input("Enter age: "))
gender_input = input("Enter gender (male/female): ").lower()
rs1801133 = input("Enter genotype for rs1801133 (e.g., AA, CT): ").upper()
rs7412 = input("Enter genotype for rs7412 (e.g., GG, AG): ").upper()
rs429358 = input("Enter genotype for rs429358 (e.g., CC, TT): ").upper()

# Encode gender (if your model uses gender, else omit this)
gender = 0 if gender_input == 'male' else 1

# Encode SNPs
try:
    rs1801133_encoded = encoding_map[rs1801133]
    rs7412_encoded = encoding_map[rs7412]
    rs429358_encoded = encoding_map[rs429358]
except KeyError as e:
    print(f"Invalid genotype input: {e}")
    exit()

# Prepare input dataframe with matching feature names
input_data = pd.DataFrame([{
    'rs1801133': rs1801133_encoded,
    'rs7412': rs7412_encoded,
    'rs429358': rs429358_encoded,
   
}])

# Make prediction
prediction = model.predict(input_data)
risk_prob = model.predict_proba(input_data)[:, 1]

# Output result
risk_class = 'High Risk' if prediction[0] == 1 else 'Low Risk'
print(f"Predicted Risk: {risk_class}")
print(f"Risk Probability: {risk_prob[0]:.2f}")
