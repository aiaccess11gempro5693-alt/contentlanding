"""GPT смотрит свой макет и живой сайт, пишет разбор и спецификацию, затем рисует ассеты.
Запуск: GitHub Actions (.github/workflows/gpt-v3.yml). Каждая картинка коммитится сразу.
"""
import base64
import json
import os
import re
import subprocess
import time
import urllib.error
import urllib.request

BASE = "https://api.cometapi.com/v1"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
KEY = os.environ.get("COMETAPI")
THINKERS = ["gpt-5.6", "gpt-5.5", "gpt-5.4"]
PAINTERS = ["gpt-image-2", "gpt-image-1.5"]
LOG = []


def log(m):
    print(m, flush=True)
    LOG.append(m)
    with open(os.path.join(OUT, "log.txt"), "a", encoding="utf-8") as f:
        f.write(m + "\n")


def save_progress(msg):
    if not os.environ.get("CI"):
        return
    subprocess.run(["git", "add", OUT], check=False)
    if subprocess.run(["git", "diff", "--cached", "--quiet"]).returncode == 0:
        return
    subprocess.run(["git", "commit", "-q", "-m", f"GPT v3: {msg}"], check=False)
    ref = os.environ.get("GITHUB_REF_NAME", "")
    subprocess.run(["git", "pull", "-q", "--rebase", "origin", ref], check=False)
    subprocess.run(["git", "push", "-q", "origin", f"HEAD:{ref}"], check=False)


def call(path, payload, timeout=900):
    req = urllib.request.Request(BASE + path, data=json.dumps(payload).encode(),
                                 headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def err(e):
    if isinstance(e, urllib.error.HTTPError):
        return f"HTTP {e.code}: {e.read().decode(errors='replace')[:300]}"
    return repr(e)[:300]


def img(name):
    b = base64.b64encode(open(os.path.join(HERE, "in", name), "rb").read()).decode()
    return {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b}"}}


def think():
    path = os.path.join(OUT, "review.json")
    if os.path.exists(path):
        return json.load(open(path, encoding="utf-8"))
    prompt = open(os.path.join(HERE, "prompt.md"), encoding="utf-8").read()
    content = [{"type": "text", "text": prompt}]
    for n in ("ref-hero.jpg", "ref-page.jpg", "now-hero.jpg", "now-sections.jpg"):
        content += [{"type": "text", "text": n.replace(".jpg", "")}, img(n)]
    for model in THINKERS:
        try:
            t = time.time()
            res = call("/chat/completions", {"model": model, "messages": [{"role": "user", "content": content}]})
            text = res["choices"][0]["message"]["content"]
            data = json.loads(re.search(r"\{.*\}", text, re.S).group(0))
            data["model"] = model
            json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
            open(os.path.join(OUT, "review.md"), "w", encoding="utf-8").write(
                f"# Разбор от {model}\n\n{data['critique_md']}\n\n# Спецификация\n\n{data['spec_md']}\n")
            log(f"разбор: {model}, {len(data.get('assets', []))} ассетов, {time.time() - t:.0f} с")
            save_progress("разбор и спецификация")
            return data
        except Exception as e:  # noqa: BLE001
            log(f"разбор: {model} — ошибка {err(e)}")
    return None


def paint(a):
    path = os.path.join(OUT, a["id"] + ".png")
    if os.path.exists(path):
        return
    for model in PAINTERS:
        for extra in ({"quality": "high"}, {}):
            try:
                t = time.time()
                res = call("/images/generations", {"model": model, "prompt": a["prompt"],
                                                   "size": a.get("size", "1024x1024"), "n": 1, **extra})
                item = res["data"][0]
                data = base64.b64decode(item["b64_json"]) if item.get("b64_json") else \
                    urllib.request.urlopen(item["url"], timeout=120).read()
                open(path, "wb").write(data)
                log(f"{a['id']}: {model}, {time.time() - t:.0f} с")
                save_progress(a["id"])
                return
            except Exception as e:  # noqa: BLE001
                log(f"{a['id']}: {model} {extra} — ошибка {err(e)}")


def main():
    if not KEY:
        log("ключ не найден")
        return
    data = think()
    if data:
        for a in data.get("assets", [])[:10]:
            paint(a)
    log("готово")
    save_progress("готово")


if __name__ == "__main__":
    main()
