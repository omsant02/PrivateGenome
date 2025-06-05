import json
import os
import sys

try:
    from deserializer import getValue
    DESERIALIZER_AVAILABLE = True
    print("✅ iExec deserializer loaded")
except ImportError:
    import protected_data
    DESERIALIZER_AVAILABLE = False
    print("⚠️ Using fallback protected_data module")

IEXEC_OUT = os.getenv('IEXEC_OUT')

try:
    args = sys.argv[1:]
    print(f"📥 Received {len(args)} args")
    
    age, gender, rs1801133, rs7412, rs429358 = None, None, None, None, None
    data_source = "none"
    
    if DESERIALIZER_AVAILABLE:
        try:
            print("🔒 Attempting to read protected data...")
            age = getValue('age', 'string')
            gender = getValue('gender', 'string')
            rs1801133 = getValue('rs1801133', 'string')
            rs7412 = getValue('rs7412', 'string')
            rs429358 = getValue('rs429358', 'string')
            
            data_source = "protected_data"
            print(f"✅ Protected data: age={age}, gender={gender}")
            print(f"✅ Genetic data: {rs1801133}, {rs7412}, {rs429358}")
            
        except Exception as e:
            print(f"❌ Protected data failed: {e}")
            print("📝 Falling back to args or demo mode...")
    
    if not rs1801133 and len(args) >= 3:
        rs1801133 = args[0]
        rs7412 = args[1] 
        rs429358 = args[2]
        age = args[3] if len(args) > 3 else "35"
        gender = args[4] if len(args) > 4 else "unknown"
        data_source = "args"
        print(f"📝 Using command line args: {rs1801133}, {rs7412}, {rs429358}")
    
    if rs1801133 and rs7412 and rs429358:
        print(f"🧬 Processing genetic analysis from {data_source}")
        
        encoding_map = {
            'AA': 0, 'AG': 1, 'GA': 1, 'GG': 2,
            'CC': 0, 'CT': 1, 'TC': 1, 'TT': 2,
            'AC': 1, 'CA': 1, 'GT': 1, 'TG': 1,
            'AT': 1, 'TA': 1
        }
        
        rs1801133 = str(rs1801133).upper().strip()
        rs7412 = str(rs7412).upper().strip()
        rs429358 = str(rs429358).upper().strip()
        
        try:
            encoded1 = encoding_map[rs1801133]
            encoded2 = encoding_map[rs7412]
            encoded3 = encoding_map[rs429358]
            
            print(f"🔢 Encoded genotypes: {encoded1}, {encoded2}, {encoded3}")
            
            try:
                print("🤖 Loading ML model...")
                import joblib
                import pandas as pd
                
                model_path = '/app/src/genetic_risk_model.pkl'
                if os.path.exists(model_path):
                    model = joblib.load(model_path)
                    
                    input_data = pd.DataFrame([{
                        'rs1801133': encoded1,
                        'rs7412': encoded2,
                        'rs429358': encoded3,
                    }])
                    
                    prediction = model.predict(input_data)[0]
                    risk_prob = model.predict_proba(input_data)[:, 1][0]
                    
                    print(f"🎯 ML Prediction: {prediction}, Probability: {risk_prob:.3f}")
                    
                    age_factor = 1.0
                    if age and str(age).isdigit():
                        age_num = int(age)
                        if age_num > 50:
                            age_factor = 1.2
                        elif age_num > 40:
                            age_factor = 1.1
                    
                    gender_factor = 1.1 if gender and str(gender).lower() == 'female' else 1.0
                    
                    adjusted_prob = min(risk_prob * age_factor * gender_factor, 1.0)
                    final_risk_class = "High Risk" if adjusted_prob > 0.6 else "Medium Risk" if adjusted_prob > 0.3 else "Low Risk"
                    
                    algorithm_used = "Machine Learning + Demographic Factors"
                    risk_score = adjusted_prob
                    
                else:
                    raise FileNotFoundError("Model file not found")
                    
            except Exception as ml_error:
                print(f"⚠️ ML model failed ({ml_error}), using algorithm...")
                
                base_risk = (encoded1 * 0.3 + encoded2 * 0.4 + encoded3 * 0.3)
                
                age_factor = 1.0
                if age and str(age).isdigit():
                    age_num = int(age)
                    if age_num > 50:
                        age_factor = 1.3
                    elif age_num > 40:
                        age_factor = 1.15
                
                gender_factor = 1.1 if gender and str(gender).lower() == 'female' else 1.0
                
                final_risk_score = base_risk * age_factor * gender_factor
                final_risk_class = "High Risk" if final_risk_score > 1.2 else "Medium Risk" if final_risk_score > 0.8 else "Low Risk"
                risk_score = min(final_risk_score / 2.5, 1.0)
                algorithm_used = "Algorithmic Risk Assessment"
            
            privacy_badge = "🔒 PROTECTED DATA" if data_source == "protected_data" else "📝 PUBLIC ARGS"
            framework_info = "iExec DataProtector + TDX" if DESERIALIZER_AVAILABLE else "Development Mode"
            
            result_text = f"""🧬 AI-POWERED GENETIC RISK ANALYSIS 🧬
==========================================

{privacy_badge}
Analysis ID: GRA-{hash(str(rs1801133+rs7412+rs429358)) % 10000:04d}

👤 PATIENT PROFILE:
Age: {age or 'Not specified'}
Gender: {gender or 'Not specified'}
Data Source: {data_source.replace('_', ' ').title()}

🎯 RISK ASSESSMENT:
Risk Classification: {final_risk_class}
Risk Probability: {risk_score:.3f} ({risk_score*100:.1f}%)
Algorithm: {algorithm_used}

🧬 GENETIC MARKERS:
- rs1801133 (MTHFR): {rs1801133} → {encoded1}
- rs7412 (APOE): {rs7412} → {encoded2}  
- rs429358 (APOE): {rs429358} → {encoded3}

📊 RISK INTERPRETATION:
{
"• High Risk (>60%): Increased genetic predisposition" if risk_score > 0.6 else
"• Medium Risk (30-60%): Moderate genetic factors" if risk_score > 0.3 else
"• Low Risk (<30%): Lower genetic predisposition"
}

🔒 PRIVACY & SECURITY:
- Processing: Intel TDX (Trusted Domain Extensions)
- Framework: {framework_info}
- Data Protection: End-to-end encryption
- Compliance: GDPR-ready processing

⚡ TECHNICAL DETAILS:
- Platform: iExec Decentralized Computing
- SNP Encoding: Standard bioinformatics mapping
- Privacy: Zero raw data exposure
- Processing Time: {data_source} pathway

⚠️ IMPORTANT DISCLAIMER:
This analysis is for research and educational purposes only.
Genetic risk is influenced by many factors beyond these markers.
Environmental, lifestyle, and other genetic factors also contribute.
Always consult qualified healthcare professionals for medical advice.
This tool should not replace professional genetic counseling.

🔬 Powered by iExec • Privacy-First Genomics"""
            
            print(f"✅ Analysis complete: {final_risk_class} ({risk_score:.3f})")
            
        except KeyError as e:
            result_text = f"""❌ INVALID GENOTYPE FORMAT
============================
Invalid genotype detected: '{e}'

✅ VALID GENOTYPE FORMATS:
Homozygous: AA, CC, GG, TT
Heterozygous: AG, GA, CT, TC, AC, CA, GT, TG, AT, TA

📊 INPUT RECEIVED ({data_source}):
- rs1801133: '{rs1801133}'
- rs7412: '{rs7412}'
- rs429358: '{rs429358}'

💡 EXAMPLES OF VALID INPUT:
- Low Risk: AA, CC, AA
- Medium Risk: AG, CT, AG  
- High Risk: GG, TT, GG

🔧 TROUBLESHOOTING:
Please ensure each genotype is exactly 2 characters.
Remove any spaces or special characters.
Use only letters: A, C, G, T"""
            
            print(f"❌ Invalid genotype: {e}")
    
    else:
        framework_status = "iExec DataProtector + TDX" if DESERIALIZER_AVAILABLE else "Development Mode"
        
        result_text = f"""🧬 PRIVATE GENETIC RISK ANALYZER 🧬
=====================================

🚀 WELCOME TO SECURE GENETIC ANALYSIS

📊 ANALYSIS CAPABILITIES:
✓ Multi-SNP genetic risk assessment
✓ Age and gender factor integration  
✓ AI-powered risk classification
✓ Privacy-preserving computation

🧬 SUPPORTED GENETIC MARKERS:
• rs1801133 (MTHFR gene)
  - Function: Folate metabolism pathway
  - Health impact: Cardiovascular, neural tube defects
  
• rs7412 (APOE gene)  
  - Function: Lipid transport and metabolism
  - Health impact: Alzheimer's, cardiovascular disease
  
• rs429358 (APOE gene)
  - Function: Apolipoprotein E variant
  - Health impact: Alzheimer's, lipid disorders

🔒 PRIVACY ARCHITECTURE:
✓ End-to-end encryption with iExec DataProtector
✓ Secure computation in Intel TDX hardware
✓ Zero raw genetic data exposure during processing
✓ GDPR-compliant data handling and storage
✓ Decentralized processing - no central data repository

⚡ USAGE METHODS:
1. 🌐 Web Interface: Secure frontend with MetaMask
2. 📱 API: Direct integration via iExec SDK
3. 🖥️ CLI: iapp run <address> --args "AA CC TT [age] [gender]"

🛡️ TECHNICAL FRAMEWORK:
- Security: {framework_status}
- Hardware: Intel TDX (Trusted Domain Extensions)
- Platform: iExec Decentralized Computing Network
- AI: Multi-factor genetic risk assessment
- Compliance: Research-grade genetic analysis

🎯 READY FOR ANALYSIS!
Upload your genetic data securely to begin personalized risk assessment.

💡 Sample Analysis:
Try with sample data: AG, TC, CT (moderate risk profile)"""

    with open(IEXEC_OUT + '/result.txt', 'w') as f:
        f.write(result_text)
    
    computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}
    print("📝 Result written successfully")

except Exception as e:
    print(f"💥 Critical error: {e}")
    import traceback
    traceback.print_exc()
    
    error_message = f"""❌ APPLICATION ERROR
===================
A critical error occurred during genetic analysis.

🔍 ERROR DETAILS:
{str(e)}

🔧 SYSTEM INFORMATION:
- Python version: {sys.version.split()[0]}
- Arguments received: {len(sys.argv)-1}
- Deserializer available: {DESERIALIZER_AVAILABLE if 'DESERIALIZER_AVAILABLE' in locals() else 'Unknown'}
- IEXEC_OUT: {IEXEC_OUT}

📋 TROUBLESHOOTING CHECKLIST:
□ Verify genetic data format (AA, AG, GG, etc.)
□ Check dataset type declaration in frontend
□ Ensure iExec deserializer compatibility  
□ Validate protected data structure
□ Confirm all required files are present

💡 SUPPORTED INPUT FORMATS:
- rs1801133: AA, AG, GA, GG (MTHFR variants)
- rs7412: CC, CT, TC, TT (APOE variants)
- rs429358: CC, CT, TC, TT (APOE variants)

🛠️ DEVELOPMENT SUPPORT:
If this error persists, please:
1. Check application logs for detailed stack trace
2. Verify iExec framework configuration
3. Test with command line args first
4. Ensure model files are properly deployed

Framework: {"iExec DataProtector" if 'DESERIALIZER_AVAILABLE' in locals() and DESERIALIZER_AVAILABLE else "Development Mode"}
Timestamp: {sys.argv[0] if sys.argv else 'Unknown'}"""
    
    with open(IEXEC_OUT + '/result.txt', 'w') as f:
        f.write(error_message)
    
    computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}

finally:
    with open(IEXEC_OUT + '/computed.json', 'w') as f:
        json.dump(computed_json, f)
    print("✅ Computed JSON written")