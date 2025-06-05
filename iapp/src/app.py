import json
import os
import sys

# Import iExec deserializer as per docs
try:
    from deserializer import getValue
    DESERIALIZER_AVAILABLE = True
except ImportError:
    import protected_data
    DESERIALIZER_AVAILABLE = False

IEXEC_OUT = os.getenv('IEXEC_OUT')

try:
    args = sys.argv[1:]
    print(f"Received {len(args)} args")
    
    # Get genomic data from protected data (as per iExec docs)
    rs1801133, rs7412, rs429358 = None, None, None
    data_source = "none"
    
    if DESERIALIZER_AVAILABLE:
        try:
            print("Using iExec deserializer")
            # Simple flat structure as per docs
            rs1801133 = getValue('rs1801133', 'string')
            rs7412 = getValue('rs7412', 'string')
            rs429358 = getValue('rs429358', 'string')
            data_source = "protected_data"
            print(f"Got protected data: {rs1801133}, {rs7412}, {rs429358}")
        except:
            print("Protected data not available")
    
    # Fallback to args if no protected data
    if not rs1801133 and len(args) >= 3:
        rs1801133 = args[0]
        rs7412 = args[1] 
        rs429358 = args[2]
        data_source = "args"
        print(f"Using args: {rs1801133}, {rs7412}, {rs429358}")
    
    # Process if we have genetic data
    if rs1801133 and rs7412 and rs429358:
        # Simple encoding
        encoding_map = {
            'AA': 0, 'AG': 1, 'GA': 1, 'GG': 2,
            'CC': 0, 'CT': 1, 'TC': 1, 'TT': 2,
            'AC': 1, 'CA': 1, 'GT': 1, 'TG': 1,
            'AT': 1, 'TA': 1
        }
        
        rs1801133 = rs1801133.upper()
        rs7412 = rs7412.upper()
        rs429358 = rs429358.upper()
        
        try:
            # Encode genotypes
            encoded1 = encoding_map[rs1801133]
            encoded2 = encoding_map[rs7412]
            encoded3 = encoding_map[rs429358]
            
            print(f"Encoded: {encoded1}, {encoded2}, {encoded3}")
            
            # Simple AI prediction (without heavy ML libraries for now)
            risk_score = (encoded1 * 0.3 + encoded2 * 0.4 + encoded3 * 0.3)
            risk_class = "High Risk" if risk_score > 1.0 else "Low Risk"
            risk_prob = min(risk_score / 2.0, 1.0)
            
            # Create result
            result_text = f"""🧬 GENETIC RISK ANALYSIS 🧬
=============================

Data Source: {data_source}
Framework: {"iExec DataProtector" if DESERIALIZER_AVAILABLE else "Development"}

🤖 PREDICTION:
Risk: {risk_class}
Probability: {risk_prob:.3f}

📊 MARKERS:
rs1801133: {rs1801133} → {encoded1}
rs7412: {rs7412} → {encoded2}
rs429358: {rs429358} → {encoded3}

🔒 Processed in TEE
⚡ Powered by iExec"""
            
            print(f"Result: {risk_class} ({risk_prob:.3f})")
            
        except KeyError as e:
            result_text = f"""❌ INVALID GENOTYPE: {e}
Valid: AA, AG, GA, GG, CC, CT, TC, TT, etc.

Input: {rs1801133}, {rs7412}, {rs429358}"""
    
    else:
        # No data provided
        result_text = f"""🧬 GENETIC RISK ANALYZER 🧬
============================

Ready for analysis!

Supports: rs1801133, rs7412, rs429358
Privacy: iExec DataProtector
Security: TEE Processing

Usage:
- Args: iapp run <addr> --args "AA CC TT"  
- Protected: Use DataProtector SDK"""

    # Write result
    with open(IEXEC_OUT + '/result.txt', 'w') as f:
        f.write(result_text)
    
    # Required computed.json
    computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}

except Exception as e:
    print(f"Error: {e}")
    
    # Error result
    with open(IEXEC_OUT + '/result.txt', 'w') as f:
        f.write(f"❌ Error: {e}")
    
    computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}

finally:
    # Always write computed.json (iExec requirement)
    with open(IEXEC_OUT + '/computed.json', 'w') as f:
        json.dump(computed_json, f)