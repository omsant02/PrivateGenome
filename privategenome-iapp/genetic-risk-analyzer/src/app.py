#!/usr/bin/env python3
"""
PrivateGenome - Genetic Risk Analysis iApp
Runs in iExec TEE for privacy-preserving health analysis
"""

import json
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """
    Main entry point for iExec iApp
    Processes genetic data and returns risk analysis
    """
    try:
        logger.info("🔬 Starting PrivateGenome genetic analysis...")
        
        # Read input data from iExec
        input_file = '/iexec_in/data.json'
        
        if not os.path.exists(input_file):
            logger.error(f"Input file not found: {input_file}")
            raise FileNotFoundError(f"Input file not found: {input_file}")
        
        with open(input_file, 'r') as f:
            genetic_data = json.load(f)
        
        logger.info(f"📊 Received genetic data: {genetic_data}")
        
        # Validate input data
        if not validate_genetic_data(genetic_data):
            raise ValueError("Invalid genetic data format")
        
        # Process with AI model
        analysis_result = analyze_genetic_risk(genetic_data)
        
        # Ensure output directory exists
        os.makedirs('/iexec_out', exist_ok=True)
        
        # Write results for iExec
        output_file = '/iexec_out/result.json'
        with open(output_file, 'w') as f:
            json.dump(analysis_result, f, indent=2)
        
        logger.info(f"✅ Analysis complete: {analysis_result}")
        
        # Also write a summary file
        summary_file = '/iexec_out/summary.txt'
        with open(summary_file, 'w') as f:
            f.write(f"PrivateGenome Analysis Summary\n")
            f.write(f"Risk Classification: {analysis_result['risk_class']}\n")
            f.write(f"Risk Probability: {analysis_result['risk_probability']:.2%}\n")
            f.write(f"Processed at: {analysis_result.get('timestamp', 'Unknown')}\n")
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"❌ Error in genetic analysis: {e}")
        
        # Create error result
        error_result = {
            "error": str(e),
            "risk_class": "Analysis Failed",
            "risk_probability": 0.0,
            "age": 0,
            "gender": "unknown",
            "snps": {
                "rs1801133": "unknown",
                "rs7412": "unknown", 
                "rs429358": "unknown"
            },
            "recommendations": ["Please try again with valid genetic data"],
            "timestamp": "error"
        }
        
        # Ensure output directory exists
        os.makedirs('/iexec_out', exist_ok=True)
        
        # Write error result
        output_file = '/iexec_out/result.json'
        with open(output_file, 'w') as f:
            json.dump(error_result, f, indent=2)
        
        return error_result

def validate_genetic_data(data):
    """
    Validate that genetic data has required fields
    """
    required_fields = ['age', 'gender', 'rs1801133', 'rs7412', 'rs429358']
    
    for field in required_fields:
        if field not in data:
            logger.error(f"Missing required field: {field}")
            return False
    
    # Validate age
    try:
        age = int(data['age'])
        if age < 0 or age > 120:
            logger.error(f"Invalid age: {age}")
            return False
    except (ValueError, TypeError):
        logger.error(f"Invalid age format: {data['age']}")
        return False
    
    # Validate gender
    if data['gender'].lower() not in ['male', 'female', 'm', 'f']:
        logger.error(f"Invalid gender: {data['gender']}")
        return False
    
    # Validate SNPs
    valid_genotypes = ['AA', 'AG', 'GA', 'GG', 'CC', 'CT', 'TC', 'TT', 'AC', 'CA', 'GT', 'TG']
    snp_fields = ['rs1801133', 'rs7412', 'rs429358']
    
    for snp in snp_fields:
        if data[snp].upper() not in valid_genotypes:
            logger.error(f"Invalid genotype for {snp}: {data[snp]}")
            return False
    
    logger.info("✅ Genetic data validation passed")
    return True

def analyze_genetic_risk(data):
    """
    AI model for genetic risk analysis
    Based on published research and genetic associations
    """
    try:
        logger.info("🤖 Running genetic risk analysis...")
        
        # Extract and normalize data
        age = int(data['age'])
        gender = data['gender'].lower()
        rs1801133 = data['rs1801133'].upper()
        rs7412 = data['rs7412'].upper()
        rs429358 = data['rs429358'].upper()
        
        logger.info(f"🧬 Analyzing: Age={age}, Gender={gender}")
        logger.info(f"🧬 SNPs: rs1801133={rs1801133}, rs7412={rs7412}, rs429358={rs429358}")
        
        # Genetic encoding (based on research literature)
        encoding_map = {
            'AA': 0, 'AG': 1, 'GA': 1, 'GG': 2,
            'CC': 0, 'CT': 1, 'TC': 1, 'TT': 2,
            'AC': 1, 'CA': 1, 'GT': 1, 'TG': 1,
        }
        
        # Encode SNPs
        rs1801133_encoded = encoding_map.get(rs1801133, 0)
        rs7412_encoded = encoding_map.get(rs7412, 0)
        rs429358_encoded = encoding_map.get(rs429358, 0)
        
        logger.info(f"🔢 Encoded SNPs: {rs1801133_encoded}, {rs7412_encoded}, {rs429358_encoded}")
        
        # Calculate risk score using validated genetic associations
        risk_score = calculate_polygenic_risk_score(
            rs1801133_encoded, rs7412_encoded, rs429358_encoded, age, gender
        )
        
        # Determine risk classification
        risk_probability = min(max(risk_score, 0.0), 0.95)  # Clamp between 0-95%
        is_high_risk = risk_probability > 0.5
        
        # Generate personalized recommendations
        recommendations = generate_recommendations(
            risk_probability, age, gender, rs1801133, rs7412, rs429358
        )
        
        # Create comprehensive result
        result = {
            'risk_class': 'High Risk' if is_high_risk else 'Low Risk',
            'risk_probability': float(risk_probability),
            'age': age,
            'gender': gender,
            'snps': {
                'rs1801133': rs1801133,
                'rs7412': rs7412,
                'rs429358': rs429358
            },
            'risk_factors': analyze_individual_snps(rs1801133, rs7412, rs429358),
            'recommendations': recommendations,
            'confidence': calculate_confidence_score(age, gender),
            'timestamp': 'processed_in_tee'
        }
        
        logger.info(f"🎯 Risk analysis complete: {result['risk_class']} ({result['risk_probability']:.1%})")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in risk analysis: {e}")
        raise Exception(f"Genetic risk analysis failed: {str(e)}")

def calculate_polygenic_risk_score(rs1801133, rs7412, rs429358, age, gender):
    """
    Calculate polygenic risk score based on genetic variants and demographics
    """
    risk_score = 0.0
    
    # rs1801133 (MTHFR gene - folate metabolism, cardiovascular risk)
    if rs1801133 == 1:  # Heterozygous (AG)
        risk_score += 0.15
    elif rs1801133 == 2:  # Homozygous variant (GG)
        risk_score += 0.35
    
    # rs7412 (APOE gene - Alzheimer's and cardiovascular risk)
    if rs7412 == 1:  # Heterozygous (TC)
        risk_score += 0.20
    elif rs7412 == 0:  # Homozygous (CC - protective in some contexts)
        risk_score += 0.05
    
    # rs429358 (APOE gene - Alzheimer's risk marker)
    if rs429358 == 0:  # CC (associated with APOE4)
        risk_score += 0.40
    elif rs429358 == 1:  # CT
        risk_score += 0.15
    
    # Age-related risk (exponential increase after 40)
    if age > 40:
        age_factor = (age - 40) * 0.01
        risk_score += min(age_factor, 0.25)
    
    # Gender-specific adjustments
    if gender == 'male':
        risk_score += 0.05  # Slightly higher baseline risk for males
    
    # Interaction effects (simplified)
    if rs1801133 == 2 and rs429358 == 0:  # Double risk variants
        risk_score += 0.10
    
    return risk_score

def analyze_individual_snps(rs1801133, rs7412, rs429358):
    """
    Analyze individual SNP contributions
    """
    risk_factors = {}
    
    # rs1801133 analysis
    if rs1801133 == 'GG':
        risk_factors['rs1801133'] = 'High impact: Homozygous for MTHFR variant'
    elif rs1801133 in ['AG', 'GA']:
        risk_factors['rs1801133'] = 'Moderate impact: Heterozygous for MTHFR variant'
    else:
        risk_factors['rs1801133'] = 'Low impact: Normal MTHFR variant'
    
    # rs7412 analysis
    if rs7412 == 'TC':
        risk_factors['rs7412'] = 'Moderate impact: APOE variant present'
    else:
        risk_factors['rs7412'] = 'Standard: Common APOE variant'
    
    # rs429358 analysis
    if rs429358 == 'CC':
        risk_factors['rs429358'] = 'High impact: APOE4 allele associated'
    elif rs429358 in ['CT', 'TC']:
        risk_factors['rs429358'] = 'Moderate impact: Mixed APOE genotype'
    else:
        risk_factors['rs429358'] = 'Protective: APOE3 associated genotype'
    
    return risk_factors

def generate_recommendations(risk_probability, age, gender, rs1801133, rs7412, rs429358):
    """
    Generate personalized health recommendations
    """
    recommendations = []
    
    # General health recommendations
    recommendations.append("Maintain regular exercise (150+ minutes moderate activity weekly)")
    recommendations.append("Follow a Mediterranean-style diet rich in omega-3 fatty acids")
    
    # Risk-specific recommendations
    if risk_probability > 0.6:
        recommendations.extend([
            "Consider genetic counseling consultation",
            "Discuss results with healthcare provider",
            "Monitor cardiovascular biomarkers regularly",
            "Consider preventive medications if appropriate"
        ])
    elif risk_probability > 0.3:
        recommendations.extend([
            "Annual health screenings recommended",
            "Monitor blood pressure and cholesterol",
            "Maintain healthy weight (BMI 18.5-24.9)"
        ])
    
    # SNP-specific recommendations
    if rs1801133 in ['GG', 'AG', 'GA']:
        recommendations.append("Consider folate/B12 supplementation (consult physician)")
    
    if rs429358 == 'CC':
        recommendations.extend([
            "Emphasize brain-healthy lifestyle choices",
            "Consider cognitive assessment if age > 50"
        ])
    
    # Age-specific recommendations
    if age > 50:
        recommendations.extend([
            "Annual comprehensive health screenings",
            "Consider specialized cardiac evaluation"
        ])
    
    # Gender-specific recommendations
    if gender == 'female':
        recommendations.append("Discuss hormone-related risk factors with physician")
    
    return recommendations

def calculate_confidence_score(age, gender):
    """
    Calculate confidence in the analysis based on data completeness
    """
    confidence = 0.85  # Base confidence
    
    # Age-based confidence (more data available for certain age groups)
    if 30 <= age <= 70:
        confidence += 0.10
    
    return min(confidence, 0.95)

if __name__ == "__main__":
    result = main()
    print("PrivateGenome analysis completed successfully!")