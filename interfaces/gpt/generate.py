"""Генерация макетов интерфейсов через CometAPI (OpenAI-совместимый API).

Запускается в GitHub Actions (.github/workflows/gpt-generate.yml).
Ключ берётся из секрета репозитория; сам ключ нигде не печатается и не сохраняется.
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = os.environ.get("COMET_BASE", "https://api.cometapi.com/v1")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)

KEY = next((os.environ[n] for n in (
    "COMETAPI_KEY", "COMET_API_KEY", "COMETAPI_API_KEY", "COMET_KEY",
    "API_KEY", "KEY", "OPENAI_API_KEY") if os.environ.get(n)), None)
log_lines = []


def log(msg):
    print(msg)
    log_lines.append(msg)


def call(path, payload=None, timeout=600):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
        method="POST" if payload is not None else "GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def err_text(e):
    if isinstance(e, urllib.error.HTTPError):
        return f"HTTP {e.code}: {e.read().decode(errors='replace')[:400]}"
    return repr(e)[:400]


def main():
    if not KEY:
        log("Ключ не найден ни в одной из ожидаемых переменных окружения.")
        return finish()

    # 1. Список моделей — чтобы понимать, что доступно.
    try:
        models = sorted(m.get("id", "") for m in call("/models").get("data", []))
        with open(os.path.join(OUT, "models.txt"), "w") as f:
            f.write("\n".join(models))
        log(f"Доступно моделей: {len(models)}")
    except Exception as e:  # noqa: BLE001
        models = []
        log(f"Не удалось получить список моделей: {err_text(e)}")

    jobs = json.load(open(os.path.join(HERE, "jobs.json"), encoding="utf-8"))
    base = jobs["base"]
    image_models = [m for m in jobs["image_models"] if not models or m in models] or jobs["image_models"]
    chat_models = [m for m in jobs["chat_models"] if not models or m in models] or jobs["chat_models"]
    log(f"Модели картинок по порядку: {image_models}")
    log(f"Модели текста по порядку: {chat_models}")

    # 2. Картинки-макеты.
    for job in jobs["images"]:
        path = os.path.join(OUT, job["id"] + ".png")
        if os.path.exists(path):
            log(f"{job['id']}: уже есть, пропускаю")
            continue
        prompt = base + "\n\n" + job["prompt"] + "\n\n" + jobs["image_suffix"]
        for model in image_models:
            try:
                t = time.time()
                res = call("/images/generations", {
                    "model": model, "prompt": prompt, "size": jobs.get("size", "1536x1024"),
                    "quality": jobs.get("quality", "high"), "n": 1,
                })
                item = res["data"][0]
                if item.get("b64_json"):
                    data = base64.b64decode(item["b64_json"])
                else:
                    data = urllib.request.urlopen(item["url"], timeout=120).read()
                open(path, "wb").write(data)
                log(f"{job['id']}: готово ({model}, {time.time() - t:.0f} с)")
                break
            except Exception as e:  # noqa: BLE001
                log(f"{job['id']}: {model} — ошибка {err_text(e)}")

    # 3. Текстовые задания (идеи концепций).
    for job in jobs.get("texts", []):
        path = os.path.join(OUT, job["id"] + ".md")
        if os.path.exists(path):
            continue
        for model in chat_models:
            try:
                res = call("/chat/completions", {
                    "model": model,
                    "messages": [{"role": "system", "content": base},
                                 {"role": "user", "content": job["prompt"]}],
                })
                open(path, "w", encoding="utf-8").write(
                    f"<!-- модель: {model} -->\n\n" + res["choices"][0]["message"]["content"])
                log(f"{job['id']}: готово ({model})")
                break
            except Exception as e:  # noqa: BLE001
                log(f"{job['id']}: {model} — ошибка {err_text(e)}")
    finish()


def finish():
    with open(os.path.join(OUT, "log.txt"), "a", encoding="utf-8") as f:
        f.write(time.strftime("\n== %Y-%m-%d %H:%M:%S UTC ==\n", time.gmtime()))
        f.write("\n".join(log_lines) + "\n")


if __name__ == "__main__":
    main()
    sys.exit(0)
