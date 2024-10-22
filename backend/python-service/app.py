from flask import Flask, request, jsonify
from nickname_generator import generate_nickname
import random

app = Flask(__name__)


@app.route('/generate_nickname', methods=['GET'])
def generate_nickname_api():
    # 닉네임 생성 방식 (deep_learning 또는 markov_chain)
    method = request.args.get('method', 'deep_learning')
    seed_text = request.args.get('seed_text', None)   # 시작 문자열
    num_chars = int(request.args.get('num_chars', 10))  # 생성할 닉네임 길이

    # 시작 문자열이 제공되지 않으면 랜덤으로 선택
    if seed_text is None:
        seed_text = random.choice(['별', '달', '구름', '바람', '해'])

    try:
        nickname = generate_nickname(method, seed_text, num_chars)
        return jsonify({'nickname': nickname})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
