from django.urls import path
from . import views

urlpatterns = [
    # path('chatbot', views.chatbotView, name='hello'),
    path('chatbot', views.chatbot, name='chat_prompt'),
    path('initialize_chat', views.initialize_chat, name='initialize_chat'),
]
