from fastapi import FastAPI, HTTPException
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime
import uuid
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv(), override=True)

from langchain_core.messages import HumanMessage, AIMessage
from research import execute_research

if not firebase_admin._apps:
    # cred = credentials.Certificate("/etc/secrets/credentials.json") #for prod
    cred = credentials.Certificate("credentials.json") #for local
    # cred = credentials.Certificate(os.getenv("FIREBASE_ADMIN_SDK_PATH")) #working version
    firebase_admin.initialize_app(cred)

app = FastAPI(debug=True)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
db = firestore.client()

# Define constants for collection names
USERS_COLLECTION = 'users'
CHAT_HISTORY_COLLECTION = 'chat_history'

from google.api_core.exceptions import NotFound

def generate_thread_id():
    return str(uuid.uuid4())

def store_chat_history(email: str, messages: List[dict]):
    try:
        chat_ref = db.collection(CHAT_HISTORY_COLLECTION).document(email)

        # Check if the document exists
        doc = chat_ref.get()
        if not doc.exists:
            # If the document doesn't exist, create it with initial data
            chat_ref.set({
                'email': email,
                'created_at': datetime.now(),
                'messages': messages
            })
        else:
            # If the document exists, update it
            chat_ref.update({
                'last_updated': datetime.now(),
                'messages': firestore.ArrayUnion(messages)
            })
    except Exception as e:
        print(f"Failed to store chat history for user {email}. Error: {str(e)}")

class UserCreate(BaseModel):
    email: str
    password: str
    confirm_password: str

class UserSignIn(BaseModel):
    email: str
    password: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    prompt: str
    email: EmailStr
    thread_id: str

@app.post("/signup")
async def signup(user: UserCreate):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    try:
        user = auth.create_user(
            email=user.email,
            email_verified=False,
            password=user.password,
            display_name=user.email,
            disabled=False
        )
        return {"message": "User created successfully"}
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="The email address is already in use. Please try a different email.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"An error occurred while creating your account. Please try again later.")

import requests

import logging
from fastapi import HTTPException

@app.post("/signin")
async def signin(user: UserSignIn):
    try:
        # Debug: Print the API Key
        api_key = os.getenv('FIREBASE_API_KEY')

        response = requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}",
            json={
                "email": user.email,
                "password": user.password,
            }
        )

        response.raise_for_status()
        user_data = response.json()

        # Generate a new thread ID for the user
        thread_id = generate_thread_id()

        # Store the thread ID in Firestore
        user_ref = db.collection(USERS_COLLECTION).document(user.email)
        user_ref.set({
            'thread_id': thread_id
        }, merge=True)

        return {"message": "User signed in successfully", "user": user_data, "thread_id": thread_id}

    except requests.exceptions.HTTPError as e:
        error_details = response.json().get('error', {}).get('message', str(e))
        logging.error(f"HTTP error during sign-in: {error_details}")
        raise HTTPException(status_code=response.status_code, detail=f"An error occurred while signing in. Please check your credentials and try again.")

    except Exception as e:
        logging.error(f"General error during sign-in: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while signing in. Please try again later.")

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    prompt: str
    email: EmailStr
    thread_id: str

@app.post("/chat")
async def chat(request: ChatRequest):
    # Convert the incoming messages to the format expected by the research function
    messages = [
        HumanMessage(content=msg.content) if msg.role == "human" else AIMessage(content=msg.content)
        for msg in request.messages
    ]

    # Add the new prompt to the messages
    messages.append(HumanMessage(content=request.prompt))

    # Execute the research with thread_id
    try:
        response = execute_research(request.prompt, request.thread_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute research. Error: {str(e)}")

    # Add the AI response to the messages
    messages.append(AIMessage(content=response))

    # Convert the messages back to the format expected by the frontend
    response_messages = [
        ChatMessage(role="human" if isinstance(msg, HumanMessage) else "ai", content=msg.content)
        for msg in messages
    ]

    try:
        # Store the chat history
        store_chat_history(request.email, [
            {
                "role": "human" if isinstance(msg, HumanMessage) else "ai",
                "content": msg.content,
                "timestamp": datetime.now().isoformat()
            }
            for msg in messages[-2:]  # Only store the last question and answer
        ])

        # Print out the chat history for verification
        # print_chat_history(request.email)
    except Exception as e:
        print(f"Failed to store chat history: {str(e)}")
        # You might want to log this error or handle it in a way that's appropriate for your application

    return {"messages": response_messages}

# def print_chat_history(email: str):
#     chat_ref = db.collection(CHAT_HISTORY_COLLECTION).document(email)
#     doc = chat_ref.get()
#     if doc.exists:
#         print(f"Chat history for user {email}:")
#         print(json.dumps(doc.to_dict(), indent=2, default=str))
#     else:
#         print(f"No chat history found for user {email}")
