# 発注書作成システム

WEBでコントロールでき、最終的にPDFで保存できる発注書作成システムです。

## 機能

- 📝 **発注書フォーム**: 発注元・発注先情報の入力
- 🛍️ **商品管理**: 複数商品の追加・削除・編集
- 💰 **自動計算**: 小計・消費税・合計金額の自動計算
- 👁️ **プレビュー**: 発注書のリアルタイムプレビュー
- 📄 **PDF出力**: 高品質なPDFファイルの生成・保存
- 🎨 **レスポンシブデザイン**: PC・タブレット・スマートフォン対応

## 使用方法

### 1. ローカルサーバーの起動

```bash
# 方法1: npmを使用
npm install
npm start

# 方法2: 直接起動
npx http-server -p 8080 -o

# 方法3: ライブリロード付き
npx live-server --port=8080 --open=/index.html
```

### 2. ブラウザでアクセス

`http://localhost:8080` にアクセスして発注書作成システムを使用できます。

## 使い方

1. **発注元情報の入力**
   - 会社名、住所、電話番号、メールアドレスを入力
   - 発注日を設定

2. **発注先情報の入力**
   - 発注先の会社情報を入力
   - 担当者名も入力可能

3. **商品情報の追加**
   - 「商品を追加」ボタンで商品行を追加
   - 商品名、数量、単価を入力（小計は自動計算）
   - 不要な商品は「削除」ボタンで削除

4. **その他情報の設定**
   - 希望納期、支払条件、備考を入力

5. **プレビュー・PDF生成**
   - 「プレビュー」ボタンで発注書を確認
   - 「PDF生成」ボタンでPDFファイルをダウンロード

## 技術仕様

- **HTML5**: セマンティックなマークアップ
- **CSS3**: モダンなスタイリング、Flexbox、Grid
- **JavaScript (ES6+)**: クラスベースの実装
- **jsPDF**: PDF生成ライブラリ
- **html2canvas**: HTML to Canvas変換

## ファイル構成

```
├── index.html          # メインHTMLファイル
├── styles.css          # スタイルシート
├── script.js           # JavaScriptロジック
├── package.json        # プロジェクト設定
└── README.md          # このファイル
```

## カスタマイズ

### 会社情報のデフォルト値変更

`index.html`の以下の部分を編集してください：

```html
<input type="text" id="companyName" name="companyName" value="株式会社カーサー" required>
<input type="text" id="companyAddress" name="companyAddress" value="東京都渋谷区恵比寿1-2-3" required>
```

### スタイルのカスタマイズ

`styles.css`で色やレイアウトを調整できます：

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #28a745;
}
```

## ブラウザ対応

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## ライセンス

MIT License

## サポート

ご質問やご要望がございましたら、お気軽にお問い合わせください。

