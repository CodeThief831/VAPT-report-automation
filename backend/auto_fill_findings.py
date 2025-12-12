#!/usr/bin/env python3
"""
Auto-fill script to populate sample VAPT findings into the Report Automation system.
This script reads sample findings from sample_findings.json and populates them into the backend.
"""

import json
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.models.findings import Finding, StepToReproduce, EvidenceLink

def load_sample_findings(filepath: str) -> list:
    """Load sample findings from JSON file."""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"Error: File {filepath} not found")
        return []
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {filepath}")
        return []

def parse_findings(data: list) -> list:
    """Parse JSON data into Finding objects."""
    findings = []
    for item in data:
        try:
            # Convert steps_to_reproduce to StepToReproduce objects
            steps = []
            if 'steps_to_reproduce' in item:
                for step_data in item['steps_to_reproduce']:
                    steps.append(StepToReproduce(
                        step_number=step_data.get('step_number', 0),
                        text=step_data.get('text', ''),
                        attached_evidence_ids=step_data.get('attached_evidence_ids', [])
                    ))
            
            # Convert evidence to EvidenceLink objects
            evidence = []
            if 'evidence' in item:
                for ev_data in item['evidence']:
                    evidence.append(EvidenceLink(
                        id=ev_data.get('id', ''),
                        filename=ev_data.get('filename', ''),
                        uploader=ev_data.get('uploader', 'auto'),
                        timestamp=ev_data.get('timestamp', ''),
                        caption=ev_data.get('caption', '')
                    ))
            
            # Create Finding object
            finding = Finding(
                id=item.get('id', ''),
                title=item.get('title', ''),
                owasp_category=item.get('owasp_category'),
                severity=item.get('severity', 'Medium'),
                cvss_v3=item.get('cvss_v3'),
                description=item.get('description', ''),
                steps_to_reproduce=steps,
                evidence=evidence
            )
            findings.append(finding)
        except Exception as e:
            print(f"Warning: Failed to parse finding {item.get('id', 'unknown')}: {e}")
            continue
    
    return findings

def populate_findings_in_db(findings: list):
    """Populate findings into the in-memory database."""
    from app.routers.findings import db_findings
    
    count = 0
    for finding in findings:
        db_findings[finding.id] = finding
        count += 1
        print(f"✓ Loaded: {finding.id} - {finding.title} ({finding.severity})")
    
    print(f"\n✓ Successfully loaded {count} findings!")
    return count

def main():
    """Main function."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sample_file = os.path.join(script_dir, 'sample_findings.json')
    
    print("=" * 70)
    print("VAPT Report Automation - Sample Findings Auto-Fill")
    print("=" * 70)
    
    # Load findings from JSON
    print(f"\n[1/3] Loading findings from {sample_file}...")
    data = load_sample_findings(sample_file)
    if not data:
        print("Error: No findings loaded")
        return 1
    print(f"✓ Loaded {len(data)} findings from JSON")
    
    # Parse findings
    print(f"\n[2/3] Parsing findings...")
    findings = parse_findings(data)
    if not findings:
        print("Error: No findings parsed")
        return 1
    print(f"✓ Parsed {len(findings)} findings successfully")
    
    # Populate database
    print(f"\n[3/3] Populating database...")
    count = populate_findings_in_db(findings)
    
    print("\n" + "=" * 70)
    print("Setup Complete! Your findings are ready for report generation.")
    print("=" * 70)
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
