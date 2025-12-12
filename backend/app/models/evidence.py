from pydantic import BaseModel
from typing import List, Optional

class Annotation(BaseModel):
    # Depending on the annotation library, this could be more complex
    type: str # e.g., 'arrow', 'rect', 'text'
    x: int
    y: int
    width: int
    height: int
    color: Optional[str] = "red"
    text: Optional[str] = None

class Evidence(BaseModel):
    id: str
    filename: str
    mime_type: str
    size: int
    resolution: str # e.g., "1920x1080"
    uploader: str
    timestamp: str
    derived_images: List[str] = []
    linked_step_numbers: List[int] = []
    caption: Optional[str] = None
    annotations: List[Annotation] = []
