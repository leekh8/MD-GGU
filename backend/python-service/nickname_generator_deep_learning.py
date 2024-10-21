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

# 필요한 라이브러리 import
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense

# 닉네임 데이터 준비
nicknames = [
    "멋쟁이사자", "푸른하늘", "달빛요정", "별똥별", "밤하늘여행자",
    "고요한밤", "빛나는별", "은하수", "꿈꾸는고양이", "따스한햇살",
    "꽃잎", "바람", "구름", "비", "눈",
    "웃음", "행복", "사랑", "희망", "믿음",
    # ... 더 많은 닉네임 데이터 추가 ...
]

# 데이터 전처리
tokenizer = Tokenizer(char_level=True)  # 문자 단위 토큰화
tokenizer.fit_on_texts(nicknames)
sequences = tokenizer.texts_to_sequences(nicknames)
max_length = max([len(seq) for seq in sequences])
# pad_sequences를 사용하여 모든 시퀀스의 길이를 맞춰줌
padded_sequences = pad_sequences(sequences, maxlen=max_length, padding='pre')

# 데이터셋 생성
dataset = tf.data.Dataset.from_tensor_slices(padded_sequences)
dataset = dataset.map(lambda seq: (seq[:-1], seq[1:]))  # 입력 시퀀스와 타겟 시퀀스 분리
dataset = dataset.batch(64, drop_remainder=True)

# 모델 생성
vocab_size = len(tokenizer.word_index) + 1
model = Sequential()
# Embedding 레이어를 사용하여 각 문자를 임베딩 벡터로 변환
model.add(Embedding(vocab_size, 128, input_length=max_length - 1))
model.add(LSTM(256))  # LSTM 레이어를 사용하여 시퀀스 데이터를 학습
model.add(Dense(vocab_size, activation='softmax'))  # Dense 레이어를 사용하여 다음 문자를 예측
model.compile(loss='sparse_categorical_crossentropy', optimizer='adam')

# 모델 학습
model.fit(dataset, epochs=100)

# 닉네임 생성 함수


def generate_nickname_dl(seed_text, num_chars=10):  # seed_text를 시작 문자열로 받음
    for _ in range(num_chars):
        token_list = tokenizer.texts_to_sequences([seed_text])[0]
        token_list = pad_sequences(
            [token_list], maxlen=max_length - 1, padding='pre')
        predicted = model.predict_classes(token_list, verbose=0)
        output_word = ""
        for word, index in tokenizer.word_index.items():
            if index == predicted:
                output_word = word
                break
        seed_text += output_word
    return seed_text
