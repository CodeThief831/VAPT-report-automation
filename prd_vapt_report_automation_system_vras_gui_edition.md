# PRD: VAPT Report Automation System (VRAS) — GUI Edition

**Version:** 1.1

**Owner:** (TBD)

**Goal:**
Enhance the VAPT Report Automation System (VRAS) into a user-friendly **GUI tool** that enables security teams to import scanner outputs, review and edit findings, attach **Steps to Reproduce (STR)** and multiple **screenshots / evidence images**, and generate a fully formatted PDF/HTML/JSON report where screenshots and STRs are embedded per finding.

---

# 1. Summary
This PRD extends the existing VRAS specification to define a graphical interface and interactive workflow for manual verification, evidence capture, and report generation. The GUI should let users:

- Browse and upload scanner outputs and raw artifacts
- Inspect parsed findings and map them to OWASP Top 10 categories
- Edit, de-duplicate, or merge findings
- Add *Steps to Reproduce (STR)* and attach multiple screenshots or evidence files for each finding via an intuitive editor
- Annotate images (crop, draw arrows, add text labels)
- Preview how evidence will appear in the final report
- Generate polished PDF/HTML/JSON reports with embedded screenshots placed inside each finding section

---

# 2. Key Additions & Rationale

1. **Finding Editor Panel** — a single-pane editor for each finding with structured fields and WYSIWYG STR entry.
2. **Evidence Manager** — upload, tag, view, annotate and attach images/files per finding.
3. **Report Preview & Template Selector** — live preview of PDF/HTML output and branding/template selection.
4. **Bulk Attach / Bulk Actions** — bulk-apply screenshots or steps to multiple findings (optional but useful when verifying similar issues).
5. **Audit Trail** — who added/edited STRs or screenshots, with timestamps.

These ensure the human-in-the-loop can add high-quality PoC content—critical for client-facing VAPT reports.

---

# 3. Updated Scope (GUI-specific)

## In Scope (new)
- Complete web-based GUI (or Electron desktop) for result review and evidence attachment
- Per-finding STR text entry with rich text (code blocks, ordered lists)
- Per-finding screenshot uploads (multiple) and simple in-app annotation tools
- Preview of how images and STRs will render in the final PDF/HTML
- Image size, format validation and auto-optimization for PDF embedding
- Export that embeds evidence inline in findings and preserves file links in the appendix

## Out of Scope (unchanged)
- Performing the actual network/web scans
- Live exploitation or dangerous verifications

---

# 4. GUI User Personas & Tasks

### Personas
- **Penetration Tester (PT):** Reviews parsed findings, writes STRs, attaches screenshots, marks verified/unverified.
- **Security Analyst (SA):** Reviews PT's edits, provides remediation text, approves for release.
- **Engagement Manager (EM):** Selects templates and generates the final PDF for clients.

### Core Tasks
- Upload scan outputs and raw artifacts
- Open any finding and: edit description, set OWASP mapping, compute/override CVSS, add STR, attach screenshots
- Annotate or crop screenshots in-app
- Preview report and export

---

# 5. Detailed Functional Requirements (GUI)

## 5.1 Main Screens
1. **Dashboard:** Projects list, recent runs, quick stats (counts by severity, OWASP categories)
2. **Project Run View:** Shows scope, uploaded artifacts, parsed findings summary, action buttons (Review Findings, Attach Evidence, Generate Report)
3. **Findings Table:** Searchable, filterable table with columns: ID, Title, OWASP, Severity, Status (Unverified/Verified/False Positive), Evidence count.
4. **Finding Detail Editor (core):**
   - Header: Finding ID, title, severity, CVSS (editable), OWASP tags
   - Tabs/Sections: Summary | Steps to Reproduce (STR) | Evidence | Remediation | References | History
   - STR Editor: Rich text editor supporting ordered lists, preformatted code block, inline code, copy/paste from Burp/Raw requests
   - Evidence Panel: upload area, existing attachments, thumbnails, annotation button, match-to-step mapping
   - Quick actions: Mark Verified / Mark False Positive / Assign Owner

## 5.2 Evidence Manager
- **Upload:** Drag-and-drop or file selector; accept PNG, JPG, WEBP, PDF (single-page screenshots), GIF (optional). Maximum file size configurable (default 10 MB).
- **Auto-tagging:** Suggest a filename-based tag (e.g., xss_screenshot_01 -> suggests "XSS")
- **Multiple attachments per finding:** Ordered list; specify which STR step the image demonstrates.
- **Annotation tool:** Minimal: crop, rectangle/arrow, text label, blur sensitive parts. Non-destructive edits produce new derived image files; original preserved.
- **Thumbnail gallery:** click to enlarge; keyboard left/right to navigate.
- **Evidence metadata:** uploader, timestamp, original filename, size, resolution.

## 5.3 STR (Steps to Reproduce) UX
- **Structured input:** Allow users to add numbered steps with optional code/request blocks and a "Attach evidence" button inline to link a screenshot to that step.
- **Per-step evidence linking:** The report renders Step N with the linked screenshots immediately below that step.
- **STR templates:** Common templates for SQLi/XSS/SSRF/etc. with pre-filled example steps the PT can adapt.

## 5.4 Report Generation UI
- **Template selector:** Corporate (default) + Minimal + Technical (detailed), with configurable branding options (logo, colors, footer)
- **Report options modal:** Choose which sections to include (Executive Summary, Appendix, Raw Tool Outputs), select date, author names, include signed authorization PDF
- **Preview pane:** WYSIWYG preview of the PDF/HTML (paged view). Images should show where they'll be embedded.
- **Generate button:** Exports report.pdf, report.html, findings.json, raw_scans.zip. Progress bar and logs.

---

# 6. Data Model Extensions (evidence & STR)

### Finding (extended)
```json
{
  "id": "F-2025-001",
  "title": "Reflected XSS in /search",
  "owasp_category": "A3: Injection (XSS)",
  "severity": "High",
  "cvss_v3": "7.4",
  "affected_asset": {...},
  "description": "...",
  "steps_to_reproduce": [
    {"step_number": 1, "text": "Open https://...", "attached_evidence_ids": ["E-1001"]},
    {"step_number": 2, "text": "Inject <script> ...", "attached_evidence_ids": ["E-1002", "E-1003"]}
  ],
  "evidence": [
    {"id":"E-1001","filename":"xss_1.png","uploader":"sai","timestamp":"2025-12-11T10:15:00+05:30","annotations": [ ... ], "caption":"Screenshot showing reflection in results" }
  ],
  ...
}
```

### Evidence Object
- id (unique)
- filename
- mime_type
- size
- resolution
- uploader
- timestamp
- derived_images: [annotation variants]
- linked_step_numbers: []
- caption

---

# 7. Report Rendering Rules (how STR and screenshots embed)

1. **Per-finding layout:** Each finding's "Detailed Finding" page includes: Title, OWASP mapping, CVSS, Description, Steps to Reproduce (numbered), and Evidence.
2. **Inline evidence:** For each STR step that has linked evidence, render the step text followed immediately by a thumbnail row of the linked screenshots with captions. Thumbnails should link to full-size images in the appendix.
3. **Evidence order:** Respect the ordered list from the Finding Editor; allow PT to reorder before generating.
4. **Appendix:** All evidence files are also included in an Appendix section with original metadata and full-size images. Appendix includes raw tool outputs zipped.
5. **PDF behavior:** Images embedded at a maximum width aligned to page margins; allow 1–3 images per row. Images should not split across pages; if they would, move them to the next page and place a "continued" marker.
6. **Image optimization:** Resize to 150–300 DPI for PDF; keep lossless for PNG where possible. Strip EXIF unless "Preserve EXIF" selected.

---

# 8. UX & Accessibility
- Keyboard navigable
- Screen-reader friendly labels for form fields
- Contrast and color-blind friendly palettes for severity color-coding

---

# 9. Non-Functional Requirements (GUI additions)
- **Scalability:** UI should remain responsive with up to 10,000 findings (paging/virtual scrolling)
- **Storage:** Images stored in object storage (S3-compatible) with lifecycle policy; original + derived images preserved for 90 days (configurable)
- **Security:** Image uploads scanned for malware and sanitized; no client-side execution of uploaded content
- **Performance:** Report preview render within 3s for runs with ≤100 findings

---

# 10. APIs & Endpoints (brief)
- `POST /api/runs/{run_id}/evidence` — upload image(s) (multipart)
- `GET /api/evidence/{evidence_id}` — retrieve image metadata
- `POST /api/findings/{finding_id}/steps` — add STR step
- `PATCH /api/findings/{finding_id}` — edit finding (title, severity, cvss, owasp tags)
- `POST /api/runs/{run_id}/generate?template=corporate` — generate report (returns job id and downloadable artifacts)

---

# 11. Acceptance Criteria (updated)
- User can attach ≥1 screenshot to a finding and link it to a specific STR step. **MUST**
- Attached screenshots appear inline under the corresponding STR in the generated PDF and HTML. **MUST**
- Annotation edits create derived images; original preserved. **MUST**
- Report preview shows embedded images exactly as they will appear in the exported PDF. **MUST**
- Evidence metadata (uploader, timestamp, filename) must appear in the Appendix. **MUST**
- System must validate and reject unsupported file types and files exceeding size limit, showing clear error messages. **MUST**

---

# 12. Wireframe & Interaction Flow (textual)

1. Project Run → Click **Review Findings**
2. Findings Table → Click a finding row → opens **Finding Detail Editor** (right-hand drawer)
3. In the STR tab: Add steps as numbered list; click **Attach Evidence** inline → opens Evidence Manager modal
4. Evidence Manager modal → drag-drop screenshots or choose from existing uploads → optionally annotate → click **Link to Step**
5. After adding evidence, click **Save Draft** or **Mark Verified**
6. Once review is complete, go to **Generate Report** → choose template/options → Preview → Generate

---

# 13. Implementation Notes & Tools
- Frontend: React + Tailwind (recommended) or Electron for desktop
- Image annotation: integrate lightweight JS library (e.g., Fabric.js, Konva)
- Backend: Python (FastAPI) or Node (Express) with S3-compatible object storage
- PDF generation: headless Chromium + styled HTML templates (wkhtmltopdf or Puppeteer) or a PDF library that preserves image quality
- Authentication/ACLs: RBAC for upload/edit/generate

---

# 14. Testing & QA
- Unit tests for data model serialization (STR, evidence linking)
- Integration tests: Upload image → attach to step → generate PDF → verify image appears inline
- Manual QA: visual check across templates and page-break edge cases

---

# 15. Roadmap & Enhancements (optional)
- In-app screen-recording support (to capture interactive PoC flows)
- OCR on screenshots to extract request/response snippets automatically
- Auto-screenshot from Burp/ZAP request/response rendering (convert HTTP to image)
- Electronic signature integration for signed reports

---

# 16. Open Questions (to decide before development)
1. Desktop app (Electron) vs pure web app? (offline image handling consideration)
2. Preferred max file size and retention policy for evidence?
3. Should annotations be collaborative (multi-user live edit) or single-user snapshot?

---

# 17. Deliverables
- Updated PRD (this document)
- UI mockups (optional next step)
- OpenAPI endpoints (detailed)
- Sample run with images embedded (example report)

---

**Next step:** I can generate UI mockups for the key screens (Finding Editor + Evidence Manager + Report Preview) or produce the OpenAPI spec and starter code for the upload endpoints. Which one would you like first?

