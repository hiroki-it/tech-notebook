"""MkDocsのビルド時に、タグ一覧を数字・アルファベット・五十音順に並べ、頭文字ごとの見出しを生成するフック。"""

import json
import re
import unicodedata
from pathlib import Path

import yaml
from mkdocs.exceptions import PluginError
from mkdocs.utils.meta import get_data


MARKER = "<!-- notebook/tags-by-initial -->"
READINGS_FILE = Path(__file__).with_name("tag_readings.yml")
SMALL_KANA = str.maketrans("ぁぃぅぇぉっゃゅょゎゕゖ", "あいうえおつやゆよわかけ")
VOWELS = {
    kana: vowel
    for vowel, row in {
        "あ": "あかさたなはまやらわ",
        "い": "いきしちにひみりゐ",
        "う": "うくすつぬふむゆる",
        "え": "えけせてねへめれゑ",
        "お": "おこそとのほもよろを",
    }.items()
    for kana in row
}


def kana_sort_key(reading):
    # カタカナ・濁点・小書き文字・長音を、五十音順の比較用に正規化する。
    reading = unicodedata.normalize("NFKC", reading)
    reading = "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in reading)
    reading = "".join(
        c for c in unicodedata.normalize("NFD", reading) if c not in "\u3099\u309a"
    ).translate(SMALL_KANA)
    result = []
    for char in reading:
        if char == "ー" and result:
            char = VOWELS.get(result[-1], char)
        result.append(char)
    return "".join(result).casefold()


def tag_key(name, readings):
    original = name
    name = unicodedata.normalize("NFKC", name)
    if re.match(r"[0-9]", name):
        return (0, name.casefold(), name)
    if re.match(r"[A-Za-z]", name):
        return (1, name.casefold(), name)
    reading = readings.get(original, readings.get(name, name))
    if re.search(r"[\u3400-\u9fff々]", reading):
        raise PluginError(f"タグ「{name}」の読みを hooks/tag_readings.yml に追加してください。")
    key = kana_sort_key(reading)
    if not key or not "あ" <= key[0] <= "ん":
        raise PluginError(f"タグ「{name}」には、ひらがなで始まる読みを指定してください。")
    return (2, key, name)


def group_tags(tags, readings):
    groups = {}
    for name in sorted(tags, key=lambda name: tag_key(name, readings)):
        kind, key, _ = tag_key(name, readings)
        initial = "0–9" if kind == 0 else key[0].upper() if kind == 1 else key[0]
        groups.setdefault(initial, []).append(name)
    return groups


def on_config(config):
    readings = yaml.safe_load(READINGS_FILE.read_text(encoding="utf-8"))
    # タグ一覧内のタグ見出しだけを並べ替え、各ノートのタグ表示順は維持する。
    config.plugins["material/tags"].config.listings_tags_sort_by = (
        lambda tag, _: tag_key(tag.name, readings)
    )


def on_page_markdown(markdown, page, config, files):
    if page.file.src_uri != "tags.md" or MARKER not in markdown:
        return markdown

    readings = yaml.safe_load(READINGS_FILE.read_text(encoding="utf-8"))
    tags = set()
    for file in files.documentation_pages():
        _, metadata = get_data(file.content_string)
        tags.update(metadata.get("tags", []))

    sections = []
    for initial, names in group_tags(tags, readings).items():
        anchor = "0-9" if initial == "0–9" else initial.lower()
        # Materialの標準一覧を頭文字ごとに生成し、目次には頭文字だけを載せる。
        options = json.dumps({"include": names, "toc": False}, ensure_ascii=False)
        sections.append(f"## {initial} {{#tags-{anchor}}}\n\n<!-- material/tags {options} -->")
    return markdown.replace(MARKER, "\n\n".join(sections))
