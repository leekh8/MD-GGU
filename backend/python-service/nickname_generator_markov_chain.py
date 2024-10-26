# Markov Chain 모델
# 이전 상태를 기반으로 다음 상태를 예측하는 확률 모델
# 이를 이용하여, 실제 사용되는 닉네임 데이터를 학습시켜 새로운 닉네임을 생성할 수 있다.

# 1. 데이터 수집:
# 먼저, 닉네임 데이터를 수집해야 한다.
# 온라인 게임이나 커뮤니티에서 실제 사용되는 닉네임을 크롤링하거나, 공개된 닉네임 데이터셋을 활용할 수 있다.

# 2. 모델 학습:
# 수집한 닉네임 데이터를 이용하여 Markov Chain 모델을 학습시킨다.

# 3. 닉네임 생성:
# 학습된 모델을 이용하여 새로운 닉네임을 생성한다.

# 4. 중복 검사:
# 생성된 닉네임이 기존 닉네임이나 다른 사용자의 닉네임과 중복되지 않는지 확인한다.

import random


class MarkovChain:
    def __init__(self, order=2):
        self.order = order
        self.transitions = {}

    def train(self, data):
        for item in data:
            item = ["^"] * self.order + list(item) + ["$"]
            for i in range(len(item) - self.order):
                state = tuple(item[i:i+self.order])
                next_char = item[i+self.order]
                if state not in self.transitions:
                    self.transitions[state] = {}
                if next_char not in self.transitions[state]:
                    self.transitions[state][next_char] = 0
                self.transitions[state][next_char] += 1

    def generate_nickname_mc(self):
        state = tuple(["^"] * self.order)
        nickname = ""
        while True:
            choices = self.transitions[state]
            total = sum(choices.values())
            probs = {char: count / total for char, count in choices.items()}
            next_char = random.choices(
                list(probs.keys()), weights=probs.values())[0]
            if next_char == "$":
                break
            nickname += next_char
            state = tuple(list(state[1:]) + [next_char])
        return nickname


# # 닉네임 데이터
# nicknames = ["멋쟁이사자", "푸른하늘", "달빛요정", "별똥별", "밤하늘여행자"]

# # Markov Chain 모델 생성 및 학습
# model = MarkovChain(order=2)
# model.train(nicknames)
