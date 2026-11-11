# 🛑 전에는 `from ... import generate_nickname_mc, MarkovChain` 였다.
#    그런데 `generate_nickname_mc` 는 모듈 함수가 아니라 **MarkovChain 의
#    메서드**다. 그래서 이 import 가 늘 ImportError 로 죽었고, `app.py` 가
#    아예 뜨지 못했다. TensorFlow 와 무관하게, 이 모듈이 처음 올라온 커밋
#    (b48ee8c)부터 그랬다. Render 의 python-service 가 Failed deploy 였던
#    가장 바깥 원인이다.
from nickname_generator_markov_chain import MarkovChain

# 학습용 닉네임. 요청마다 다시 학습할 이유가 없어 한 번만 만든다
_MC_SEED_DATA = ["멋쟁이사자", "푸른하늘", "달빛요정", "별똥별", "밤하늘여행자"]
_mc_model = None


def _markov_model():
    global _mc_model
    if _mc_model is None:
        m = MarkovChain(order=2)
        m.train(_MC_SEED_DATA)
        _mc_model = m
    return _mc_model

# 🛑 **딥러닝 쪽 import 를 맨 위에서 하지 않는다.**
#
# `nickname_generator_deep_learning` 은 `from tensorflow.keras...` 로 시작한다.
# 그것을 여기서 바로 불러오면 TensorFlow 가 없거나 판이 어긋날 때 **이 모듈
# 전체가 import 에서 죽고**, 그러면 `app.py` 도 못 뜬다. 즉 딥러닝 하나 때문에
# 마르코프 방식까지 같이 못 쓰게 된다. 서비스가 아예 안 뜨는 것과 한 방식이
# 안 되는 것은 크기가 다른 고장이다.
#
# 쓸 때 불러오면, TensorFlow 가 깨져 있어도 서비스는 뜨고 마르코프는 돌고
# 딥러닝 요청만 까닭이 적힌 오류를 받는다.
def _load_dl():
    from nickname_generator_deep_learning import generate_nickname_dl
    return generate_nickname_dl


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
        try:
            generate_nickname_dl = _load_dl()
        except Exception as exc:
            # 🛑 까닭을 그대로 올린다. "500 서버 오류" 만 보면 TensorFlow 가
            #    없는 것인지 모델이 안 읽히는 것인지 가릴 수 없다.
            raise RuntimeError(
                "딥러닝 방식을 쓸 수 없습니다. TensorFlow 또는 모델 로드가"
                f" 실패했습니다: {type(exc).__name__}: {exc}."
                " markov_chain 방식은 그대로 쓸 수 있습니다."
            ) from exc
        return generate_nickname_dl(seed_text, num_chars)
    elif method == "markov_chain":
        # 🛑 전에는 `model.generate()` 를 불렀다. 그런 메서드가 없다
        #    (`generate_nickname_mc` 다). import 가 먼저 죽어서 이 줄까지
        #    가 본 적이 없었고, 그래서 아무도 몰랐다. **import 를 고치면
        #    바로 여기서 AttributeError 가 났을 것이다.**
        return _markov_model().generate_nickname_mc()
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
