# Template Delimiter Customizer

設定でデリミタをカスタマイズできるテンプレートエンジン用VS Code拡張機能です。

現在対応: **Smarty**

## 機能

- **カスタマイズ可能なデリミタ** - settings.jsonで自由に設定
- シンタックスハイライト
- ブラケットマッチング
- コメントトグル（`Ctrl+/`）
- 自動閉じ括弧
- コード折りたたみ

## インストール方法

1. VS Codeを閉じる
2. このフォルダを以下の場所にコピー：
   - **Windows**: `%USERPROFILE%\.vscode\extensions\template-delimiter-customizer`
   - **macOS/Linux**: `~/.vscode/extensions/template-delimiter-customizer`
3. VS Codeを再起動

## Smarty

### 設定

デフォルトは標準Smartyデリミタ `{...}` です。

`settings.json` に以下を追加してデリミタをカスタマイズ：

```json
{
  "smartyCustom.leftDelimiter": "{",
  "smartyCustom.rightDelimiter": "}",
  "smartyCustom.commentStart": "{*",
  "smartyCustom.commentEnd": "*}"
}
```

### 設定例

#### デフォルト（標準Smarty）
```json
{
  "smartyCustom.leftDelimiter": "{",
  "smartyCustom.rightDelimiter": "}"
}
```

#### HTMLコメント風
```json
{
  "smartyCustom.leftDelimiter": "<!--{",
  "smartyCustom.rightDelimiter": "}-->",
  "smartyCustom.commentStart": "<!--{*",
  "smartyCustom.commentEnd": "*}-->"
}
```

#### ダブルブレース
```json
{
  "smartyCustom.leftDelimiter": "{{",
  "smartyCustom.rightDelimiter": "}}",
  "smartyCustom.commentStart": "{{*",
  "smartyCustom.commentEnd": "*}}"
}
```

#### OXID eShop風
```json
{
  "smartyCustom.leftDelimiter": "[{",
  "smartyCustom.rightDelimiter": "}]",
  "smartyCustom.commentStart": "[{*",
  "smartyCustom.commentEnd": "*}]"
}
```

### 設定の適用

設定を変更した後、以下のいずれかの方法で適用：

1. **コマンドパレット**（`Ctrl+Shift+P`）→「Smarty: Apply Custom Delimiters」を実行
2. 設定変更時に表示される通知の「Apply Now」をクリック
3. VS Codeをリロード

### ファイルの関連付け

他のSmarty拡張機能と競合する場合、`settings.json`に追加：

```json
{
  "files.associations": {
    "*.tpl": "smarty-custom"
  }
}
```

### 対応構文例

```html
{* これはコメントです *}

{if $logged_in}
  <p>ようこそ、{$username|escape}さん</p>
{else}
  <p>ログインしてください</p>
{/if}

{foreach $items as $item}
  <li>{$item.name} - {$item.price|number_format}円</li>
{/foreach}

{include file="header.tpl"}
{assign var="total" value=$price * $quantity}
```

## トラブルシューティング

### ハイライトが適用されない
1. ファイルの言語モードが「Smarty Custom」になっているか確認（右下に表示）
2. 「Smarty: Apply Custom Delimiters」コマンドを実行
3. VS Codeをリロード

### 設定が反映されない
1. settings.jsonの構文エラーがないか確認
2. コマンドパレットから「Smarty: Apply Custom Delimiters」を実行
3. 「Reload Now」をクリックしてウィンドウをリロード

## カスタムハイライト色

```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "punctuation.section.embedded.begin.smarty",
        "settings": { "foreground": "#FFA500", "fontStyle": "bold" }
      },
      {
        "scope": "keyword.control.smarty",
        "settings": { "foreground": "#16A016" }
      },
      {
        "scope": "variable.other.smarty",
        "settings": { "foreground": "#AE23A3" }
      },
      {
        "scope": "support.function.built-in.smarty",
        "settings": { "foreground": "#0099CC" }
      }
    ]
  }
}
```
