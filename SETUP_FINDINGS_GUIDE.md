# VAPT Report Automation - Setup & Usage Guide

## 🎯 What's New

### Updated Features

- ✅ **New Professional Color Scheme**: Dark blue gradient (#0d47a1 to #1976d2) with improved visual hierarchy
- ✅ **Enhanced Alignment**: Better padding, spacing, and typography throughout
- ✅ **Sample Findings**: 12 realistic VAPT findings pre-configured based on industry standards
- ✅ **Edit Functionality**: Full CRUD capability for findings with real-time updates
- ✅ **Improved UI**: Modern cards, badges, and responsive layout

---

## 📋 Sample Findings Included

The system comes with **12 pre-configured realistic VAPT findings**:

### Critical Severity (2)

1. **SQL Injection in User Login Form** - F-2025-001
   - CVSS: 9.8 | OWASP: A03:2021 - Injection
   
2. **Unencrypted Sensitive Data in Transit** - F-2025-009
   - CVSS: 9.1 | OWASP: A02:2021 - Cryptographic Failures

### High Severity (5)

1. **Reflected XSS in Search Function** - F-2025-002
   - CVSS: 7.1 | OWASP: A03:2021 - Injection

2. **Weak Password Policy** - F-2025-003
   - CVSS: 7.5 | OWASP: A04:2021 - Insecure Design

3. **Sensitive Data Exposure in Source Code** - F-2025-004
   - CVSS: 7.3 | OWASP: A01:2021 - Broken Access Control

4. **Broken Authentication - Session Fixation** - F-2025-008
   - CVSS: 8.1 | OWASP: A07:2021 - Identification and Authentication Failures

5. **Path Traversal Vulnerability** - F-2025-010
   - CVSS: 7.5 | OWASP: A01:2021 - Broken Access Control

### Medium & Low Severity (5)

1. **Missing HTTP Security Headers** - F-2025-005
   - CVSS: 5.3 | OWASP: A01:2021 - Broken Access Control

2. **Insecure Direct Object References (IDOR)** - F-2025-006
   - CVSS: 7.5 | OWASP: A01:2021 - Broken Access Control

3. **Cross-Site Request Forgery (CSRF)** - F-2025-007
   - CVSS: 6.5 | OWASP: A03:2021 - Injection

4. **Hardcoded Secrets and API Keys** - F-2025-011
   - CVSS: 9.8 | OWASP: A02:2021 - Cryptographic Failures

5. **Missing Input Validation** - F-2025-012
   - CVSS: 6.5 | OWASP: A03:2021 - Injection

---

## 🚀 Quick Start

### Step 1: Load Sample Findings

Run the auto-fill script to populate the findings into the backend:

```bash
cd backend
python auto_fill_findings.py
```

Expected output:
```
======================================================================
VAPT Report Automation - Sample Findings Auto-Fill
======================================================================

[1/3] Loading findings from sample_findings.json...
✓ Loaded 12 findings from JSON

[2/3] Parsing findings...
✓ Parsed 12 findings successfully

[3/3] Populating database...
✓ Loaded: F-2025-001 - SQL Injection in User Login Form (Critical)
✓ Loaded: F-2025-002 - Reflected XSS in Search Function (High)
...
✓ Successfully loaded 12 findings!

Setup Complete! Your findings are ready for report generation.
======================================================================
```

### Step 2: Start the Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Start the Frontend

```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

### Step 4: View and Edit Findings

1. Navigate to the **Dashboard** tab
2. Click on any finding in the left sidebar to select it
3. Click **Edit** button to modify the finding
4. Make changes to title, severity, description, or steps
5. Click **Save Changes** to persist

### Step 5: Generate Report

1. Go to **Report Generator** tab
2. Click **Generate Report**
3. View the professional VAPT report with your findings
4. Download as PDF

---

## 🎨 Color Scheme Updates

### New Professional Palette

**Primary Colors:**

- Dark Blue Primary: `#0d47a1`
- Blue Accent: `#1565c0`
- Light Blue: `#1976d2`

**Severity Colors:**

- Critical: Red (#c62828) with gradient
- High: Orange (#f57c00) with gradient
- Medium: Yellow (#fbc02d) with gradient
- Low: Green (#2e7d32) with gradient

**Backgrounds:**

- Light backgrounds use shades of blue (#f1f6ff, #e3f2fd)
- Professional gradients for emphasis elements

---

## 📝 API Endpoints

### Findings Management

#### GET All Findings

```bash
curl http://localhost:8000/api/findings
```

#### GET Single Finding

```bash
curl http://localhost:8000/api/findings/F-2025-001
```

#### CREATE Finding

```bash
curl -X POST http://localhost:8000/api/findings \
  -H "Content-Type: application/json" \
  -d @finding.json
```

#### UPDATE Finding (PUT - Replace)

```bash
curl -X PUT http://localhost:8000/api/findings/F-2025-001 \
  -H "Content-Type: application/json" \
  -d @updated_finding.json
```

#### PATCH Finding (Partial Update)

```bash
curl -X PATCH http://localhost:8000/api/findings/F-2025-001 \
  -H "Content-Type: application/json" \
  -d '{"severity": "Critical", "title": "New Title"}'
```

---

## 📊 Report Features

The generated report includes:

✅ **Professional Cover Page** - Gradient background with report metadata
✅ **Executive Summary** - Risk overview with severity counts (4-column grid)
✅ **Risk Assessment Cards** - Visual representation of Critical/High/Medium/Low counts
✅ **OWASP Categories Table** - Breakdown by vulnerability category
✅ **Detailed Findings** - Each finding with:
   - Severity badge (color-coded)
   - OWASP category
   - CVSS score
   - Detailed description
   - Steps to reproduce (numbered list)
   - Evidence section
✅ **Recommendations** - Security improvement suggestions
✅ **Evidence Appendix** - Reference to all supporting materials
✅ **Professional Typography** - Roboto font with proper hierarchy
✅ **High-Quality PDF** - 300 DPI with proper margins and pagination

---

## ✏️ Editing Findings

### In the FindingEditor Component

1. **Header Section** - Shows Finding ID and Title
2. **Severity & Metadata** - Editable fields for:
   - Severity level (Critical/High/Medium/Low)
   - CVSS v3.0 Score
   - OWASP Category

3. **Title & Description** - Inline editing with text area

4. **Steps to Reproduce** - 
   - View mode: Numbered list with visual cards
   - Edit mode: Editable fields with remove buttons
   - Add new steps with the input field

5. **Save/Cancel** - Bottom buttons to commit or discard changes

### Status Feedback

- ✓ Green success message when saved
- ✗ Red error message if save fails
- Auto-dismiss after 3 seconds

---

## 📁 File Structure

```
Report Automation/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── findings.py          # Finding data models
│   │   ├── routers/
│   │   │   └── findings.py          # API endpoints (includes PUT)
│   │   ├── templates/
│   │   │   └── report.html          # Updated with new colors
│   │   └── main.py                  # FastAPI app
│   ├── auto_fill_findings.py        # NEW: Auto-populate script
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── components/
│           ├── FindingEditor.js     # ENHANCED: Full edit UI
│           ├── Findings.js          # UPDATED: New list layout
│           └── Dashboard.js         # Uses new components
├── sample_findings.json             # NEW: 12 realistic findings
└── README.md
```

---

## 🔧 Customization

### Change Report Colors

Edit `backend/app/templates/report.html` in the `<style>` section:

```css
/* Primary Colors */
.cover-page {
    background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}

h2 {
    color: #YOUR_HEADER_COLOR;
    border-bottom: 4px solid #YOUR_BORDER_COLOR;
}
```

### Add More Findings

1. Add entries to `sample_findings.json` following the existing format:

```json
{
    "id": "F-2025-013",
    "title": "Your Finding Title",
    "owasp_category": "A03:2021 - Injection",
    "severity": "High",
    "cvss_v3": "7.5",
    "description": "Detailed description...",
    "steps_to_reproduce": [
        {"step_number": 1, "text": "Step text..."},
        {"step_number": 2, "text": "Step text..."}
    ],
    "evidence": []
}
```

1. Run auto-fill script again:

```bash
python auto_fill_findings.py
```

### Modify Finding Severity Colors

In `FindingEditor.js`, update the `getSeverityColor` function:

```javascript
const getSeverityColor = (severity) => {
    const colors = {
        'Critical': 'bg-YOUR_COLOR text-white border-YOUR_BORDER',
        // ... other severities
    };
    return colors[severity] || colors['Medium'];
};
```

---

## 🐛 Troubleshooting

### Findings not loading?

- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py`
- Verify findings exist: `curl http://localhost:8000/api/findings`

### Edit button not appearing?

- Clear browser cache (Ctrl+Shift+Delete)
- Reload the page
- Check browser console for errors (F12)

### PDF report not generating?

- Verify wkhtmltopdf is installed: `which wkhtmltopdf`
- Check file permissions in `/generated_reports`
- Review backend logs for PDF generation errors

### Color not applying in report?

- Ensure report.html is updated with new CSS
- Check that CSS is not being overridden
- Verify PDF options in `report_generator.py` include `--print-media-type`

---

## 📞 Support

For issues or questions:

