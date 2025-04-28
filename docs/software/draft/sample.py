import re

def insert_double_line_breaks(text):
    """
    表以外の箇所で、句点（。）の後に二回改行を挿入する。
    ただし、URLや表の中は除外する。

    Args:
        text (str): 入力テキスト

    Returns:
        str: 句点後に二回改行が挿入されたテキスト
    """

    def replace_with_double_linebreak(match):
        sentence = match.group(0)
        # URLでないかチェック (簡単なURL判定)
        if re.search(r'https?://[^\s]+', sentence):
            return sentence
        # 表の中の行でないかチェック（簡単な判定）
        if sentence.strip().startswith('|') or '\|' in sentence:
            return sentence
        return sentence.strip() + '\n\n'  # 句点＋改行2つ

    # 正規表現で句点（。）を探して二回改行を挿入
    modified_text = re.sub(r'[^。]*。', replace_with_double_linebreak, text)
    return modified_text

# ファイルを読み込む
file_path = "software_application_architecture_microservices_cloudnative.md"  # 実際のファイルパスに置き換えてください
with open(file_path, 'r', encoding='utf-8') as file:
    markdown_content = file.read()

# 句点ごとに二回改行を挿入する
modified_content = insert_double_line_breaks(markdown_content)

# 結果をファイルに書き出す (上書き)
with open(file_path, 'w', encoding='utf-8') as file:
    file.write(modified_content)

print("句点ごとの二重改行が完了しました。")