import google.generativeai as palm
from pinecone import Pinecone
import os
import firebase_admin
from firebase_admin import credentials, firestore
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

query = "Give me the detaila of product NoGrA3ruGr."

# Generate embeddings for the query
query_embeddings = palm.generate_embeddings(model="models/embedding-gecko-001", text=query)
# print(query_embeddings.get("embedding", []))

# Initialize Pinecone client
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index(host=os.environ.get('INDEX_HOST'))

# Perform similarity search
search_results = index.query(namespace="example-namespace",vector=query_embeddings.get("embedding", []), top_k=5)
print('Search result: ', search_results)

def generate_context(doc_data):

    context = (
        "You are a database bot. Database chat bot is a large language model to help with warehouse management system. "
        "You assist employees in finding the best suitable items and details in the stock database."
        "If database bot is asked about data that is not available in the database, it must respond with'No products in the database.'"
        "If WaiterBot is asked about anything other than finding the data in the database, it must respond with 'I am a database chatbot.' \n\n"
    )
    for key, value in doc_data.items():
        context += f"{key}: {value}. "

    return context

contexts = [] 
matches = search_results.get('matches', [])
for match in matches:
    document_id = match.get('id')
    if document_id:
        doc_ref = firestore_client.collection("small_warehouse").document(document_id)
        doc_data = doc_ref.get().to_dict()
        
        # Generate context string based on doc_data
        context = generate_context(doc_data)
        contexts.append(context)

        print("Document data:", doc_data)
    else:
        print("ID not found in match:", match)
        
# for idx, context in enumerate(contexts):
#     print(f"Context for document {idx + 1}:\n{context}\n")

combined_prompt = f"{query}\n\n" + "\n".join(contexts)

completion = palm.generate_text(
    model="models/text-bison-001",
    prompt=combined_prompt,
    temperature=0,
    max_output_tokens=800,
)

print(completion.result)


