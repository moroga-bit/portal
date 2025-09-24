// Google APIs設定ファイル
// 使用前にGoogle Cloud Consoleでプロジェクトを作成し、APIキーとクライアントIDを取得してください

const GOOGLE_CONFIG = {
    // Google Cloud Console > APIs & Services > Credentials で取得
    API_KEY: 'YOUR_API_KEY_HERE', // 要設定
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE', // 要設定
    
    // 使用するAPIスコープ
    SCOPES: [
        'https://www.googleapis.com/auth/gmail.send', // Gmail送信
        'https://www.googleapis.com/auth/drive.file'  // Google Drive書き込み
    ],
    
    // Google APIs Discovery URLs
    DISCOVERY_DOCS: [
        'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ]
};

// Google APIs認証と初期化
class GoogleWorkspaceIntegration {
    constructor() {
        this.isInitialized = false;
        this.isSignedIn = false;
    }

    // Google APIs初期化
    async initialize() {
        try {
            console.log('Google APIs初期化中...');
            
            if (typeof gapi === 'undefined') {
                throw new Error('Google APIs Client Libraryが読み込まれていません');
            }

            await new Promise((resolve) => {
                gapi.load('auth2:client', resolve);
            });

            await gapi.client.init({
                apiKey: GOOGLE_CONFIG.API_KEY,
                clientId: GOOGLE_CONFIG.CLIENT_ID,
                discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
                scope: GOOGLE_CONFIG.SCOPES.join(' ')
            });

            this.authInstance = gapi.auth2.getAuthInstance();
            this.isInitialized = true;
            this.isSignedIn = this.authInstance.isSignedIn.get();

            console.log('Google APIs初期化完了');
            return true;

        } catch (error) {
            console.error('Google APIs初期化エラー:', error);
            throw error;
        }
    }

    // Google認証
    async signIn() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.isSignedIn) {
                console.log('既にサインイン済みです');
                return true;
            }

            console.log('Google認証中...');
            await this.authInstance.signIn();
            this.isSignedIn = true;
            console.log('Google認証完了');
            return true;

        } catch (error) {
            console.error('Google認証エラー:', error);
            throw error;
        }
    }

    // Gmail APIでメール送信
    async sendEmail(emailData) {
        try {
            if (!this.isSignedIn) {
                await this.signIn();
            }

            const email = this.createEmailMessage(emailData);
            const request = gapi.client.gmail.users.messages.send({
                userId: 'me',
                resource: {
                    raw: email
                }
            });

            const response = await request;
            console.log('Gmail送信完了:', response);
            return response;

        } catch (error) {
            console.error('Gmail送信エラー:', error);
            throw error;
        }
    }

    // Google DriveにPDF保存
    async saveToDrive(pdfBlob, fileName, folderId = null) {
        try {
            if (!this.isSignedIn) {
                await this.signIn();
            }

            const metadata = {
                name: fileName,
                parents: folderId ? [folderId] : undefined
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
            form.append('file', pdfBlob);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({
                    'Authorization': `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
                }),
                body: form
            });

            const result = await response.json();
            console.log('Google Drive保存完了:', result);
            return result;

        } catch (error) {
            console.error('Google Drive保存エラー:', error);
            throw error;
        }
    }

    // メールメッセージ作成（Base64エンコード）
    createEmailMessage(emailData) {
        const { to, subject, body, attachments = [] } = emailData;
        
        const boundary = 'boundary_' + Math.random().toString(36).substring(2);
        let email = [
            'Content-Type: multipart/mixed; boundary="' + boundary + '"',
            'MIME-Version: 1.0',
            'To: ' + to,
            'Subject: ' + subject,
            '',
            '--' + boundary,
            'Content-Type: text/plain; charset="UTF-8"',
            'MIME-Version: 1.0',
            'Content-Transfer-Encoding: 7bit',
            '',
            body,
            ''
        ];

        // 添付ファイル処理
        for (const attachment of attachments) {
            email = email.concat([
                '--' + boundary,
                'Content-Type: ' + attachment.mimeType,
                'MIME-Version: 1.0',
                'Content-Transfer-Encoding: base64',
                'Content-Disposition: attachment; filename="' + attachment.filename + '"',
                '',
                attachment.data,
                ''
            ]);
        }

        email.push('--' + boundary + '--');
        
        return btoa(unescape(encodeURIComponent(email.join('\r\n')))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    // PDFをBase64に変換
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result;
                const base64 = dataUrl.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

// グローバル変数として利用可能に
window.GoogleWorkspaceIntegration = GoogleWorkspaceIntegration;
