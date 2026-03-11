# for http management using FastAPI with UploadFile to provide upload functionality
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
# using LC community document loader to load pdf or text
from langchain_community.document_loaders import PyPDFLoader, TextLoader
# using recursive char text splitter from LC text splitter to create chunks
from langchain_text_splitters import RecursiveCharacterTextSplitter
# LC huggingface embeddings with sentence transformer model (dimension 3384) to create vector embeddings for uploading to DB
from langchain_huggingface import HuggingFaceEmbeddings
# for prompt creation using LCs prompt template
from langchain_core.prompts import ChatPromptTemplate
# using ollama running locally as a model
from langchain_ollama import ChatOllama
# using load_dotenv to have env vars available from .env file
from dotenv import load_dotenv
# using PC for vector embedding storage and retrieval
from pinecone import Pinecone
#using pydantic to define the type of request body for /query endpoint
from pydantic import BaseModel
# using typing to get Any type and use it to define unknown types
from typing import Any
# using shutil to copy buffer file from request and save it to temp folder
import shutil
# using os to open file; get env; remove the temp file 
import os
# using hashlib to create a new id for each vector
import hashlib

# define the type for request body for /query
class QueryBody(BaseModel):
    query: str
    userId: str

# loading .env 
load_dotenv()
# get the pinecone api key
pc_api_key= os.getenv("PC_API")

# instantiate fast api app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["localhost:3030"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


#  instantiate llm with given model
llm = ChatOllama(model="llama3.2")
# create a prompt template using LCs prompt template
prompt = ChatPromptTemplate.from_messages([ # type: ignore
    ("system", "You are a helpful assistant. Use the following context to answer the question: {context}"),
    ("human", "{input}")
])

# define chain where the input will go to prompt and the output of that will pipe to llm 
chain = prompt | llm #type: ignore

# instantiate embeddings with model name for creating vector embeddings
embeddings = HuggingFaceEmbeddings(
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
)
# instantiate PC with API 
pc = Pinecone(api_key=pc_api_key)
# instantiate index with the index name
index  = pc.Index("knowledge-base-index") # type: ignore

# decorator to modify the function below
@app.get('/')
# function to call on for above path 
async def root():
    return {
        "message": "Hello World"
    }

@app.post('/ingest')
async def upload_file(file: UploadFile, user_id: str) -> dict[str, str| bool] | None:
    try:
        # if filename exists
        if file.filename:
            # store filename
            file_name = file.filename
            # store extension name
            file_ext = file_name.split('.')[-1]
            # save the uploaded file in temp loc
            path = f"./temp/temp_{file_name}"

            # open the path and write
            with open(path, "wb") as buffer:
                # use shutil to copy file to buffer 
                shutil.copyfileobj(file.file, buffer)

            # if the file extension is txt
            if file_ext == "txt":
                # load the file as txt
                loader = TextLoader(path)
            # if the file extension is pdf
            elif file_ext == "pdf":
                # load the file as pdf
                loader = PyPDFLoader(path)

            else: 
                # else give error saying invalid file type
                return {
                    "error": "Invalid file type"
                }
            
            # load the document
            docs = loader.load()

            # recursive character text splitter to split the document text into chunks 
            splitter = RecursiveCharacterTextSplitter(
                # modify them for better results
                chunk_size = 500,
                chunk_overlap = 10,
                separators = ["\n\n", "\n", " ", ""]
            )

            # all chunks are stored into big chunk list
            big_chunk = splitter.split_documents(docs)
            # number of parts in which to split the big chunk
            n = len(big_chunk) // 100

            if n == 0 :
                n = 1
            # split the big_chunk into list of list of strings
            batches = [big_chunk[i: i+n] for i in range(0, len(big_chunk), n)]

            # select each list in the batches 
            for chunks in batches: 
                # convert each list into embeddings
                vectors = embeddings.embed_documents([c.page_content for c in chunks])

                # insert each vector in PC db
                # TODO - add namespace from request body
                index.upsert([ #type: ignore
                    # create the following objects from each vector
                    {
                        "id": str(hashlib.sha256(chunks[i].page_content.encode('utf-8'))),
                        "values": vectors[i],
                        "metadata": {"text": chunks[i].page_content, "source": chunks[i].metadata["source"]  ,"page": chunks[i].metadata["page"] } # type: ignore
                    }
                    for i in range(len(vectors))
                ], namespace= user_id)
                    

            # remove the file in the path 
            os.remove(path)

            return {
                "success": True,
                "filename" : file_name,
            }
    except Exception as e:
        #  if any problem occurs - print the exception
        print(e)
        return {
            "error": "Unable to process request"
        }


@app.post('/query')
# define the query function with query param of type QueryBody
async def make_query(query_body : QueryBody) -> dict[str, Any] | None:
    try: 
        # convert the query to vectors
        query_vector = embeddings.embed_query(query_body.query)

        # search the db for top 5 elements with cosine similarities in the vector db
        results : dict[str, Any] = index.query( # type: ignore
            vector=query_vector,
            top_k=5,
            namespace=query_body.userId,
            include_metadata=True
        )
        
        # create an empty string to put all matching texts for inclusion into llm prompt
        context = ""  
        # for each element in matches key of results object   
        for chunk in results["matches"]:
            # add the metadata text key in context string
            context += chunk.metadata["text"] + "\n\n" #type: ignore

        # invoke a call to chain 
        response = await chain.ainvoke({"input" : query_body.query, "context": context}) #type: ignore

        # return the message including the response from the llm
        return {
            "message": response.content, #type: ignore
            "matches": context
        }
    except Exception as e:
        # if an error occurs
        print(e)
        return {
            "error": "Error"
        }