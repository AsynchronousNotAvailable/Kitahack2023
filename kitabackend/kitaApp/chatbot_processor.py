import google.generativeai as palm
from pinecone import Pinecone
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
load_dotenv()

# PALM API key
api_key = os.getenv("API_KEY")
palm.configure(api_key=api_key)

# Initialize Firestore
script_dir = os.path.dirname(os.path.abspath(__file__))
adminsdk_json_path = os.path.join(
    script_dir, "kitahack2023-1f98f-firebase-adminsdk-tqevl-4e47b2642a.json")
cred = credentials.Certificate(adminsdk_json_path)
firebase_admin.initialize_app(cred)
firestore_client = firestore.client()

# Initialize Pinecone client
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index(host=os.environ.get('INDEX_HOST'))


def generate_context(items):
    """Generate context string from a list of item dictionaries."""
    context = (
        "You are a database bot. Database chat bot is a large language model to help with warehouse management system. "
        "You assist employees in finding the best suitable items and details in the stock database."
        "If database bot is asked about data that is not available in the database, it must respond with 'No products in the database.'"
        "If WaiterBot is asked about anything other than finding the data in the database, it must respond with 'I am a database chatbot.' \n\n"
    )
    for item in items:
        context += f"\nItem {items.index(item) + 1}: "
        for key, value in item.items():
            context += f"{key}: {value}. "
    return context


def generate_prompt(context, messages):
    """
    Generate a prompt string based on the provided context and a list of messages.

    Args:
        context (str): The context string from the list of items.
        messages (list): A list of dictionaries representing messages. Each message should have 'author' and 'content' keys.
            Example: [{'author': 'bot', 'content': 'Hello'}, {'author': 'user', 'content': 'Hi'}]

    Returns:
        str: The generated prompt string.
    """
    prompt = f"{context}\n"
    for message in messages:
        # author = 'Chatbot' if message['author'] == 'bot' else 'User'
        # prompt += f"{author}: {message['content']}\n"
        prompt += f"{message['content']}\n"
    return prompt


def generate_chat_response(user_prompt, query_id="TmmZWhuwzHmVlTaFqMyz"):
    query = user_prompt
    user_input = {'source': 'user', 'message': query}

    # Generate embeddings for the query
    query_embeddings = palm.generate_embeddings(
        model="models/embedding-gecko-001", text=query)
    # print(query_embeddings.get("embedding", []))

    # Perform similarity search
    search_results = index.query(vector=query_embeddings.get("embedding", []),
                                 top_k=5,
                                 include_values=True,
                                 namespace='example-namespace')
    # print('Search result: ', search_results)

    # Retrieve corresponding documents from Firestore
    items = []  # List of dictionaries to store document data
    matches = search_results.get('matches', [])
    for match in matches:
        document_id = match.get('id')
        if document_id:
            doc_ref = firestore_client.collection(
                "small_warehouse").document(document_id)
            doc_data = doc_ref.get().to_dict()
            items.append(doc_data)
            # print("Document data:", doc_data)
        else:
            print("ID not found in match:", match)

    # Get the query history from Firestore
    # Collection 'query'
    # Attributes: history array['author', 'content'], context
    # subcollection 'chats' attributes: message, timestamp, source
    queryDocumentRef = firestore_client.collection("query").document(query_id)
    queryDocument = queryDocumentRef.get().to_dict()
    messages = queryDocument.get("history", [])

    # Append user message to messages list
    messages.append({
        "author": user_input["source"],
        "content": user_input["message"]
    })

    context = generate_context(items)
    chat_prompt = generate_prompt(context, messages)
    print("Chat Prompt:", chat_prompt)

    chat_response = palm.generate_text(
        model="models/text-bison-001",
        prompt=chat_prompt,
        temperature=0,
        max_output_tokens=800,
    )
    # print(chat_response.result)

    # Append bot message to messages list
    messages.append({
        "author": "bot",
        "content": chat_response.result
    })

    # Update query document with new context and updated messages history
    queryDocumentRef.update({
        "context": context,
        "history": messages
    })

    # Add a new chat document to the "chats" subcollection
    chat_collection = queryDocumentRef.collection("chats")
    chat_collection.add({
        "message": user_input["message"],
        "timestamp": firestore.SERVER_TIMESTAMP,
        "author": user_input["source"]
    })
    chat_collection.add({
        "message": chat_response.result,
        "timestamp": firestore.SERVER_TIMESTAMP,
        "author": "bot"
    })

    if (chat_response is not None):
        return chat_response.result
    else:
        return "No products in the database."


def initialize_new_query():
    """Add a new query document to the "query" collection and return the document ID"""
    query_collection = firestore_client.collection("query")
    query_document = query_collection.add({
        "context": "",
        "history": []
    })
    query_id = query_document[1].id
    return query_id


# Example usage
# query_id = initialize_new_query()
# print("Query ID:", query_id)
# print("----CHAT RESPONSE-----------------------------------")
# print("Response:\n", generate_chat_response(
#     "Have you sell pencil?", query_id=query_id))
# print("Response:\n", generate_chat_response(
#     "Have you sell pencil?"))
