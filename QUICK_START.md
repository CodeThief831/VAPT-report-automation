# VAPT Report Automation - Quick Start & Integration Guide

## 🚀 Quick Start (5 minutes)

### 1. Launch Everything
```powershell
./run-all.ps1
```
- ✅ Backend starts on http://localhost:8000
- ✅ Frontend starts on http://localhost:3000
- Both run in separate PowerShell windows

### 2. Open Browser
```
http://localhost:3000
```

### 3. You Should See
- **Empty Findings List** (no mock data)
- **Import Run** form on the right
- **Report Generator** with template options

---

## 📋 Upload & Import Flow (Step-by-Step)

### Scenario: You have a VAPT report PDF and want to analyze it in the system

### Step 1: Prepare Your Data
```json
[
  {
    "id": "F-2025-001",
    "title": "SQL Injection in Login",
    "severity": "Critical",
    "cvss_v3": "9.8",
    "owasp_category": "A03:2021 - Injection",
    "description": "The login form concatenates user input directly into SQL queries...",
    "steps_to_reproduce": [
      {"step_number": 1, "text": "Navigate to /login"},
      {"step_number": 2, "text": "Enter ' OR 1=1 -- in username field"},
      {"step_number": 3, "text": "Click login - bypasses authentication"}
    ],
    "attached_filenames": ["screenshot.png", "burp-proof.pdf"],
    "evidence": []
  },
  {
    "id": "F-2025-002",
    "title": "Reflected XSS in Search",
    "severity": "High",
    "cvss_v3": "7.1",
    "owasp_category": "A03:2021 - Injection",
    "description": "User input is not escaped in search results...",
    "steps_to_reproduce": [
      {"step_number": 1, "text": "Navigate to /search"},
      {"step_number": 2, "text": "Enter <script>alert(1)</script>"},
      {"step_number": 3, "text": "JavaScript executes in browser"}
    ],
    "attached_filenames": ["xss-poc.html"],
    "evidence": []
  }
]
```

**Use Cases for Metadata**:
- 📊 Export from Nessus, Burp, OWASP ZAP as JSON
- 📝 Manually create findings before import
- 🔄 Convert scanner output to this format
- 📂 Use sample_findings.json as template

### Step 2: Copy Metadata to Import Form
1. Click on **Import Run** panel (right side)
2. Clear textarea
3. Paste your JSON array
4. Or click **"Use current findings"** to load from existing

### Step 3: Upload Evidence Files (Optional)
1. Click **"Choose files"** button
2. Select screenshots, PDFs, other evidence
3. Ensure filenames match `attached_filenames` in JSON
4. Example: If JSON says `"attached_filenames": ["screenshot.png"]`, upload screenshot.png

### Step 4: Click Import Run
1. Click **"Import Run"** button
2. Wait for spinner
3. Success message appears
4. **Findings automatically appear in the list below!**

---

## ✏️ Edit & Update Findings

### Click a Finding to Edit
```
Findings List
    ↓
Click "F-2025-001"
    ↓
Finding Editor Opens
    ↓
Edit any field:
  - Title
  - Description
  - Severity (Critical/High/Medium/Low)
  - CVSS Score (0.0-10.0)
  - OWASP Category
  - Steps to Reproduce
    ↓
Click "Save"
    ↓
Backend updates, UI refreshes
```

### Available Edit Operations
- ✏️ **Title**: Change finding name
- 📝 **Description**: Update details
- 🔴 **Severity**: Set impact level
- 📊 **CVSS**: Enter 0.0-10.0 score
- 🏷️ **OWASP**: Select category
- 📋 **Steps**: Add/modify reproduction steps

---

## 📄 Generate Reports

### Select Template & Generate
1. **Template Options**:
   - 🏢 **Corporate** - Professional, executive summary
   - ⚙️ **Minimal** - Compact, technical focus
   - 🔧 **Technical** - Detailed, for developers

2. **Click "Generate Report"**
   - Includes all imported findings
   - Uses colors, gradients, formatting
   - Evidence linked to findings
   - CVSS scores and severity displayed

3. **Output**:
   - HTML report opens in browser
   - Or PDF (if wkhtmltopdf installed)

---

## 🔄 Full Workflow Example

```
Start → Empty Site
   ↓
Upload JSON: [Finding1, Finding2, Finding3]
   ↓
Import Button → Backend creates findings in database
   ↓
Findings Appear in List
   ↓
Edit Finding1 → Change severity Critical→High
   ↓
Save → Backend updates
   ↓
Generate Report → Corporate template
   ↓
Report opens with all findings + colors
   ↓
Done! Share report with client
```

---

## 🛠️ API Endpoints (For Developers)

### Import Findings
```
POST http://localhost:8000/api/runs/{run_id}/import
Content-Type: multipart/form-data

Form Data:
  - metadata: (JSON string) array of findings
  - files: (multipart) evidence files

Response:
  {
    "created": ["F-2025-001", "F-2025-002"],
    "uploaded_files": ["screenshot.png", "burp-proof.pdf"]
  }
```

### Get All Findings
```
GET http://localhost:8000/api/findings/

Response:
  [
    {
      "id": "F-2025-001",
      "title": "SQL Injection in Login",
      ...
    }
  ]
```

### Update Finding
```
PATCH http://localhost:8000/api/findings/{finding_id}
Content-Type: application/json

Body:
  {
    "severity": "High",
    "title": "Updated Title",
    ...
  }

Response: Updated finding object
```

### Generate Report
```
POST http://localhost:8000/api/runs/{run_id}/generate?template=corporate
Content-Type: application/json

Body: [array of findings]

Response:
  {
    "html_content": "...",
    "pdf_generated": true,
    "report_url": "/reports/report-xxx.pdf"
  }
```

---

## 📚 File Structure

```
Report Automation/
├── backend/
│   ├── app/
│   │   ├── main.py              ← API server
│   │   ├── routers/
│   │   │   ├── findings.py      ← Findings CRUD
│   │   │   ├── reports.py       ← Import & generate
│   │   │   └── evidence.py      ← Evidence handling
│   │   ├── models/
│   │   │   └── findings.py      ← Data models
│   │   └── services/
│   │       └── report_generator.py ← Report creation
│   ├── evidence_storage/        ← Uploaded files
│   ├── generated_reports/       ← Generated reports
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js     ← Main container
│   │   │   ├── UploadReport.js  ← Import form
│   │   │   ├── Findings.js      ← Findings list
│   │   │   ├── FindingEditor.js ← Edit modal
│   │   │   └── ReportGenerator.js ← Report button
│   │   ├── services/
│   │   │   └── api.js           ← API client
│   │   └── assets/styles/
│   │       └── tailwind.css
│   └── package.json
│
├── run-all.ps1                  ← Launch script
├── sample_findings.json         ← Example data
├── INTEGRATION_TEST.md          ← Integration docs
└── COMPLETION_SUMMARY.md        ← This session's work
```

---

## 🐛 Troubleshooting

### Issue: Empty Findings List (Expected)
✅ **Normal** - Dashboard starts with no data (no mock findings)
- Solution: Upload and import findings to populate

### Issue: Import Shows Error
❌ **Check**:
1. Is JSON valid? Copy to https://jsonlint.com
2. Are filenames in `attached_filenames` correct?
3. Are evidence files uploaded?

### Issue: Backend Won't Start
❌ **Check**:
1. Is port 8000 available? `netstat -an | findstr 8000`
2. Is Python venv activated?
3. Run `pip install -r requirements.txt`

### Issue: Frontend Won't Start
❌ **Check**:
1. Is port 3000 available? `netstat -an | findstr 3000`
2. Run `npm install` in frontend/
3. Check Node.js version: `node --version` (need 14+)

### Issue: Build Fails
❌ **Check**:
1. `npm run build` shows errors?
2. Clear cache: `rm -r node_modules; npm install`
3. Check for unused imports in warning messages

---

## 📊 Sample Data

### Use Included Sample
```powershell
# Backend has auto_fill_findings.py script
python auto_fill_findings.py

# Or copy from sample_findings.json
Get-Content sample_findings.json | Set-Clipboard
```

### Create Your Own
1. Take your VAPT report (PDF, HTML, etc.)
2. Extract findings information
3. Format as JSON array (see Step 1 above)
4. Paste into Import form
5. Click Import

---

## 🎯 Integration Verification

All components verified working:
- ✅ Upload → Import endpoint
- ✅ Backend stores findings in database
- ✅ Frontend fetches and displays findings
- ✅ Evidence auto-linked by filename
- ✅ User can edit findings
- ✅ Report generation uses findings
- ✅ Zero build errors
- ✅ Zero syntax errors

**Status: PRODUCTION READY** ✨

---

## 📞 Support

### Check Logs
```powershell
# Backend console (PowerShell window)
# Shows API requests and errors

# Browser console (F12)
# Shows frontend errors and API calls
```

### Common Commands
```powershell
# Restart everything
./run-all.ps1

# Build frontend
npm run build

# Check backend syntax
python -m py_compile app/main.py

# View git changes
git status
git log --oneline
```

---

## 🎉 You're All Set!

The system is fully integrated and ready to use:
1. Run `./run-all.ps1`
2. Open http://localhost:3000
3. Upload findings via Import form
4. View in Findings list
5. Edit as needed
6. Generate report

**Happy reporting!** 🚀
