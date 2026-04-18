# Ethan Reyes — Engineering & Cloud Development Portfolio

**Data Engineer & Software Developer | Wichita, KS**
[ethanreyes.netlify.app](https://ethanreyes.netlify.app) • [GitHub](https://github.com/Ethan-Reyes) • [LinkedIn](https://linkedin.com)

## 🚀 Project Mission

A technical showcase bridging heavy-industry data with modern cloud-native applications. This project serves as a professional portfolio and an engineering sandbox for exploring **Data Engineering**, **Systems Automation**, and **Software Management**.

## 🎓 About the Author

- **Education:** AAS in Cloud Computing & App Development (WSU Tech) | Expected 2027
- **Standing:** 4.0 GPA
- **Current Role:** Engineering Assistant at **Textron Aviation** (Ennovar Contractor)
- **Roadmap:** Transferring to **Wichita State University** to pursue a B.S. in Applied Engineering followed by a Master’s in Engineering Management (Expected 2029).

---

## 🌐 Cloud Architecture & Deployment Philosophy

> _"Efficiency in infrastructure allows for excellence in engineering."_

To maximize focus on **Applied Engineering** and **Aviation Diagnostics**, this portfolio utilizes a modern **Serverless Cloud Architecture**:

- **Continuous Integration/Deployment (CI/CD):** Integrated with GitHub to automate the build pipeline. Every structural update is verified and deployed instantly upon `git push`.
- **Serverless Edge Distribution:** Leverages **Netlify** to ensure 99.9% availability and global performance with **Zero Infrastructure Overhead**.
- **Operational Excellence:** By abstracting server management, 100% of development bandwidth is shifted toward high-value engineering output (AReS 3 diagnostics) rather than environment maintenance.
- **Serverless Functions:** Custom backend logic handles visitor tracking and resume download logging without a traditional server.

---

## 🛠 Featured Engineering Projects

### 1. 3D Visitor Globe

Built a fully working interactive 3D globe using **Three.js** featuring a rotating Earth, amber atmospheric glow, and orbit controls. It features glowing amber pins that scale with visit counts, pulling data directly from a `get-stats` Netlify function.

### 2. Aviation Data Pipeline (C# / .NET)

Developed a C# .NET ingestion engine to process FAA aviation data. This application pulls raw datasets, cleans and structures them, and prepares the data for visualization in Power BI, mimicking enterprise aerospace diagnostic workflows.

### 3. AI-Powered Transcription Pipeline (Python & Whisper)

- **The Challenge:** Automating the transcription of 8+ hours of raw technical interview audio.
- **The Solution:** Developed a custom Python pipeline utilizing **OpenAI Whisper** and **FFmpeg**.
- **Achievement:** Engineered scripts to programmatically merge and format individual transcripts into a structured technical master document.

### 4. Automated Test Suite (TDD with Jest & JSDOM)

- **Integrity:** 32 tests across 6 specialized suites covering UI logic, navigation, and DOM integrity.
- **Security:** Developed and validated **XSS (Cross-Site Scripting) sanitization** logic to ensure secure handling of interview data.

### 5. Data Pipeline & Analytics

Developed a Python-based ETL pipeline to extract visitor metrics from Netlify Blobs API. Implemented secure credential management using `python-dotenv` and visualized site performance via a **Power BI** dashboard.

---

## 💻 Technical Stack

| Layer            | Technologies                                            |
| :--------------- | :------------------------------------------------------ |
| **Frontend**     | HTML5, CSS3, JavaScript (ES6+), Three.js                |
| **Languages**    | Python, C#, PowerShell, Java, .NET                      |
| **Cloud/DevOps** | AWS (Certified Cloud Practitioner), Netlify, Git/GitHub |
| **Data/Testing** | Power BI, Jest, JSDOM, SQL                              |

---

## 📂 Project Structure

```text
Website Project/
├── code/                       # Main development directory
│   ├── web-reyes.html          # SPA Portfolio
│   ├── web-reyes.test.js       # TDD Test Suite (32 Tests)
│   ├── globe/                  # 3D Globe Assets
│   └── aviation_pipeline/      # C# Data Project
├── netlify/
│   └── functions/              # Serverless backend logic
├── netlify.toml                # CI/CD configuration
└── README.md
```
