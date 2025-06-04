import json
import os
import sys
import shutil
from pyfiglet import Figlet
import protected_data
import joblib
import pandas as pd

# ⚠️ Your Python code will be run in a python v3.8.3 environment

IEXEC_OUT = os.getenv('IEXEC_OUT')

computed_json = {}

try:
    messages = []

    args = sys.argv[1:]
    print(f"Received {len(args)} args")
    if len(args) > 0:
        messages.append(" ".join(args))

    try:
        # The protected data mock created for the purpose of this Hello World journey
        # contains an object with a key "secretText" which is a string
        protected_text = protected_data.getValue('secretText', 'string')
        messages.append(protected_text)
    except Exception as e:
        print('It seems there is an issue with your protected data:', e)

    IEXEC_INPUT_FILES_NUMBER = int(os.getenv("IEXEC_INPUT_FILES_NUMBER", 0))
    IEXEC_IN = os.getenv("IEXEC_IN")
    print(f"Received {IEXEC_INPUT_FILES_NUMBER} input files")

    for i in range(1, IEXEC_INPUT_FILES_NUMBER + 1):
        input_file_name = os.getenv(f"IEXEC_INPUT_FILE_NAME_{i}")
        input_file_path = os.path.join(
            IEXEC_IN, input_file_name) if input_file_name else None

        if input_file_path:
            print(f"  Copying input file {i}")
            shutil.copy(input_file_path, os.path.join(
                os.getenv("IEXEC_OUT", ""), f"inputFile_{i}"))

    IEXEC_APP_DEVELOPER_SECRET = os.getenv("IEXEC_APP_DEVELOPER_SECRET")
    if IEXEC_APP_DEVELOPER_SECRET:
        # Replace all characters with '*'
        redacted_app_secret = '*' * len(IEXEC_APP_DEVELOPER_SECRET)
        print(f"Got an app secret ({redacted_app_secret})!")
    else:
        print("App secret is not set")

    IEXEC_REQUESTER_SECRET_1 = os.getenv("IEXEC_REQUESTER_SECRET_1")
    IEXEC_REQUESTER_SECRET_42 = os.getenv("IEXEC_REQUESTER_SECRET_42")

    if IEXEC_REQUESTER_SECRET_1:
        redacted_requester_secret = '*' * len(IEXEC_REQUESTER_SECRET_1)
        print(f"Got requester secret 1 ({redacted_requester_secret})!")
    else:
        print("Requester secret 1 is not set")

    if IEXEC_REQUESTER_SECRET_42:
        redacted_requester_secret = '*' * len(IEXEC_REQUESTER_SECRET_42)
        print(f"Got requester secret 42 ({redacted_requester_secret})!")
    else:
        print("Requester secret 42 is not set")

    # Model prediction integration
    # Expecting args: age gender rs1801133 rs7412 rs429358
    if len(args) >= 5:
        age = int(args[0])
        gender_input = args[1].lower()
        rs1801133 = args[2].upper()
        rs7412 = args[3].upper()
        rs429358 = args[4].upper()

        encoding_map = {
            'AA': 0, 'AG': 1, 'GA': 1, 'GG': 2,
            'CC': 0, 'CT': 1, 'TC': 1, 'TT': 2,
            'AC': 1, 'CA': 1, 'GT': 1, 'TG': 1,
        }
        gender = 0 if gender_input == 'male' else 1
        try:
            rs1801133_encoded = encoding_map[rs1801133]
            rs7412_encoded = encoding_map[rs7412]
            rs429358_encoded = encoding_map[rs429358]
        except KeyError as e:
            result_text = f"Invalid genotype input: {e}\n"
            risk_class = "Invalid Input"
            risk_prob = 0.0
        else:
            input_data = pd.DataFrame([{
                'rs1801133': rs1801133_encoded,
                'rs7412': rs7412_encoded,
                'rs429358': rs429358_encoded,
            }])
            model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'genetic_risk_model.pkl'))
            model = joblib.load(model_path)
            prediction = model.predict(input_data)
            risk_prob = model.predict_proba(input_data)[:, 1][0]
            risk_class = 'High Risk' if prediction[0] == 1 else 'Low Risk'
            result_text = f"Predicted Risk: {risk_class}\nRisk Probability: {risk_prob:.2f}\n"
        with open(IEXEC_OUT + '/result.txt', 'w') as f:
            f.write(result_text)
        computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}
    else:
        # Fallback to original ASCII art logic if not enough args
        txt = f"Hello, {' '.join(messages) if len(messages) > 0 else 'World'}!"
        ascii_art_text = Figlet().renderText(txt)
        print(ascii_art_text)
        with open(IEXEC_OUT + '/result.txt', 'w') as f:
            f.write(ascii_art_text)
        computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}
except Exception as e:
    print(e)
    computed_json = {'deterministic-output-path': IEXEC_OUT,
                     'error-message': 'Oops something went wrong'}
finally:
    with open(IEXEC_OUT + '/computed.json', 'w') as f:
        json.dump(computed_json, f)
