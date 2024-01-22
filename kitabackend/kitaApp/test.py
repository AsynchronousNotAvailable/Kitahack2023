import google.generativeai as palm
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("API_KEY")
palm.configure(api_key=api_key)

script_dir = os.path.dirname(os.path.abspath(__file__))
adminsdk_json_path = os.path.join(script_dir, "kitahack2023-1f98f-firebase-adminsdk-tqevl-4e47b2642a.json")
cred = credentials.Certificate(adminsdk_json_path)
firebase_admin.initialize_app(cred)

# Fetch data from Firestore
firestore_client = firestore.client()
docs = firestore_client.collection("small_warehouse").stream()

# Prepare data for embeddings
embeds_data = []

for doc in docs:
    data = doc.to_dict()
    text = ("Brand: %s . "
            "Category: %s . "
            "Colour: %s . "
            "Description: %s ."
            "Function: %s ."
            "Location: %s ."
            "Pallet: %s ."
            "Product: %s ."
            "Quantity: %s ."
            "Size: %s ."
            ) % (data["Brand"], data["Category"], data["Colour"], data["Description"], data["Function"], data["Location"], data["Pallet"], data["Product"], data["Quantity"], data["Size"])
    
    # Generate embeddings for each text
    embeddings = palm.generate_embeddings( model="models/embedding-gecko-001",text=text)

    embeds_data.append({"id": doc.id, "embedding": embeddings.get("embedding", [])})

# Write embeddings to a local JSON file
with open("warehouse_embeds.json", "w", encoding="utf-8") as f:
    json.dump(embeds_data, f, indent=2)

print("Embeddings saved.")