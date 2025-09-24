# Google Workspace連携設定手順

発注システムでGmail送信とGoogle Drive保存を利用するための設定手順です。

## 前提条件
- Google Workspaceアカウント（またはGoogleアカウント）
- Google Cloud Console プロジェクトの作成権限

## 設定手順

### 1. Google Cloud Console プロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名: `発注システム連携` (任意)

### 2. APIの有効化

Google Cloud Console で以下のAPIを有効化:

1. **Gmail API**
   - APIs & Services > Library > Gmail API > 有効にする

2. **Google Drive API**
   - APIs & Services > Library > Google Drive API > 有効にする

### 3. OAuth 2.0 認証情報の作成

1. **APIs & Services > Credentials** に移動
2. **認証情報を作成 > OAuth クライアント ID** を選択
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: `発注システム` (任意)
5. **承認済みの JavaScript 生成元** に以下を追加:
   - `http://localhost`
   - `https://your-domain.com` (実際のドメイン)
   - `https://moroga-bit.github.io` (GitHub Pages用)
6. **承認済みのリダイレクト URI** に以下を追加:
   - `http://localhost/callback`
   - `https://your-domain.com/callback`
   - `https://moroga-bit.github.io/moroga-order-system/callback`

### 4. APIキーの作成

1. **APIs & Services > Credentials** に移動
2. **認証情報を作成 > APIキー** を選択
3. 作成されたAPIキーをコピー

### 5. 認証情報の設定

`google-config.js` ファイルを編集:

```javascript
const GOOGLE_CONFIG = {
    API_KEY: 'YOUR_API_KEY_HERE', // ↑で作成したAPIキー
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com', // OAuth クライアントID
    // ...
};
```

### 6. OAuth同意画面の設定

1. **APIs & Services > OAuth同意画面** に移動
2. ユーザータイプ: **外部** (組織外ユーザーも利用可能)
3. アプリ情報を入力:
   - アプリ名: `発注システム`
   - ユーザーサポートメール: 管理者のメールアドレス
   - 承認済みドメイン: 実際のドメイン
4. スコープの追加:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/drive.file`

### 7. テストユーザーの追加（開発段階）

OAuth同意画面が「テスト」状態の場合:
1. **テストユーザー** セクションでユーザーを追加
2. システムを使用するユーザーのメールアドレスを追加

## 使用方法

### 基本的な流れ

1. 発注書を作成・入力
2. **プレビュー** ボタンをクリック
3. **PDF生成** ボタンをクリック
4. **メール送信** ボタンが表示される
5. **メール送信** ボタンをクリック
6. 初回のみGoogle認証が必要
7. 送信先メールアドレスを入力
8. Gmail経由で自動送信 + Google Driveに自動保存

### 機能詳細

#### Gmail連携
- PDF添付でのメール送信
- テンプレート化されたメール本文
- 件名の自動生成

#### Google Drive連携
- PDFファイルの自動保存
- ファイル名の自動生成（発注書_YYYY-MM-DD.pdf）
- 個人のGoogle Driveに保存

## トラブルシューティング

### よくあるエラー

1. **「Google APIs Client Libraryが読み込まれていません」**
   - インターネット接続を確認
   - ブラウザのキャッシュをクリア

2. **「API_KEY または CLIENT_ID が設定されていません」**
   - `google-config.js` の設定を確認
   - 認証情報が正しく入力されているか確認

3. **「このアプリは確認されていません」警告**
   - **詳細設定** → **安全ではないページに移動** をクリック
   - または OAuth同意画面を本番公開する

4. **権限不足エラー**
   - Gmail APIとGoogle Drive APIが有効化されているか確認
   - OAuth同意画面のスコープ設定を確認

### 代替手段

Google Workspace連携が利用できない場合:
- 通常のメーラー（Outlook、Thunderbird等）が自動起動
- PDFファイルを手動で添付

## セキュリティについて

- 認証情報（APIキー・クライアントID）は公開されても問題ありません
- ユーザーの個人情報にはアクセスしません
- 送信されるメールと保存されるPDFのみがアクセス対象
- ユーザーは認証時に明示的に許可する必要があります

## 制限事項

- Gmail API: 1日あたり1,000,000クォータ
- Google Drive API: 1日あたり1,000,000,000クォータ
- 通常の使用範囲では制限に達することはありません
