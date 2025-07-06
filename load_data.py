import glob
from dotenv import load_dotenv,find_dotenv
from sentence_transformers import SentenceTransformer
import os,sys
from pinecone import Pinecone
from PIL import Image

load_dotenv()

print("Loading CLIP model..")

model = SentenceTransformer('clip-ViT-B-32')

print("Connecting to Pinecone..")

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

print(os.getenv("PINECONE_API_KEY"))
index_name = "silque"

if not pc.has_index(index_name):
    pc.create_index_for_model(
        name=index_name,
        cloud="aws",
        region="us-east-1",
        dimension=512,
        metric='cosine',
        spec={"serverless": {"cloud": "aws", "region": "us-east-1"}}
        
    )

index = pc.Index(index_name)

print("Pinecone connected.")

# --- Prepare Image Data ---
print("Preparing Image data..")

image_folder_path = 'data/images'

image_paths = glob.glob(os.path.join(image_folder_path,'*.jpg'))

print(f"Found {len(image_paths)} images.")

batch_size = 100

for i in range(0,len(image_paths),batch_size):
    batch_paths = image_paths[i:i+batch_size]
    batch_images = [Image.open(image) for image in batch_paths]
    #encode these images using model
    batch_embeddings = model.encode(batch_images,convert_to_tensor=True,show_progress_bar=True)

    #add data to Pinecone
    #each vector in Pinecone needs a unique id and metadata along with the embeddings.
    vectors_pinecone = []
    for path,embedding in zip(batch_paths,batch_embeddings):
        vector = {"id":os.path.basename(path),
        "values":embedding.cpu().numpy().tolist(),
        "metadata":{"image_path":path}}
        vectors_pinecone.append(vector)
    #add to pinecone
    index.upsert(vectors=vectors_pinecone)





