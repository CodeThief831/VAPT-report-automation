import os
from jinja2 import Environment, FileSystemLoader, select_autoescape
from typing import List
from app.models.findings import Finding
import logging
import pdfkit
from datetime import datetime

class ReportGenerator:
    def __init__(self, template: str = "default"):
        self.template_name = "report.html"
        # Enable autoescaping for HTML templates to avoid rendering raw user HTML
        # Use an absolute path for templates so the loader works regardless of CWD
        templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
        self.env = Environment(
            loader=FileSystemLoader(templates_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
        self.template = self.env.get_template(self.template_name)

    def generate(self, findings: List[Finding], run_id: str):
        html_content = self._render_html(findings, run_id)
        # In a real app, we might use a more robust temp dir solution
        output_dir = "generated_reports"
        os.makedirs(output_dir, exist_ok=True)
        report_path = os.path.join(output_dir, f"report-{run_id}.html")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        # Attempt to also produce a PDF using wkhtmltopdf via pdfkit.
        pdf_path = os.path.join(output_dir, f"report-{run_id}.pdf")
        try:
            self._to_pdf(html_content, pdf_path)
            logging.info(f"Generated PDF report at: {pdf_path}")
        except Exception as e:
            logging.exception("Failed to generate PDF report: %s", e)
            pdf_path = None
        # Return html path, pdf path (or None), and the rendered HTML content
        return {"html": report_path, "pdf": pdf_path, "html_content": html_content}

    def _render_html(self, findings: List[Finding], run_id: str):
        # Compute OWASP category counts to surface in the report summary
        owasp_counts = {}
        for f in findings:
            key = (f.owasp_category or "Uncategorized").strip()
            owasp_counts[key] = owasp_counts.get(key, 0) + 1

        # Count severity levels
        severity_counts = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
        for f in findings:
            severity = f.severity.strip()
            if severity in severity_counts:
                severity_counts[severity] += 1

        return self.template.render(
            findings=findings,
            run_id=run_id,
            owasp_counts=owasp_counts,
            severity_counts=severity_counts,
            report_date=datetime.now().strftime("%B %d, %Y")
        )

    def _to_pdf(self, html_content: str, output_path: str):
        """Render HTML content to PDF using pdfkit/wkhtmltopdf.

        Requires `wkhtmltopdf` binary to be installed on the host system.
        """
        # pdfkit.from_string will raise an OSError if wkhtmltopdf is not found
        options = {
            'enable-local-file-access': None,
            'quiet': '',
            'print-media-type': None,
            'margin-top': '15mm',
            'margin-bottom': '15mm',
            'margin-left': '10mm',
            'margin-right': '10mm',
            'page-size': 'A4',
            'dpi': 300,
        }
        try:
            pdfkit.from_string(html_content, output_path, options=options)
        except OSError as e:
            # Provide a clearer error when the external binary is missing
            raise RuntimeError("wkhtmltopdf binary not found. Please install wkhtmltopdf on the system.") from e
        except Exception:
            # bubble up other exceptions
            raise
