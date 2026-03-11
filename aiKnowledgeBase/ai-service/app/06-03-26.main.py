from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
from langchain_text_splitters import RecursiveCharacterTextSplitter
import pdfplumber
import io

class Query(BaseModel):
    query: str

app = FastAPI()

@app.get("/health-check")
async def root():
    return {"message": "Hello World, I am alive"}

@app.post("/ingest")
async def ingest_file(file: UploadFile) -> dict[str, str |  list[str]] | None:
    content = await file.read()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 10,
        chunk_overlap = 0,
        separators= ["\n\n", "\n", " ", ""]  
    )

    file_name = file.filename
    
    if file_name:
        file_ext = file_name.split('.')[-1]

        if file_ext == "txt":
            # for text
            text = content.decode()
            chunks = splitter.split_text(text)
        
        elif file_ext == "pdf":
            # for pdf
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                all_text = ""
                for page in pdf.pages:
                    text = page.extract_text();
                    if text:
                        all_text += text + "\\n"

            chunks = splitter.split_text(all_text)

        elif file_ext == "docx":
            print()
            # chunks : list[str] = splitter.split_text(text)
            chunks = ""
        else: 
            return {
                "error": "Unrecognized file extension"
            }

        
        return {
            "filename": file_name,
            "file_ext": file_ext,
            "chunks": chunks   
        }

@app.post("/query")
async def get_query(query: Query):
    # retrieve data
    return query