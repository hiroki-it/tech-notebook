from mdx_truly_sane_lists.mdx_truly_sane_lists import TrulySaneOListProcessor


def on_config(config):
    # 見出しで区切った番号付きリストを、途中の番号から表示する
    TrulySaneOListProcessor.LAZY_OL = False
    return config
