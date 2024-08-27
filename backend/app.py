from flask import Flask, request, jsonify
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from flask_cors import CORS
import logging
import numpy as np
import time

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

model_name = "microsoft/DialoGPT-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

class ChatBot:
    def __init__(self):
        self.chat_history_ids = None
        self.bot_input_ids = None
        self.end_chat = False
        self.welcome()

    def welcome(self):
        # Greeting and introduction (For demonstration purposes only)
        print("Initializing BETA ...")
        time.sleep(2)
        print('Type "bye" or "quit" or "exit" to end chat \n')
        time.sleep(3)
        greeting = np.random.choice([
            "Welcome, I am BETA, here for your kind service",
            "Hey, Great day! I am your virtual assistant",
            "Hello, it's my pleasure meeting you",
            "Hi, I am a BETA. Let's chat!"
        ])
        print("BETA >>  " + greeting)

    def user_input(self, text):
        if text.lower().strip() in ['bye', 'quit', 'exit']:
            self.end_chat = True
            return "See you soon! Bye!"
        else:
            self.new_user_input_ids = tokenizer.encode(text + tokenizer.eos_token, return_tensors='pt').to(device)
            return None

    def bot_response(self):
        if self.chat_history_ids is not None:
            self.bot_input_ids = torch.cat([self.chat_history_ids, self.new_user_input_ids], dim=-1)
        else:
            self.bot_input_ids = self.new_user_input_ids

        self.chat_history_ids = model.generate(
            self.bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id
        )
        response = tokenizer.decode(self.chat_history_ids[:, self.bot_input_ids.shape[-1]:][0], skip_special_tokens=True)
        if response == "":
            response = self.random_response()
        return response

    def random_response(self):
        i = -1
        response = tokenizer.decode(self.chat_history_ids[:, self.bot_input_ids.shape[i]:][0], skip_special_tokens=True)
        while response == '':
            i = i - 1
            response = tokenizer.decode(self.chat_history_ids[:, self.bot_input_ids.shape[i]:][0], skip_special_tokens=True)
        if response.strip() == '?':
            reply = np.random.choice(["I don't know", "I am not sure"])
        else:
            reply = np.random.choice(["Great", "Fine. What's up?", "Okay"])
        return reply

bot = ChatBot()

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_input = request.json.get('text', '')
        if not user_input:
            return jsonify({'bot_response': 'Please provide input text.'}), 400

        bot_end_msg = bot.user_input(user_input)
        if bot_end_msg:
            return jsonify({'bot_response': bot_end_msg})

        response = bot.bot_response()
        return jsonify({'bot_response': response})

    except Exception as e:
        logging.error(f"Error during chat: {e}")
        return jsonify({'bot_response': 'Sorry, something went wrong!'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
