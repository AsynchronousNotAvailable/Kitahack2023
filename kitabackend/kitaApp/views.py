from django.http import HttpResponse
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .query import similaritySearch

@csrf_exempt
def chatbotView(request):
    print(request)
    if request.method == 'POST':
        try:
            request_body = request.body.decode('utf-8')
            json_data = json.loads(request_body)
            user_prompt = json_data.get('user_prompt', '')
            print('from django:', user_prompt)

            bot_response = similaritySearch(user_prompt)
            # take the user prompt and convert to embeddings using the text embedding model
            response_data = {'status': 'success', 'message': f'{bot_response}'}

            return JsonResponse(response_data)
        
        except json.JSONDecodeError:
            # Handle JSON decoding error
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format in request body'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)



    