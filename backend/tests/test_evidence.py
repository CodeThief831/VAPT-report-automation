from fastapi.testclient import TestClient
from ..app.main import app

client = TestClient(app)

def test_upload_evidence():
    # This is a simplified test. A real test would mock the file storage
    # and database to ensure files are "uploaded" and records created.
    run_id = "test-run"
    file_content = b"fake image data"
    files = {"files": ("test_image.png", file_content, "image/png")}
    response = client.post(f"/api/evidence/runs/{run_id}/evidence", files=files)
    assert response.status_code == 200
    response_json = response.json()
    assert len(response_json) == 1
    assert response_json[0]["filename"] == "test_image.png"

# More tests would be added here to cover edge cases like unsupported file types,
# files that are too large, etc.
