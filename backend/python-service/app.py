from flask import Flask, request, jsonify
from nickname_generator import generate_nickname
import random
import os

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
        # 잘못된 method 값 등 부르는 쪽이 고칠 수 있는 것
        return jsonify({'error': str(e)}), 400
    except RuntimeError as e:
        # 🛑 TensorFlow 나 모델 로드가 안 되는 것은 **부르는 쪽 잘못이 아니다.**
        #    500 으로 뭉개면 「서버 오류」만 보여서 무엇이 빠졌는지 알 수 없다.
        #    503 과 함께 쓸 수 있는 방식을 같이 알려 준다.
        return jsonify({
            'error': str(e),
            'available_methods': ['markov_chain'],
        }), 503


@app.route('/health', methods=['GET'])
def health():
    """살아 있나. 🛑 어느 방식이 쓸 수 있는지도 같이 알려 준다.

    전에는 끝점이 하나뿐이라 서비스가 반쯤 고장난 것(마르코프는 되고 딥러닝은
    안 되는 상태)을 밖에서 알 길이 없었다. Render 의 헬스 체크도 걸 자리가
    없었다.
    """
    methods = ['markov_chain']
    dl_error = None
    try:
        from nickname_generator import _load_dl
        _load_dl()
        methods.append('deep_learning')
    except Exception as exc:
        dl_error = f"{type(exc).__name__}: {exc}"
    body = {'status': 'ok', 'available_methods': methods}
    if dl_error:
        body['deep_learning_error'] = dl_error
    return jsonify(body)


if __name__ == '__main__':
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug)
