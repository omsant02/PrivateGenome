import json
import os
import sys
import shutil
from pyfiglet import Figlet
import joblib
import pandas as pd
import numpy as np

# Import the iExec deserializer (this should be provided by iExec framework)
try:
    from deserializer import getValue  # iExec's deserializer module
    DESERIALIZER_AVAILABLE = True
except ImportError:
    # Fallback to our custom protected_data module for local testing
    import protected_data
    DESERIALIZER_AVAILABLE = False
    print("Using fallback protected_data module for local testing")

IEXEC_OUT = os.getenv('IEXEC_OUT')

computed_json = {}

try:
    messages = []

    args = sys.argv[1:]
    print(f"Received {len(args)} args")
    if len(args) > 0:
        messages.append(" ".join(args))

    # Try to get genomic data from protected data using proper iExec deserializer
    genomic_data_from_protected = None
    try:
        if DESERIALIZER_AVAILABLE:
            # Use iExec's official deserializer
            print("Using iExec deserializer for protected data")
            
            # For nested genomic data structure
            # Example: { "genome": { "rs1801133": "AA", "rs7412": "CC", "rs429358": "TT" } }
            rs1801133_protected = getValue('genome.rs1801133', 'string')
            rs7412_protected = getValue('genome.rs7412', 'string') 
            rs429358_protected = getValue('genome.rs429358', 'string')
            
            genomic_data_from_protected = {
                'rs1801133': rs1801133_protected,
                'rs7412': rs7412_protected,
                'rs429358': rs429358_protected
            }
            print(f"Got protected genomic data: {genomic_data_from_protected}")
            
        else:
            # Fallback for local testing
            print("Attempting to use fallback protected data method")
            protected_text = protected_data.getValue('genomicData', 'string')
            
            # Try to parse as JSON if it's structured data
            try:
                genomic_data_from_protected = json.loads(protected_text)
                print(f"Parsed genomic data from protected storage: {genomic_data_from_protected}")
            except:
                print("Protected data is not JSON, treating as simple text")
                messages.append(protected_text)
                
    except Exception as e:
        print(f'Protected data not available or error: {e}')

    # Handle other iExec inputs
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

    # Handle secrets
    IEXEC_APP_DEVELOPER_SECRET = os.getenv("IEXEC_APP_DEVELOPER_SECRET")
    if IEXEC_APP_DEVELOPER_SECRET:
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

    # Determine input source: Protected data > Args > Default
    rs1801133, rs7412, rs429358 = None, None, None
    input_source = "none"

    # Priority 1: Protected data
    if genomic_data_from_protected and isinstance(genomic_data_from_protected, dict):
        rs1801133 = genomic_data_from_protected.get('rs1801133')
        rs7412 = genomic_data_from_protected.get('rs7412') 
        rs429358 = genomic_data_from_protected.get('rs429358')
        input_source = "protected_data"
        print(f"Using genomic data from protected storage")
    
    # Priority 2: Command line args
    elif len(args) >= 3:
        rs1801133 = args[0].upper()
        rs7412 = args[1].upper()
        rs429358 = args[2].upper()
        input_source = "args"
        print(f"Using genomic data from command line args")

    # Process genomic data if available
    if rs1801133 and rs7412 and rs429358:
        print(f"Processing genomic data from {input_source}")
        
        # Ensure uppercase
        rs1801133 = rs1801133.upper()
        rs7412 = rs7412.upper()
        rs429358 = rs429358.upper()

        encoding_map = {
            'AA': 0, 'AG': 1, 'GA': 1, 'GG': 2,
            'CC': 0, 'CT': 1, 'TC': 1, 'TT': 2,
            'AC': 1, 'CA': 1, 'GT': 1, 'TG': 1,
            'AT': 1, 'TA': 1  # Added missing combinations
        }
        
        try:
            rs1801133_encoded = encoding_map[rs1801133]
            rs7412_encoded = encoding_map[rs7412]
            rs429358_encoded = encoding_map[rs429358]
            
            print(f"Encoded genotypes: rs1801133={rs1801133_encoded}, rs7412={rs7412_encoded}, rs429358={rs429358_encoded}")
            
        except KeyError as e:
            result_text = f"""❌ INVALID GENOTYPE INPUT
==========================
Invalid genotype: {e}
Valid genotypes: AA, AG, GA, GG, CC, CT, TC, TT, AC, CA, GT, TG, AT, TA

Input received ({input_source}):
- rs1801133: {rs1801133}
- rs7412: {rs7412}
- rs429358: {rs429358}
"""
            print(f"Invalid genotype input: {e}")
        else:
            # Create DataFrame for AI model
            input_data = pd.DataFrame([{
                'rs1801133': rs1801133_encoded,
                'rs7412': rs7412_encoded,
                'rs429358': rs429358_encoded,
            }])
            
            print(f"Input data shape: {input_data.shape}")
            print(f"Input data: {input_data.iloc[0].to_dict()}")
            
            # Load and run AI model
            try:
                model_path = '/app/src/genetic_risk_model.pkl'
                print(f"Loading AI model from {model_path}")
                
                # Check if model file exists
                if not os.path.exists(model_path):
                    raise FileNotFoundError(f"Model file not found at {model_path}")
                
                model = joblib.load(model_path)
                print("AI model loaded successfully")
                print(f"Model type: {type(model)}")
                
                # Make prediction
                prediction = model.predict(input_data)
                risk_prob = model.predict_proba(input_data)[:, 1][0]
                risk_class = 'High Risk' if prediction[0] == 1 else 'Low Risk'
                
                # Enhanced result with privacy indicators
                privacy_badge = "🔒 PROTECTED DATA" if input_source == "protected_data" else "📝 PUBLIC ARGS"
                
                result_text = f"""🧬 AI-POWERED GENOME RISK ASSESSMENT 🧬
==========================================

{privacy_badge}
Data Source: {input_source.replace('_', ' ').title()}

🤖 AI MODEL PREDICTION:
Risk Classification: {risk_class}
Risk Probability: {risk_prob:.4f}

📊 GENOMIC MARKERS ANALYZED:
- rs1801133 (MTHFR): {rs1801133} → {rs1801133_encoded}
- rs7412 (APOE): {rs7412} → {rs7412_encoded}  
- rs429358 (APOE): {rs429358} → {rs429358_encoded}

🔒 PRIVACY: Analysis completed in TEE
⚡ POWERED BY: iExec + Machine Learning
🔬 MODEL: AI Risk Classifier
🛡️ FRAMEWORK: {"iExec Data Protector" if DESERIALIZER_AVAILABLE else "Development Mode"}

⚠️  DISCLAIMER: For research purposes only.
   Consult healthcare professionals for medical advice.
"""
                print(f"AI Prediction Complete: {risk_class} ({risk_prob:.4f})")
                
            except FileNotFoundError:
                result_text = f"""❌ AI MODEL NOT FOUND
===================
Model file missing: genetic_risk_model.pkl
Please ensure the model is included in src/ directory.

Genomic Input Received ({input_source}):
- rs1801133: {rs1801133} → {rs1801133_encoded}
- rs7412: {rs7412} → {rs7412_encoded}
- rs429358: {rs429358} → {rs429358_encoded}

Creating mock prediction for demo purposes...
Risk Classification: Medium Risk (Demo Mode)
Risk Probability: 0.5000
"""
                print("WARNING: AI model file not found, using demo mode")
                
            except Exception as model_error:
                result_text = f"""❌ AI MODEL ERROR
================
Error loading/running model: {model_error}

Genomic Input Received ({input_source}):
- rs1801133: {rs1801133} → {rs1801133_encoded}
- rs7412: {rs7412} → {rs7412_encoded}
- rs429358: {rs429358} → {rs429358_encoded}

Model path checked: {model_path}
Model exists: {os.path.exists(model_path)}

Debug info:
- NumPy version: {np.__version__}
- Pandas version: {pd.__version__}
- Joblib version: {joblib.__version__}
- Deserializer available: {DESERIALIZER_AVAILABLE}
"""
                print(f"ERROR: AI model error: {model_error}")
                import traceback
                print("Full traceback:")
                traceback.print_exc()
        
        # Write result to file
        with open(IEXEC_OUT + '/result.txt', 'w') as f:
            f.write(result_text)
        computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}
        
    else:
        # Fallback to original ASCII art logic if no genomic data
        txt = f"Hello, {' '.join(messages) if len(messages) > 0 else 'AI-Powered Private Genome'}!"
        ascii_art_text = Figlet().renderText(txt)
        print(ascii_art_text)
        
        info_text = f"""🧬 PRIVATE GENOME RISK DETECTOR 🧬
=======================================

No genomic data provided. This app can analyze:
📊 Genetic variants: rs1801133, rs7412, rs429358
🔒 Privacy: Uses iExec Data Protector
⚡ Processing: Secure TEE computation

Usage:
1. With args: iapp run <address> --args "AA CC TT"
2. With protected data: Use iExec Data Protector

{ascii_art_text}

Ready for genomic analysis!
"""
        
        with open(IEXEC_OUT + '/result.txt', 'w') as f:
            f.write(info_text)
        computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}
        
except Exception as e:
    print(f"Application error: {e}")
    import traceback
    print("Full traceback:")
    traceback.print_exc()
    
    # Create error result
    error_result = f"""❌ APPLICATION ERROR
===================
Error: {e}

This error occurred during execution.
Please check the logs for more details.

Deserializer available: {DESERIALIZER_AVAILABLE if 'DESERIALIZER_AVAILABLE' in locals() else 'Unknown'}
"""
    
    with open(IEXEC_OUT + '/result.txt', 'w') as f:
        f.write(error_result)
    
    computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt',
                     'error-message': 'Application error occurred'}
finally:
    with open(IEXEC_OUT + '/computed.json', 'w') as f:
        json.dump(computed_json, f)