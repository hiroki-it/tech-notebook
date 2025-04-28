import sys
import re

def is_inside_table(text, pos):
    """
    指定された位置がMarkdownテーブル内かどうかを判定する関数。

    Args:
      text: 対象のテキスト。
      pos:  判定する位置のインデックス。

    Returns:
      True: テーブル内, False: テーブル外
    """
    lines = text.splitlines()
    line_start = text.rfind('\n', 0, pos) + 1
    line = text[line_start:text.find('\n', pos)]
    return '|' in line

def is_footnote_line(text, pos):
    """
    指定された位置が行頭が脚注定義の行かどうかを判定する関数。

    Args:
      text: 対象のテキスト。
      pos:  判定する位置のインデックス。

    Returns:
      True: 脚注定義の行, False: 脚注定義の行ではない
    """
    prev_newline_pos = text.rfind('\n', 0, pos)
    if prev_newline_pos != -1:
        line_start = prev_newline_pos + 1
    else:
        line_start = 0
    line_to_pos = text[line_start:pos].lstrip()
    return line_to_pos.startswith('*') and re.match(r'\*\d+ ', line_to_pos)

def insert_newlines(filepath):
    """
    指定されたファイルの句点の後に二回の改行を挿入する関数。
    ただし、Markdownテーブル内と行頭が脚注定義の行は除く。読点はそのまま。
    文末に番号がある場合は句点改行を行う。

    Args:
      filepath: 編集する対象のファイルのパス。
    """

    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            text = file.read()
    except FileNotFoundError:
        print(f"エラー: ファイル '{filepath}' が見つかりません。")
        return
    except Exception as e:
        print(f"エラー: ファイルの読み込み中にエラーが発生しました: {e}")
        return

    def replace_period_with_newlines(match):
        pos = match.start(0)
        if not is_inside_table(text, pos) and not is_footnote_line(text, pos):
            return match.group(0) + '\n\n'
        else:
            return match.group(0)

    # まず、文末の脚注参照を一時的な文字列で置換
    def replace_footnote_references(text):
        return re.sub(r'。(\*\d+)', r'。\0TEMP_FOOTNOTE_MARKER\1', text)

    text = replace_footnote_references(text)
    modified_text = re.sub(r'。', replace_period_with_newlines, text)
    modified_text = modified_text.replace('\0TEMP_FOOTNOTE_MARKER', '') # 一時的な文字列を削除

    try:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(modified_text)
        print(f"ファイル '{filepath}' の編集が完了しました。")

    except Exception as e:
        print(f"エラー: ファイルの書き込み中にエラーが発生しました: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使い方: python script.py <編集するファイルのパス>")
    else:
        filepath = sys.argv[1]
        insert_newlines(filepath)