from nickname_generator_deep_learning import generate_nickname_dl
from nickname_generator_markov_chain import generate_nickname_mc, MarkovChain


def generate_nickname(method="deep_learning", seed_text="별", num_chars=10):
    """
    닉네임 생성 함수

    Args:
        method (str): 생성 방식 ("deep_learning" 또는 "markov_chain"). 기본값은 "deep_learning".
        seed_text (str): 시작 문자열. 기본값은 "별".
        num_chars (int): 생성할 닉네임의 길이. 기본값은 10.

    Returns:
        str: 생성된 닉네임
    """

    if method == "deep_learning":
        return generate_nickname_dl(seed_text, num_chars)
    elif method == "markov_chain":
        # Markov Chain 모델 생성 및 학습 (필요시)
        model = MarkovChain(order=2)
        model.train(["멋쟁이사자", "푸른하늘", "달빛요정", "별똥별", "밤하늘여행자"])  # 닉네임 데이터
        return model.generate()  # Markov Chain 모델 사용
    else:
        raise ValueError(
            "Invalid method. Choose 'deep_learning' or 'markov_chain'")


# 예시
if __name__ == "__main__":
    print(generate_nickname(method="deep_learning", seed_text="별", num_chars=10))
    print(generate_nickname(method="markov_chain", seed_text="별", num_chars=10))

# 다른 파일에서의 예시
# from nickname_generator import generate_nickname

# # 딥러닝 모델 사용
# nickname_dl = generate_nickname(method="deep_learning", seed_text="구름", num_chars=12)
# print(nickname_dl)

# # Markov Chain 모델 사용
# nickname_mc = generate_nickname(method="markov_chain")
# print(nickname_mc)
