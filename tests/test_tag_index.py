import unittest
from types import SimpleNamespace

from mkdocs.exceptions import PluginError

from hooks.tag_index import group_tags, kana_sort_key, on_config


class TagIndexTest(unittest.TestCase):
    def test_numbers_english_and_japanese_are_grouped_in_order(self):
        tags = {"言語", "アプリ", "仮想化", "aws", "API", "3大クラウド", "tfファイル"}
        readings = {"言語": "げんご", "仮想化": "かそうか"}
        self.assertEqual(
            group_tags(tags, readings),
            {
                "0–9": ["3大クラウド"],
                "A": ["API", "aws"],
                "T": ["tfファイル"],
                "あ": ["アプリ"],
                "か": ["仮想化"],
                "け": ["言語"],
            },
        )
        self.assertEqual(list(group_tags(tags, readings)), ["0–9", "A", "T", "あ", "か", "け"])

    def test_katakana_and_kanji_share_phonetic_order(self):
        readings = {"可観測性": "かかんそくせい", "仮想化": "かそうか", "監視": "かんし"}
        self.assertEqual(
            group_tags({"監視", "仮想化", "カスタムリソース", "可観測性"}, readings)["か"],
            ["可観測性", "カスタムリソース", "仮想化", "監視"],
        )
        self.assertEqual(group_tags({"コントロール", "コード"}, {})["こ"], ["コード", "コントロール"])

    def test_voiced_small_and_long_kana(self):
        self.assertEqual(kana_sort_key("プラクティス"), "ふらくていす")
        self.assertEqual(kana_sort_key("チャート"), "ちやあと")
        self.assertEqual(kana_sort_key("ｺｰﾄﾞ"), "こおと")
        self.assertEqual(group_tags({"プラクティス"}, {}), {"ふ": ["プラクティス"]})

    def test_reading_lookup_preserves_fullwidth_tag_names(self):
        self.assertEqual(
            group_tags({"認証／認可"}, {"認証／認可": "にんしょう/にんか"}),
            {"に": ["認証／認可"]},
        )

    def test_material_listing_comparator_accepts_tag_and_tree(self):
        plugin = SimpleNamespace(config=SimpleNamespace())
        on_config(SimpleNamespace(plugins={"material/tags": plugin}))
        compare = plugin.config.listings_tags_sort_by
        self.assertLess(
            compare(SimpleNamespace(name="計装"), object()),
            compare(SimpleNamespace(name="言語"), object()),
        )

    def test_unknown_kanji_requires_a_reading(self):
        with self.assertRaisesRegex(PluginError, "タグ「未分類」の読み"):
            group_tags({"未分類"}, {})


if __name__ == "__main__":
    unittest.main()
