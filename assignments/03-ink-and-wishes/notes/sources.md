# Content and asset sources

Checked September 22, 2026. The website includes a Sources & credits dialog and source links beside the lesson.

| Source | Use and limit |
| --- | --- |
| [Ministry of Education concise dictionary: 福](https://dict.concised.moe.edu.tw/dictView.jsp?ID=6421&la=0&powerMode=0) | Pronunciation **fú** and the auspicious meaning. This dictionary is not the source of the embedded stroke model. Its indexing count differs from the 13-path model used here. |
| [UNESCO: Spring Festival social practices](https://ich.unesco.org/en/RL/spring-festival-social-practices-of-the-chinese-people-in-celebration-of-traditional-new-year-02126) | Context about good wishes, greetings, and traditions transmitted through families and communities. It does not establish that every family follows one practice. |
| [National Palace Museum: Spring Festival printing activity](https://www.npm.gov.tw/Activity-Content.aspx?l=1&sno=04014430) | A specific museum activity making festive inscriptions and red-envelope bags. It supports an educational-making example, not universal etiquette. |
| [The Met: Chinese Calligraphy](https://www.metmuseum.org/essays/chinese-calligraphy) | Background on brushwork and expression. No museum artwork or lengthy quotation is copied into this project. |
| [Hanzi Writer Data](https://github.com/chanind/hanzi-writer-data) and [its licensing explanation](https://hanziwriter.org/license.html) | Reusable, standard-character stroke data. The browser uses our renderer, not the Hanzi Writer JavaScript library. |

The UNESCO page intermittently challenged automated access; its official indexed content was available. The museum page initially returned a fetch error; the official indexed page confirmed the specific activity. These are source-access limits, not invented verification.

## Original 福 asset provenance

- Asset: unmodified `福.json`, saved locally as `site/data/fu.json`.
- Pinned package: `hanzi-writer-data@2.0.1`.
- Download: <https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/%E7%A6%8F.json>
- SHA-256: `9a9e493fd53758afd5919ca0a037d87e078bfa912066c4e3dc090f94b2dc6992`.
- Contains 13 stroke paths and their medians. The same paths/order power the guide, sequence, and quiz.
- Origin: [Make Me a Hanzi](https://github.com/skishore/makemeahanzi), derived from Arphic fonts.
- License: **Arphic Public License**, Copyright © 1999 Arphic Technology Co., Ltd. Full text bundled without modification in `site/data/ARPHICPL.TXT`.
- License source: <https://raw.githubusercontent.com/chanind/hanzi-writer-data/master/ARPHICPL.TXT>.
- License SHA-256: `5590533436c70f10f2f524ee61456238c290175c6662fbe1c700b5f038a6d328`.

The project does not claim that all regional teaching standards use an identical model, or that these paths reproduce a historical calligrapher's work. Expert review of the lesson remains pending.

Interface marks, paper texture, envelope layout, and brush rendering are created in code. The locally bundled mountain background is AI-generated; the exact prompt and provenance are recorded in [the brush iteration](brush-iteration.md). Typography uses locally available system fonts. No remote media, tracking service, AI endpoint, or externally hosted font is required to use the website.

## Six-character expansion

The expanded library also uses these Ministry of Education entries, checked September 22, 2026:

| Entry | Lesson use |
| --- | --- |
| [山](https://dict.concised.moe.edu.tw/dictView.jsp?ID=34392&la=0&powerMode=0) | shān; mountain. |
| [水](https://dict.revised.moe.edu.tw/dictView.jsp?ID=9163&la=0&powerMode=0) | shuǐ; water. |
| [永](https://dict.concised.moe.edu.tw/dictView.jsp?ID=45045&la=0&powerMode=0) | yǒng; lasting, with 永久 and 永遠 as examples. |
| [安](https://dict.concised.moe.edu.tw/dictView.jsp?ID=39684&la=0&powerMode=0) | ān; calm or safety, including 安心. |
| [春](https://dict.concised.moe.edu.tw/dictView.jsp?ID=32885&la=0&powerMode=0) | chūn; spring. The separate UNESCO source supports the Spring Festival connection. |
| [山水](https://dict.concised.moe.edu.tw/dictView.jsp?ID=34440&la=0&powerMode=0) | Landscape and landscape painting, used for the 山/水 cultural connection. |

`shan.json`, `shui.json`, `yong.json`, `an.json`, and `chun.json` are downloaded unchanged from the same pinned `hanzi-writer-data@2.0.1` package. Their selected models contain 3, 4, 5, 6, and 9 strokes respectively. [The manifest](../site/data/manifest.json) records each model's ID, character, count, package version, and checksum; filenames are the ID plus `.json`. The full bundled Arphic license and attribution apply to all six character assets. Step captions and short lesson explanations are project-authored; human review remains pending.
