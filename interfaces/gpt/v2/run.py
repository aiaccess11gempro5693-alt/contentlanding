"""Этап 1: GPT продумывает стратегию и 8 дизайн-направлений (brief.md → plan.json).
Этап 2: модель картинок рисует по промптам GPT: всю страницу и первый экран.
Запускается в GitHub Actions (.github/workflows/gpt-v2.yml). Ключ не печатается.
"""
import base64
import json
import os
import re
import time
import urllib.error
import urllib.request

BASE = "https://api.cometapi.com/v1"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
KEY = next((os.environ[n] for n in ("COMETAPI", "COMETAPI_KEY", "COMET_API_KEY") if os.environ.get(n)), None)
PLANNERS = ["gpt-5.6", "gpt-5.5", "gpt-5.4", "gpt-5.2"]
PAINTERS = ["gpt-image-2", "gpt-image-1.5"]
LOG = []


def log(m):
    print(m)
    LOG.append(m)


def call(path, payload, timeout=900):
    req = urllib.request.Request(BASE + path, data=json.dumps(payload).encode(),
                                 headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def err(e):
    if isinstance(e, urllib.error.HTTPError):
        return f"HTTP {e.code}: {e.read().decode(errors='replace')[:300]}"
    return repr(e)[:300]


def plan():
    path = os.path.join(OUT, "plan.json")
    if os.path.exists(path):
        return json.load(open(path, encoding="utf-8"))
    brief = open(os.path.join(HERE, "brief.md"), encoding="utf-8").read()
    for model in PLANNERS:
        try:
            t = time.time()
            res = call("/chat/completions", {"model": model, "messages": [{"role": "user", "content": brief}]})
            text = res["choices"][0]["message"]["content"]
            data = json.loads(re.search(r"\{.*\}", text, re.S).group(0))
            assert len(data["directions"]) >= 6
            data["planner"] = model
            json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
            log(f"план: {model}, {len(data['directions'])} направлений, {time.time() - t:.0f} с")
            return data
        except Exception as e:  # noqa: BLE001
            log(f"план: {model} — ошибка {err(e)}")
    return None


def paint(name, prompt, size):
    path = os.path.join(OUT, name + ".png")
    if os.path.exists(path):
        return
    for model in PAINTERS:
        for extra in ({"quality": "high"}, {}):
            try:
                t = time.time()
                res = call("/images/generations", {"model": model, "prompt": prompt, "size": size, "n": 1, **extra})
                item = res["data"][0]
                data = base64.b64decode(item["b64_json"]) if item.get("b64_json") else \
                    urllib.request.urlopen(item["url"], timeout=120).read()
                open(path, "wb").write(data)
                log(f"{name}: {model}, {time.time() - t:.0f} с")
                return
            except Exception as e:  # noqa: BLE001
                log(f"{name}: {model} {extra} — ошибка {err(e)}")


def main():
    if not KEY:
        log("ключ не найден")
        return
    data = plan()
    if not data:
        return
    with open(os.path.join(OUT, "plan.md"), "w", encoding="utf-8") as f:
        f.write(f"# План GPT ({data.get('planner')})\n\n## Стратегия\n\n{data['strategy']}\n")
        for i, d in enumerate(data["directions"], 1):
            f.write(f"\n## {i}. {d['name']}\n\n{d['idea']}\n\n- Палитра: {', '.join(d.get('palette', []))}\n"
                    f"- Шрифты: {d.get('fonts', '')}\n- Hero: {d.get('hero_mechanic', '')}\n")
    for i, d in enumerate(data["directions"], 1):
        paint(f"d{i}-page", d["page_prompt"], "1024x1536")
        paint(f"d{i}-hero", d["hero_prompt"], "1536x1024")


if __name__ == "__main__":
    try:
        main()
    finally:
        with open(os.path.join(OUT, "log.txt"), "a", encoding="utf-8") as f:
            f.write(time.strftime("\n== %Y-%m-%d %H:%M:%S UTC ==\n", time.gmtime()) + "\n".join(LOG) + "\n")
