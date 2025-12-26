from flask import Flask, request, jsonify
import os
import openai

app = Flask(__name__)

OPENAI_KEY = os.environ.get('OPENAI_API_KEY')
if not OPENAI_KEY:
    raise RuntimeError('Set OPENAI_API_KEY in environment before running admin_ai.py')
openai.api_key = OPENAI_KEY


@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json(force=True)
    desc = data.get('description', '')
    if not desc:
        return jsonify({'error': 'description required'}), 400

    prompt = f"You are an assistant that suggests safe, minimal PHP code changes for a website.\nAdmin request: {desc}\nRespond with the suggested file patch or code snippet only.\nDo not include explanations."

    try:
        resp = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=800,
            temperature=0.2,
        )
        content = resp['choices'][0]['message']['content']
        return jsonify({'suggestion': content})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
