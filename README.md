# 🧬 Private Gnome

**Private Gnome** is an AI-powered, privacy-first genetic risk analysis platform built for the [EthBelgrade 2025](https://ethbelgrade.rs/) hackathon. It leverages confidential computing (iExec TDX) and decentralized technologies to enable secure, user-controlled genomic analysis—without exposing raw genetic data.


We built PrivateGenome from the ground up, developing our own machine learning pipeline tailored for genomic risk prediction. The model was trained from scratch using a synthetic dataset of over 1,600 cleaned genome records enriched with SNP data (like rs1801133, rs7412, rs429358) ensuring high diversity and generalizability. Input genotypes such as "AA", "CT", etc., were carefully encoded to numeric values reflecting biological variation. The entire model runs privately within a Trusted Execution Environment (TEE) using iExec iApp, ensuring secure, tamper-proof predictions on sensitive DNA data. These datas are protected and processed used DataProtector Core.
---

## 🚀 What is Private Gnome?

Private Gnome empowers users to analyze their genetic risk for certain conditions using advanced AI models, while keeping their sensitive data private and secure. The platform combines:

- **Confidential Computing**: All computations are performed in secure enclaves (Intel TDX) via iExec, ensuring end-to-end data privacy.
- **Decentralized Architecture**: No central authority ever sees or stores your raw genetic data.
- **AI-Driven Analysis**: Machine learning models assess genetic risk based on user-supplied SNPs, age, and gender.
- **User-Friendly Web App**: Connect your wallet, upload or input your data, and receive a risk assessment—all in your browser.

---

## 🏗️ Project Structure

- `privategenome-frontend/` – Next.js web app for user interaction, wallet connection, and data submission.
- `iapp/` – iExec confidential computing app (Python) that processes genetic data securely in TDX enclaves.
- `ai-model/` – Machine learning model training and inference scripts for genetic risk prediction.
- `PrivateGnomeCivic/` – (Optional/extension) Civic integration or additional web3 features.

---

## ✨ Key Features

- **Zero raw data exposure**: All sensitive computations happen in TDX enclaves.
- **Wallet-based authentication**: Connect with MetaMask for seamless, decentralized access.
- **AI-powered risk scoring**: Uses multiple SNPs, age, and gender for personalized analysis.
- **GDPR-ready**: Designed with privacy and compliance in mind.
- **Open source**: Built for hackathons, research, and the privacy-first web3 community.

---

## 🖥️ Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.8+ (for AI/model and iApp)
- Docker (for iExec confidential app)
- MetaMask browser extension

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd PrivateGenome
```

### 2. Start the Frontend

```bash
cd privategenome-frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### 3. Run the iExec Confidential App (iApp)

```bash
cd ../iapp
# (Optional) Set up Python environment
pip install -r requirements.txt
# For local testing:
python src/app.py AG TC CT 35 male
# For iExec/TDX: see iapp/README.md for full confidential deployment
```

### 4. Train or Use the AI Model

```bash
cd ../ai-model
# Train model (if needed)
python train.py
# Predict risk (CLI)
python predict.py
```

---

## 🛡️ Privacy & Security

- All genetic data is processed inside iExec TDX confidential enclaves.
- No raw data leaves the user's device unless encrypted and protected.
- Results are deterministic, reproducible, and privacy-preserving.

---

## 🏆 Built for EthBelgrade 2025

Private Gnome is a hackathon project—feedback, contributions, and forks are welcome!

---

## 📂 Directory Overview

```
privategenome-frontend/   # Next.js frontend (wallet, UI, data entry)
iapp/                     # iExec confidential app (Python, TDX)
ai-model/                 # AI/ML model training and inference
PrivateGnomeCivic/        # (Optional) Civic/web3 integrations
```

---

## 🤝 Contributing

Pull requests, issues, and suggestions are welcome! Please open an issue or PR.

---

## 📄 License

MIT 
