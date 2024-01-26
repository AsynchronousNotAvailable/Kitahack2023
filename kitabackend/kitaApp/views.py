from django.http import HttpResponse
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# from .query import similaritySearch
from .chatbot_processor import initialize_new_query, generate_chat_response


# @csrf_exempt
# def chatbotView(request):
#     print(request)
#     if request.method == 'POST':
#         try:
#             request_body = request.body.decode('utf-8')
#             json_data = json.loads(request_body)
#             user_prompt = json_data.get('user_prompt', '')
#             print('from django:', user_prompt)

#             bot_response = similaritySearch(user_prompt)
#             # take the user prompt and convert to embeddings using the text embedding model
#             response_data = {'status': 'success', 'message': f'{bot_response}'}

#             return JsonResponse(response_data)

#         except json.JSONDecodeError:
#             # Handle JSON decoding error
#             return JsonResponse({'status': 'error', 'message': 'Invalid JSON format in request body'}, status=400)

#     return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


@csrf_exempt
def chatbot(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        user_prompt = data.get('user_prompt', '')
        query_id = data.get('query_id', '')

        # Call your chatbot function and get the response
        # response = generate_chat_response(user_prompt)
        response = generate_chat_response(user_prompt, query_id)

        # Return the response as JSON
        return JsonResponse({'response': response})

    return JsonResponse({'error': 'Invalid request method'})


@csrf_exempt
def initialize_chat(request):
    if request.method == "POST":
        try:
            # Call the initialize_new_query function to create a new query document
            query_id = initialize_new_query()

            # Return the query ID as a JSON response
            response_data = {"query_id": query_id}
            return JsonResponse(response_data)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)
