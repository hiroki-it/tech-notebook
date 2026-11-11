import unittest
from unittest.mock import patch
from xml.etree import ElementTree

import markdown
from mdx_truly_sane_lists.mdx_truly_sane_lists import TrulySaneOListProcessor

from hooks.ordered_list_start import on_config


class OrderedListStartTest(unittest.TestCase):
    def test_list_after_heading_starts_at_specified_number(self):
        source = """## 前半

1. 手順1
2. 手順2

## 後半

3. 手順3
4. 手順4
"""
        # フック適用前の状態から検証し、終了後に元の設定へ戻す。
        with patch.object(TrulySaneOListProcessor, "LAZY_OL", True):
            on_config({})
            html = markdown.markdown(source, extensions=["mdx_truly_sane_lists"])

        root = ElementTree.fromstring(f"<div>{html}</div>")
        self.assertEqual([element.tag for element in root], ["h2", "ol", "h2", "ol"])
        lists = root.findall("ol")
        self.assertEqual([element.get("start", "1") for element in lists], ["1", "3"])
        self.assertEqual(
            [[item.text for item in element.findall("li")] for element in lists],
            [["手順1", "手順2"], ["手順3", "手順4"]],
        )


if __name__ == "__main__":
    unittest.main()
