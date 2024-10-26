# 딥러닝 모델
# RNN (Recurrent Neural Network) 이나 Transformer 와 같은 딥러닝 모델은 문맥을 이해하고 텍스트를 생성하는 데 뛰어난 성능을 보인다.
# 이러한 모델을 이용하여 닉네임 데이터를 학습시키면, 더욱 자연스럽고 다양한 닉네임을 생성할 수 있다.

# 1. 데이터 수집:
# 먼저, 닉네임 데이터를 수집해야 한다.
# 온라인 게임이나 커뮤니티에서 실제 사용되는 닉네임을 크롤링하거나, 공개된 닉네임 데이터셋을 활용할 수 있다.

# 2. 모델 학습:
# 수집한 닉네임 데이터를 이용하여 딥러닝 모델을 학습시킨다.

# 3. 닉네임 생성:
# 학습된 모델을 이용하여 새로운 닉네임을 생성한다.

# 4. 중복 검사:
# 생성된 닉네임이 기존 닉네임이나 다른 사용자의 닉네임과 중복되지 않는지 확인한다.

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np

# 모델과 토크나이저 로드
model = load_model('nickname_generator.keras')

max_length = 10

# 닉네임 생성 함수


def generate_nickname_dl(seed_text, num_chars=10):  # seed_text를 시작 문자열로 받음
    for _ in range(num_chars):
        token_list = tokenizer.texts_to_sequences([seed_text])[0]
        token_list = pad_sequences(
            [token_list], maxlen=max_length - 1, padding='pre')

        # 예측 수행 (predict_classes는 더 이상 사용되지 않음)
        predicted_probs = model.predict(token_list, verbose=0)
        predicted = np.argmax(predicted_probs, axis=-1)

        output_word = ""
        for word, index in tokenizer.word_index.items():
            if index == predicted:
                output_word = word
                break
        seed_text += output_word
    return seed_text
