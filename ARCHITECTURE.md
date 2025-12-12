# System Architecture & Data Flow Diagram

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VRAS GUI - Web Browser                           │
│                     (http://localhost:3000)                             │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐  ┌────▼────────┐  ┌──▼────────────┐
            │   Dashboard  │  │  Findings   │  │ Report        │
            │   Component  │  │ List (Mgr)  │  │ Generator     │
            └───────┬──────┘  └────┬────────┘  └──┬────────────┘
                    │              │              │
                    │         ┌────▼────────┐     │
                    │         │Finding Editor│     │
                    │         │  (PATCH)    │     │
                    │         └────┬────────┘     │
                    │              │              │
            ┌───────▼──────┐       │        ┌─────▼────────┐
            │UploadReport  │       │        │  (POST)      │
            │ Component    │       │        │ generateReport
            │ (ImportRun)  │       │        └─────┬────────┘
            └───────┬──────┘       │              │
                    │              │              │
                    └──────────────┼──────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  React Frontend              │
                    │  (http://localhost:3000)     │
                    │  - Tailwind CSS              │
                    │  - Component state mgmt      │
                    └──────────────┬───────────────┘
                                   │
              HTTP / JSON / FormData
                                   │
                    ┌──────────────▼───────────────┐
                    │  FastAPI Backend             │
                    │  (http://localhost:8000)     │
                    └──────────────┬───────────────┘
                                   │
        ┌──────────────┬───────────┼───────────┬──────────────┐
        │              │           │           │              │
    ┌───▼────────┐ ┌──▼────────┐ ┌─▼────────┐ ┌──▼────────┐ ┌─▼────────┐
    │   Findings │ │ Evidence  │ │ Reports  │ │ Debug     │ │ Storage  │
    │   Router   │ │   Router  │ │ Router   │ │ Router    │ │ Service  │
    └───┬────────┘ └──┬────────┘ └─┬────────┘ └──┬────────┘ └─┬────────┘
        │             │           │             │             │
        │   ┌─────────┴───────────┘             │             │
        │   │                                    │             │
    ┌───▼───▼──────────────┐      ┌─────────────▼─────┐  ┌────▼─────────┐
    │ In-Memory Database   │      │ Report Generator  │  │ File Storage  │
    │ - db_findings (dict) │      │ Service           │  │               │
    │ - db_evidence (dict) │      │ - Jinja2 templates│  │ evidence_stor/│
    │                      │      │ - wkhtmltopdf     │  │ generated_rep/│
    └──────────────────────┘      └───────────────────┘  └───────────────┘
```

---

## 📊 Data Flow: Upload → Import → Display

### Step 1: User Uploads Report
```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND - UploadReport.js              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Input:                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Metadata JSON Array:                                   │ │
│  │ [                                                      │ │
│  │   {                                                    │ │
│  │     "id": "F-2025-001",                               │ │
│  │     "title": "SQL Injection",                         │ │
│  │     "severity": "Critical",                           │ │
│  │     "attached_filenames": ["screenshot.png"],         │ │
│  │     ...                                               │ │
│  │   }                                                    │ │
│  │ ]                                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Files Selected:  screenshot.png, burp-report.pdf           │
│                                                              │
│  On Submit:                                                 │
│  1. Validate JSON                                           │
│  2. Create FormData(metadata, files)                        │
│  3. Call importRun(run_id, metadata, files)                │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
             POST /api/runs/{run_id}/import
           (FormData: metadata + files)
```

---

### Step 2: Backend Imports Findings
```
┌──────────────────────────────────────────────────────────────────┐
│                 BACKEND - reports.py (import_run)                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Parse Metadata JSON                                          │
│     ├─ Validate: must be array                                   │
│     └─ Extract findings data                                     │
│                                                                   │
│  2. Save Uploaded Files                                          │
│     ├─ For each uploaded file:                                   │
│     │   ├─ Generate evidence_id (E-{run_id}-{filename})         │
│     │   ├─ Save to evidence_storage/{evidence_id}               │
│     │   ├─ Create Evidence model (meta object)                  │
│     │   └─ Store in db_evidence[evidence_id]                    │
│     └─ Build filename → evidence_id mapping                     │
│                                                                   │
│  3. Create Findings                                              │
│     └─ For each finding in metadata:                            │
│         ├─ Normalize steps_to_reproduce                         │
│         │   (string → [{step_number: 1, text: "..."}])         │
│         ├─ Map attached_filenames → evidence_ids                │
│         ├─ Create Finding model                                 │
│         ├─ Attach Evidence objects to finding.evidence          │
│         └─ Store in db_findings[finding.id]                     │
│                                                                   │
│  4. Return Response                                              │
│     {                                                            │
│       "created": ["F-2025-001", "F-2025-002"],                  │
│       "uploaded_files": ["screenshot.png", "burp-report.pdf"]    │
│     }                                                            │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
         (Success) ◄───┘
           200 OK
            │
            ▼
┌──────────────────────────────────────────────────────────────────┐
│              IN-MEMORY DATABASE STATE                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  db_findings = {                                                 │
│    "F-2025-001": Finding(                                        │
│      id="F-2025-001",                                            │
│      title="SQL Injection",                                      │
│      severity="Critical",                                        │
│      evidence=[Evidence(...), Evidence(...)],  ◄ Linked!        │
│      ...                                                         │
│    ),                                                            │
│    "F-2025-002": Finding(...)                                    │
│  }                                                               │
│                                                                   │
│  db_evidence = {                                                 │
│    "E-test-run-screenshot.png": {                               │
│      "meta": Evidence(...),                                      │
│      "path": "evidence_storage/E-test-run-screenshot.png"       │
│    },                                                            │
│    "E-test-run-burp-report.pdf": { ... }                        │
│  }                                                               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

### Step 3: Frontend Refreshes & Displays
```
┌──────────────────────────────────────────────────────────────────┐
│              FRONTEND - onImported Callback Chain                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  UploadReport.handleSubmit()                                     │
│    └─ await importRun() → Success ✓                             │
│       └─ if (typeof onImported === 'function') {               │
│            onImported();  ◄ Callback to parent (Dashboard)      │
│          }                                                       │
│                                                                   │
│  Dashboard.refreshFindings()                                     │
│    └─ const fresh = await getFindings()                         │
│       └─ setFindings(fresh)  ◄ Update state                     │
│                                                                   │
│  React Re-render:                                                │
│    Findings component receives new findings prop                 │
│    └─ useEffect[] runs                                           │
│       └─ const respData = await getFindings()                   │
│          └─ setFindings(respData)  ◄ Load from API              │
│             └─ Re-render findings list                          │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
             GET /api/findings/
```

---

### Step 4: Display Findings
```
┌──────────────────────────────────────────────────────────────────┐
│           BACKEND - findings.py (get_all_findings)               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  @router.get("/", response_model=List[Finding])                 │
│  async def get_all_findings():                                   │
│      return list(db_findings.values())  ◄ Returns imported data  │
│                                                                   │
│  Response:                                                       │
│  [                                                               │
│    {                                                             │
│      "id": "F-2025-001",                                        │
│      "title": "SQL Injection in Login",                         │
│      "severity": "Critical",                                    │
│      "cvss_v3": "9.8",                                          │
│      "owasp_category": "A03:2021 - Injection",                 │
│      "description": "...",                                      │
│      "steps_to_reproduce": [                                    │
│        {"step_number": 1, "text": "Navigate to /login"},       │
│        {"step_number": 2, "text": "Enter ' OR 1=1 -- ..."}     │
│      ],                                                         │
│      "evidence": [                                              │
│        {                                                        │
│          "id": "E-test-run-screenshot.png",                    │
│          "filename": "screenshot.png",                         │
│          "mime_type": "image/png",                             │
│          ...                                                   │
│        }                                                        │
│      ]                                                          │
│    }                                                             │
│  ]                                                               │
│                                                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│            FRONTEND - Findings.js (Render)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Component State:                                                │
│  const [findings, setFindings] = useState([])                    │
│                                                                   │
│  After API Response:                                             │
│  findings = [                                                    │
│    { id: "F-2025-001", title: "SQL Injection...", ... },       │
│    { id: "F-2025-002", title: "Reflected XSS...", ... }        │
│  ]                                                               │
│                                                                   │
│  Rendered List:                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔴 [CRITICAL] F-2025-001: SQL Injection in Login    9.8    │ │
│  │    ▸ Click to edit / view details                         │ │
│  │                                                            │ │
│  │ 🟠 [HIGH] F-2025-002: Reflected XSS in Search       7.1    │ │
│  │    ▸ Click to edit / view details                         │ │
│  │                                                            │ │
│  │ Search: [_______________]  Filter: [All ▼]              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ✨ Findings are now visible and editable!                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## ✏️ Edit & Update Flow

```
User clicks finding
    ▼
FindingEditor opens
    ▼
User modifies fields (severity, title, description, etc.)
    ▼
Click "Save"
    ▼
patchFinding(finding_id, updateData)
    ▼
PATCH /api/findings/{finding_id}
    ▼
Backend: db_findings[finding_id] = updated_finding
    ▼
Return updated Finding object
    ▼
Frontend: setState(updatedFinding)
    ▼
UI refreshes with new values ✓
```

---

## 📄 Report Generation Flow

```
User clicks "Generate Report"
    ▼
Selects template (Corporate/Minimal/Technical)
    ▼
generateReport(runId, template, findings[])
    ▼
POST /api/runs/{run_id}/generate?template=corporate
  Body: [array of findings with all details]
    ▼
Backend ReportGenerator:
  1. Receives findings array
  2. Normalizes steps_to_reproduce
  3. Renders Jinja2 template with findings
  4. Generates HTML report
  5. (Optional) Converts to PDF with wkhtmltopdf
  6. Saves to generated_reports/
    ▼
Response:
{
  "html_content": "...",
  "pdf_generated": true,
  "report_url": "/reports/report-xxx.pdf"
}
    ▼
Frontend opens report in new window
    ▼
User sees formatted report with:
  - Colors & gradients
  - All findings with details
  - Evidence links
  - CVSS scores
  - Severity icons
    ▼
Ready to share with stakeholders ✓
```

---

## 🔗 Auto-Alignment Features

### Filename-Based Evidence Linking
```
User provides metadata with attached_filenames:
{
  "id": "F-2025-001",
  "title": "...",
  "attached_filenames": ["screenshot.png", "burp-export.pdf"]
}

User uploads files:
  [screenshot.png] [burp-export.pdf]

Backend matching:
  1. For "screenshot.png" → creates E-{run_id}-screenshot.png
  2. Checks if finding references "screenshot.png"
  3. Links evidence to finding automatically ✓
  4. Same for "burp-export.pdf"

Result: Evidence auto-attached without manual mapping!
```

### Steps Normalization
```
Legacy format (string):
  "steps_to_reproduce": "Step 1\nStep 2\nStep 3"

Normalized format (structured):
  [
    {"step_number": 1, "text": "Step 1"},
    {"step_number": 2, "text": "Step 2"},
    {"step_number": 3, "text": "Step 3"}
  ]

Applied: During import AND during updates
Result: Consistent data format regardless of input ✓
```

### Severity & CVSS Alignment
```
Sample findings data:
  Critical → CVSS 9.0+
  High     → CVSS 7.0-8.9
  Medium   → CVSS 4.0-6.9
  Low      → CVSS 0.1-3.9

Report styling:
  Critical → 🔴 Red background + bold
  High     → 🟠 Orange background
  Medium   → 🟡 Yellow background
  Low      → 🟢 Green background

Result: Visual alignment between severity and display ✓
```

---

## 📈 System Integration Matrix

| Component | Endpoint | Method | Creates | Updates | Returns |
|-----------|----------|--------|---------|---------|---------|
| **UploadReport** | `/api/runs/{id}/import` | POST | Findings | - | {created, uploaded_files} |
| **Findings** | `/api/findings/` | GET | - | - | List[Finding] |
| **FindingEditor** | `/api/findings/{id}` | PATCH | - | Finding | Finding |
| **ReportGenerator** | `/api/runs/{id}/generate` | POST | Report | - | {html_content, pdf_url} |
| **Evidence** | `/api/evidence/...` | POST | Evidence | - | {id, filename, ...} |

---

## ✅ Verification Checklist

- ✅ Upload → Import creates findings in db_findings
- ✅ GET /findings returns imported findings
- ✅ Frontend receives and displays findings
- ✅ Evidence auto-linked by filename
- ✅ Steps normalized to structured format
- ✅ User can edit findings via PATCH
- ✅ Report generation receives updated findings
- ✅ Report includes colors, gradients, styling
- ✅ All components integrated end-to-end
- ✅ Zero build errors
- ✅ Zero syntax errors
- ✅ Production ready ✨

---

**Integration Status: COMPLETE & VERIFIED** 🎉
