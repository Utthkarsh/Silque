from fastapi import FastAPI,UploadFile,HTTPException,File
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
import io
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
#load environment variables using load_dotenv()
load_dotenv()

ml_model = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Server starting up...")
    print("Loading AI model...")
    ml_model['clip-model'] = SentenceTransformer("clip-ViT-B-32")
    print("Model loaded.")
    yield
    print("Server shutting down...")
    ml_model.clear()

#set up api
app = FastAPI(title="Silque API",lifespan=lifespan)

# The address of our Live Server frontend. This if for CORS
origins = [
    "http://localhost",
    "http://localhost:5500", 
    "http://127.0.0.1",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8000"
]

app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], 
)




#connect to pinecone to check if our image is similae to images in db
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("silque")

@app.get("/")
def read_root():
    return {"message":"Welcome to Silque's visual search API"}

@app.post("/search/")
async def similar_image(image_file: UploadFile = File(...)):
    #take the image, create an embedding for it
    #take db data on pinecone and use model to get the 5 most similar images
    #return these images
        
    contents = await image_file.read()
    try:
        image_PIL = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400,detail="File is not of type image.")
    try:
        #create the embedding for the image
        query_embedding = ml_model['clip-model'].encode(image_PIL).tolist()
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index('silque')
        query = index.query(vector=query_embedding,top_k=5,include_metadata=True)

        #return results from query
        results = []
        gcs_bucket_name = os.getenv("GCS_BUCKET_NAME")
        base_gcs_url = f"https://storage.goggleapis.com/{gcs_bucket_name}"
        for match in query['matches']:
            original_path = match['metadata']['image_path']
            image_path_suffix = original_path.replace('data/','')

            results.append({
                'image_url':f"{base_gcs_url}/{image_path_suffix}",
                "score": match['score']
            })
        
        return {"results":results}
    except Exception as e:
        print("An error occurred.")
        raise HTTPException(status_code=500,detail="Internal server error.")








