import re
import sys

def hide_mermaid_code(filepath):
    """
    指定されたファイルのMermaidコードを<div hidden>タグで囲む。

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

    # "- （Mermaidのコード）" を <div hidden> に置換
    text = text.replace("- （Mermaidのコード）", "<div hidden>")

    # その後の ```mermaid ... ``` を </div> で囲む
    def replace_mermaid(match):
        return match.group(0) + "\n</div>"

    text = re.sub(r"```mermaid.*?```", replace_mermaid, text, flags=re.DOTALL)

    try:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(text)
        print(f"ファイル '{filepath}' の編集が完了しました。")

    except Exception as e:
        print(f"エラー: ファイルの書き込み中にエラーが発生しました: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使い方: python script.py <編集するファイルのパス>")
    else:
        filepath = sys.argv[1]
        hide_mermaid_code(filepath)