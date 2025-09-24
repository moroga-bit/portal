// 発注書作成システムのメインスクリプト

class OrderFormManager {
    constructor() {
        console.log('=== OrderFormManager 初期化開始 ===');
        this.initializeEventListeners();
        this.setDefaultDate();
        this.setupExistingItemRows();
        this.calculateTotals();
        
        // 強制的に小計計算を実行（初期化後）
        setTimeout(() => {
            console.log('=== 初期化後の強制計算実行 ===');
            this.forceCalculateAllSubtotals();
        }, 100);
        
        console.log('=== OrderFormManager 初期化完了 ===');
    }

    initializeEventListeners() {
        console.log('イベントリスナー初期化開始');
        
        // 商品追加ボタン
        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                console.log('商品追加ボタンがクリックされました');
                this.addItemRow();
            });
            console.log('商品追加ボタンのイベントリスナーを設定しました');
        } else {
            console.warn('addItemBtn が見つかりません - 後で再試行します');
            // 少し遅延して再試行
            setTimeout(() => {
                const retryAddItemBtn = document.getElementById('addItemBtn');
                if (retryAddItemBtn) {
                    retryAddItemBtn.addEventListener('click', () => {
                        console.log('商品追加ボタンがクリックされました（再試行後）');
                        this.addItemRow();
                    });
                    console.log('商品追加ボタンのイベントリスナーを再設定しました');
                }
            }, 100);
        }


        // 商品削除ボタン（動的に追加される）
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                this.removeItemRow(e.target);
            }
        });

        // 数量・単価変更時の計算（簡単な方法）
        document.addEventListener('input', (e) => {
            console.log('inputイベント発生:', e.target);
            console.log('target.name:', e.target.name);
            console.log('target.value:', e.target.value);
            
            if (e.target.name === 'itemQuantity[]' || e.target.name === 'itemPrice[]') {
                console.log('数量または単価が変更されました');
                
                // 簡単な方法で小計を計算
                const row = e.target.closest('.item-row');
                if (row) {
                    const quantityInput = row.querySelector('input[name="itemQuantity[]"]');
                    const priceInput = row.querySelector('input[name="itemPrice[]"]');
                    const subtotalInput = row.querySelector('input[name="itemSubtotal[]"]');
                    
                    if (quantityInput && priceInput && subtotalInput) {
                        const quantity = parseFloat(quantityInput.value) || 0;
                        const price = parseFloat(priceInput.value) || 0;
                        const subtotal = quantity * price;
                        
                        console.log('直接計算:', { quantity, price, subtotal });
                        subtotalInput.value = Math.floor(subtotal);
                        
                        // 合計も更新
                this.calculateTotals();
                    }
                }
            } else {
                console.log('対象外のフィールドです');
            }
        });

        // changeイベントもバックアップとして追加
        document.addEventListener('change', (e) => {
            if (e.target.name === 'itemQuantity[]' || e.target.name === 'itemPrice[]') {
                console.log('changeイベント:', e.target.name, e.target.value);
                
                const row = e.target.closest('.item-row');
                if (row) {
                    const quantityInput = row.querySelector('input[name="itemQuantity[]"]');
                    const priceInput = row.querySelector('input[name="itemPrice[]"]');
                    const subtotalInput = row.querySelector('input[name="itemSubtotal[]"]');
                    
                    if (quantityInput && priceInput && subtotalInput) {
                        const quantity = parseFloat(quantityInput.value) || 0;
                        const price = parseFloat(priceInput.value) || 0;
                        const subtotal = quantity * price;
                        
                        console.log('changeイベント計算:', { quantity, price, subtotal });
                        subtotalInput.value = Math.floor(subtotal);
                        this.calculateTotals();
                    }
                }
            }
        });

        // blurイベント（フォーカスが外れた時）も追加
        document.addEventListener('blur', (e) => {
            if (e.target.name === 'itemQuantity[]' || e.target.name === 'itemPrice[]') {
                console.log('blurイベント:', e.target.name, e.target.value);
                
                const row = e.target.closest('.item-row');
                if (row) {
                    const quantityInput = row.querySelector('input[name="itemQuantity[]"]');
                    const priceInput = row.querySelector('input[name="itemPrice[]"]');
                    const subtotalInput = row.querySelector('input[name="itemSubtotal[]"]');
                    
                    if (quantityInput && priceInput && subtotalInput) {
                        const quantity = parseFloat(quantityInput.value) || 0;
                        const price = parseFloat(priceInput.value) || 0;
                        const subtotal = quantity * price;
                        
                        console.log('blurイベント計算:', { quantity, price, subtotal });
                        subtotalInput.value = Math.floor(subtotal);
                        this.calculateTotals();
                    }
                }
            }
        }, true); // useCapture=true でより確実にキャッチ

        // Enterキーで次のフィールドに移動
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.closest('.item-row')) {
                e.preventDefault();
                this.moveToNextField(e.target);
            }
        });

        // フィールドから離れた時の自動移動（数値入力完了時）
        document.addEventListener('blur', (e) => {
            if (e.target.name === 'itemQuantity[]' || e.target.name === 'itemPrice[]') {
                // 値が入力されていて、次のフィールドが空の場合は自動移動
                if (e.target.value && e.target.value.trim() !== '') {
                    setTimeout(() => {
                        this.moveToNextField(e.target);
                    }, 100); // 少し遅延させて他の処理を完了させる
                }
            }
        }, true);

        // プレビューボタン
        const previewBtn = document.getElementById('previewBtn');
        console.log('プレビューボタン要素:', previewBtn);
        if (previewBtn) {
            previewBtn.addEventListener('click', (event) => {
                console.log('プレビューボタンがクリックされました');
                event.preventDefault();
                
                // プレビュー表示
                try {
                    this.showPreview();
                } catch (error) {
                    console.error('showPreviewエラー:', error);
                    alert('プレビュー表示中にエラーが発生しました: ' + error.message);
                }
            });
            console.log('プレビューボタンのイベントリスナーを設定しました');
        } else {
            console.error('プレビューボタンが見つかりません');
        }

        // プレビュー閉じるボタン
        const closePreviewBtn = document.getElementById('closePreviewBtn');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => {
                console.log('プレビュー閉じるボタンがクリックされました');
                this.hidePreview();
            });
        } else {
            console.error('closePreviewBtn が見つかりません');
        }

        // プレビューモーダルのバツボタン
        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('close')) {
                console.log('プレビューのバツボタンがクリックされました');
                this.hidePreview();
            }
        });

        // モーダル背景クリックで閉じる
        document.addEventListener('click', (e) => {
            const previewModal = document.getElementById('previewModal');
            if (e.target === previewModal) {
                console.log('モーダル背景がクリックされました');
                this.hidePreview();
            }
        });

        // プレビュー内のPDF生成ボタン
        const generatePdfBtn = document.getElementById('generatePdfBtn');
        if (generatePdfBtn) {
            generatePdfBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('PDF生成ボタンがクリックされました');
                this.generatePDF();
            });
            console.log('PDF生成ボタンのイベントリスナーを設定しました');
        } else {
            console.error('generatePdfBtn が見つかりません');
        }

        // メール送信ボタン
        const sendEmailBtn = document.getElementById('sendEmailBtn');
        if (sendEmailBtn) {
            sendEmailBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('メール送信ボタンがクリックされました');
                this.sendPDFByEmail();
            });
            console.log('メール送信ボタンのイベントリスナーを設定しました');
        } else {
            console.error('sendEmailBtn が見つかりません');
        }

        // PDF生成 & メール送信ボタン
        const generateAndEmailBtn = document.getElementById('generateAndEmailBtn');
        if (generateAndEmailBtn) {
            generateAndEmailBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('PDF生成 & メール送信ボタンがクリックされました');
                
                try {
                    // PDF生成
                    await this.generatePDF();
                    
                    // 少し待ってからメール送信
                    setTimeout(() => {
                        this.sendPDFByEmail();
                    }, 1000);
                    
                } catch (error) {
                    console.error('PDF生成 & メール送信エラー:', error);
                    alert('PDF生成中にエラーが発生しました: ' + error.message);
                }
            });
            console.log('PDF生成 & メール送信ボタンのイベントリスナーを設定しました');
        } else {
            console.error('generateAndEmailBtn が見つかりません');
        }



        // リセットボタン
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('リセットボタンがクリックされました');
                this.resetForm();
            });
        } else {
            console.error('resetBtn が見つかりません');
        }

        
        // フォームのリセットイベントを防ぐ
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('reset', (e) => {
                console.log('フォームリセットイベントが発生しました');
                // リセットイベントを防ぐ（確認ダイアログを表示しない）
                e.preventDefault();
            });
        }
        
        console.log('イベントリスナー初期化完了');
    }

    // 日本語フォントをjsPDFに埋め込む（複数のCDNから試行）
    async embedJapaneseFont(pdf) {
        const fontUrls = [
            'https://fonts.gstatic.com/s/notosansjp/v52/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.ttf',
            'https://fonts.gstatic.com/s/notosansjp/v52/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.ttf',
            'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansJP/NotoSansJP-Regular.ttf'
        ];
        
        for (const fontUrl of fontUrls) {
            try {
                console.log('フォント読み込み開始:', fontUrl);
                
                const res = await fetch(fontUrl, { cache: 'no-store' });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status} ${res.statusText}`);
                }
                
                const buf = await res.arrayBuffer();
                let binary = '';
                const bytes = new Uint8Array(buf);
                const chunkSize = 0x8000;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    const chunk = bytes.subarray(i, i + chunkSize);
                    binary += String.fromCharCode.apply(null, chunk);
                }
                const base64 = btoa(binary);
                
                pdf.addFileToVFS('NotoSansJP-Regular.ttf', base64);
                pdf.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
                pdf.setFont('NotoSansJP', 'normal');
                
                console.log('フォント読み込み成功:', fontUrl);
                return;
            } catch (err) {
                console.warn(`フォント読み込み失敗: ${fontUrl}`, err);
            }
        }
        
        console.warn('すべてのフォント読み込み失敗、英語フォントで継続');
        pdf.setFont('helvetica', 'normal');
    }

    // 現在のフォームDOMから商品行を順序通りに取得
    getItemsFromDOM() {
        const rows = Array.from(document.querySelectorAll('#itemsContainer .item-row'));
        return rows.map(row => {
            const get = (selector) => {
                const el = row.querySelector(selector);
                return el ? el.value : '';
            };
            const quantity = parseFloat(get('input[name="itemQuantity[]"]') || '0') || 0;
            const price = parseFloat(get('input[name="itemPrice[]"]') || '0') || 0;
            return {
                projectName: get('input[name="itemProjectName[]"]'),
                name: get('input[name="itemName[]"]'),
                unit: get('input[name="itemUnit[]"]'),
                quantity,
                price,
                subtotal: quantity * price
            };
        });
    }

    // ベクター（テキスト）でPDFを生成（A4/自動改ページ）
    async generateVectorPDF() {
        try {
            // ライブラリ確認
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDFライブラリが読み込まれていません');
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            // 日本語フォント埋め込み（失敗時は英語フォントで継続）
            try {
                await this.embedJapaneseFont(pdf);
            } catch (fontError) {
                console.warn('日本語フォント読み込み失敗、英語フォントで継続:', fontError);
                pdf.setFont('helvetica', 'normal');
            }

            const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
            const margin = 15; // mm
            let y = margin;

            const formData = this.getFormData();
            const items = this.getItemsFromDOM(); // DOM順で取得（プレビューと一致）

            // ヘッダー背景（現代的デザイン）
            pdf.setFillColor(99, 102, 241); // モダンブルー
            pdf.rect(0, 0, pageWidth, 35, 'F');
            
            // ロゴエリア（左側）
            pdf.setFillColor(255, 165, 0); // オレンジ色（ロゴの色）
            pdf.rect(10, 5, 60, 25, 'F');
            
            // ロゴテキスト（MOROGA）
            pdf.setFontSize(16);
            pdf.setTextColor(255, 255, 255); // 白
            pdf.text('MOROGA', 40, 20, { align: 'center' });
            
            // 会社名（日本語）
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0); // 黒
            pdf.text('株式会社諸鹿彩色', 40, 12, { align: 'center' });
            
            // タイトル（右側）
            pdf.setFontSize(24);
            pdf.setTextColor(255, 255, 255); // 白
            pdf.text('発注書', pageWidth - 30, 20, { align: 'center' });
            y = 45;

            // 発注書番号（現代的デザイン）
            const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
            pdf.setFontSize(10);
            pdf.setTextColor(99, 102, 241); // モダンブルー
            pdf.text(`発注書番号: ${orderNumber}`, pageWidth / 2, y, { align: 'center' });
            y += 20;

            // 会社情報セクション（現代的デザイン）
            const colLeft = margin;
            const colRight = pageWidth / 2 + 5;
            
            // 発注元セクション
            pdf.setFillColor(248, 250, 252); // 薄いグレー背景
            pdf.rect(colLeft - 5, y - 5, pageWidth / 2 - 10, 45, 'F');
            pdf.setLineWidth(1);
            pdf.setDrawColor(226, 232, 240);
            pdf.rect(colLeft - 5, y - 5, pageWidth / 2 - 10, 45);
            
            pdf.setFontSize(12);
            pdf.setTextColor(99, 102, 241); // モダンブルー
            pdf.text('発注元', colLeft, y);
            y += 8;
            
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81); // ダークグレー
            const leftLines = [
                `${formData.companyName}`,
                `${formData.companyAddress}`,
                `TEL: ${formData.companyPhone}`,
                `Email: ${formData.companyEmail}`
            ];
            leftLines.forEach((t, i) => {
                pdf.text(t, colLeft, y + i * 4);
            });
            
            // 発注先セクション
            pdf.setFillColor(248, 250, 252); // 薄いグレー背景
            pdf.rect(colRight - 5, y - 8, pageWidth / 2 - 10, 45, 'F');
            pdf.setLineWidth(1);
            pdf.setDrawColor(226, 232, 240);
            pdf.rect(colRight - 5, y - 8, pageWidth / 2 - 10, 45);
            
            pdf.setFontSize(12);
            pdf.setTextColor(99, 102, 241); // モダンブルー
            pdf.text('発注先', colRight, y - 8);
            
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81); // ダークグレー
            const rightLines = [
                `${formData.supplierName || ''}`,
                `${formData.supplierAddress || ''}`,
                formData.supplierPhone ? `TEL: ${formData.supplierPhone}` : '',
                formData.supplierEmail ? `Email: ${formData.supplierEmail}` : ''
            ].filter(Boolean);
            
            rightLines.forEach((t, i) => {
                pdf.text(t, colRight, y + i * 4);
            });
            
            y += 15;

            // 発注詳細（現代的デザイン）
            pdf.setFillColor(99, 102, 241); // モダンブルー背景
            pdf.rect(margin, y - 5, pageWidth - margin * 2, 20, 'F');
            
            pdf.setFontSize(11);
            pdf.setTextColor(255, 255, 255); // 白
            const detailLines = [
                `発注日: ${formData.orderDate}`,
                formData.completionMonth ? `工事完了月: ${formData.completionMonth}` : null,
                `支払条件: ${formData.paymentTerms}`
            ].filter(Boolean);
            
            detailLines.forEach((t, i) => {
                pdf.text(t, margin + 5, y + 5 + i * 4);
            });
            y += 25;

            // テーブル設定（プレビューと同じ比率 + 装飾）
            const innerWidth = pageWidth - margin * 2;
            pdf.setFontSize(11);
            const cols = [
                { title: '工事件名', ratio: 0.35 },
                { title: '商品名',     ratio: 0.30 },
                { title: '数量',       ratio: 0.15 },
                { title: '単価',       ratio: 0.10 },
                { title: '小計',       ratio: 0.10 }
            ].map(c => ({ title: c.title, width: Math.floor(innerWidth * c.ratio) }));

            const drawTableHeader = () => {
                // テーブルヘッダーの背景色（現代的グラデーション風）
                pdf.setFillColor(99, 102, 241); // モダンブルー
                pdf.rect(margin, y - 3, innerWidth, 10, 'F');
                
                // テーブルヘッダーの枠線
                pdf.setLineWidth(0.5);
                pdf.setDrawColor(99, 102, 241);
                pdf.rect(margin, y - 3, innerWidth, 10);
                
                let x = margin;
                pdf.setFontSize(10);
                pdf.setTextColor(255, 255, 255); // 白
                cols.forEach(c => {
                    pdf.text(c.title, x + 3, y + 3);
                    x += c.width;
                });
                y += 10;
            };

            drawTableHeader();

            let subtotal = 0;
            for (let i = 0; i < items.length; i++) {
                const { projectName, name, quantity, unit, price, subtotal: rowSubtotal } = items[i];
                subtotal += rowSubtotal;

                // 各セル用テキストと揃え（プレビューと同じスタイル）
                const cells = [
                    { text: projectName || '', align: 'left' },
                    { text: name, align: 'left' },
                    { text: `${quantity} ${unit}`, align: 'left' },
                    { text: `¥${price.toLocaleString()}`, align: 'right' },
                    { text: `¥${rowSubtotal.toLocaleString()}`, align: 'right' }
                ];

                // 折返し計算と行高算出
                const wraps = cells.map((c, idx) => pdf.splitTextToSize(c.text, cols[idx].width - 4));
                const rowHeight = Math.max(5, ...wraps.map(w => w.length * 4)) + 2;

                // 改ページ（次行分のスペースを確保）
                if (y + rowHeight > pageHeight - margin - 30) {
                    pdf.addPage();
                    y = margin;
                    drawTableHeader();
                }

                // 行の描画（現代的デザイン）
                let cx = margin;
                pdf.setFontSize(10);
                
                // 行の背景色（現代的な交互色）
                if (i % 2 === 0) {
                    pdf.setFillColor(248, 250, 252); // 薄いグレー
                } else {
                    pdf.setFillColor(255, 255, 255); // 白
                }
                pdf.rect(margin, y - 2, innerWidth, rowHeight, 'F');
                
                // 行の枠線（現代的）
                pdf.setLineWidth(0.3);
                pdf.setDrawColor(226, 232, 240);
                pdf.rect(margin, y - 2, innerWidth, rowHeight);
                
                // テキスト色を設定
                pdf.setTextColor(55, 65, 81); // ダークグレー
                
                for (let idx = 0; idx < cells.length; idx++) {
                    const width = cols[idx].width;
                    const wrapped = wraps[idx];
                    if (cells[idx].align === 'right') {
                        // 右寄せは各行を右端基準で描画
                        wrapped.forEach((line, li) => {
                            pdf.text(line, cx + width - 3, y + (li + 1) * 4, { align: 'right' });
                        });
                    } else {
                        pdf.text(wrapped, cx + 3, y + 4);
                    }
                    cx += width;
                }

                y += rowHeight;
            }

            y += 10;

            // 合計（現代的デザイン）
            const tax = Math.ceil(subtotal * 0.1); // 10%の消費税（小数点切り上げ）
            const total = subtotal + tax;

            // 合計セクションの背景（現代的）
            pdf.setFillColor(99, 102, 241); // モダンブルー
            pdf.rect(pageWidth - margin - 100, y - 5, 100, 25, 'F');
            
            // 合計セクションの枠線
            pdf.setLineWidth(1);
            pdf.setDrawColor(99, 102, 241);
            pdf.rect(pageWidth - margin - 100, y - 5, 100, 25);

            pdf.setFontSize(11);
            pdf.setTextColor(255, 255, 255); // 白
            pdf.text(`小計: ¥${subtotal.toLocaleString()}`, pageWidth - margin - 5, y + 2, { align: 'right' });
            y += 6;
            pdf.text(`消費税(10%): ¥${tax.toLocaleString()}`, pageWidth - margin - 5, y + 2, { align: 'right' });
            y += 6;
            pdf.setFontSize(13);
            pdf.setTextColor(255, 255, 255);
            pdf.text(`合計金額: ¥${total.toLocaleString()}`, pageWidth - margin - 5, y + 2, { align: 'right' });

            // 備考（現代的デザイン）
            if (formData.remarks) {
                y += 20;
                
                // 備考セクションの背景
                pdf.setFillColor(248, 250, 252); // 薄いグレー背景
                pdf.rect(margin, y - 5, pageWidth - margin * 2, 20, 'F');
                pdf.setLineWidth(1);
                pdf.setDrawColor(226, 232, 240);
                pdf.rect(margin, y - 5, pageWidth - margin * 2, 20);
                
                pdf.setFontSize(11);
                pdf.setTextColor(99, 102, 241); // モダンブルー
                pdf.text('備考:', margin + 5, y + 3);
                
                y += 8;
                pdf.setTextColor(55, 65, 81); // ダークグレー
                const remarksWrapped = pdf.splitTextToSize(formData.remarks, pageWidth - margin * 2 - 10);
                pdf.text(remarksWrapped, margin + 5, y);
            }

            // フッター（ハンコ表示）
            y = pageHeight - 40;
            pdf.setFontSize(10);
            pdf.setTextColor(102, 102, 102); // グレー
            pdf.text('この度はお取引いただき、誠にありがとうございます。', pageWidth - 20, y, { align: 'right' });
            
            // 担当者に応じたハンコ表示
            const staffMember = formData.staffMember ? formData.staffMember.trim() : '';
            if (staffMember === '諸鹿大介') {
                y += 15;
                // ハンコの円形背景（赤）
                pdf.setFillColor(220, 38, 38); // 赤色
                pdf.circle(pageWidth - 20, y, 8, 'F');
                
                // ハンコの文字（白）
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(8);
                pdf.text('諸鹿', pageWidth - 20, y - 2, { align: 'center' });
                pdf.text('大介', pageWidth - 20, y + 2, { align: 'center' });
            } else if (staffMember === '奥山竜矢') {
                y += 15;
                // ハンコの円形背景（赤）
                pdf.setFillColor(220, 38, 38); // 赤色
                pdf.circle(pageWidth - 20, y, 8, 'F');
                
                // ハンコの文字（白）
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(8);
                pdf.text('奥山', pageWidth - 20, y - 2, { align: 'center' });
                pdf.text('竜矢', pageWidth - 20, y + 2, { align: 'center' });
            }

            // 保存
            const fileName = `発注書_ベクター_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
        } catch (e) {
            console.error(e);
            alert('ベクターPDF生成で問題が発生しました: ' + e.message);
        }
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('orderDate').value = today;
    }


    addItemRow() {
        const container = document.getElementById('itemsContainer');
        const newRow = document.createElement('div');
        newRow.className = 'item-row';
        newRow.innerHTML = `
            <div class="form-group">
                <label>工事名</label>
                <input type="text" name="itemProjectName[]">
            </div>
            <div class="form-group">
                <label>商品名</label>
                <input type="text" name="itemName[]">
            </div>
            <div class="form-group">
                <label>数量</label>
                <input type="number" name="itemQuantity[]" min="1">
            </div>
            <div class="form-group">
                <label>単位</label>
                <input type="text" name="itemUnit[]" placeholder="単位を入力">
            </div>
            <div class="form-group">
                <label>単価（円）</label>
                <input type="number" name="itemPrice[]" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>小計（円）</label>
                <input type="number" name="itemSubtotal[]" readonly>
            </div>
            <div class="form-group">
                <button type="button" class="remove-item-btn" onclick="removeItem(this)">削除</button>
            </div>
        `;
        container.appendChild(newRow);
        
        // 新しく追加された行の計算機能を設定
        this.setupItemRowCalculation(newRow);
    }
    
    // 既存の商品行に計算機能を設定
    setupExistingItemRows() {
        console.log('=== setupExistingItemRows 呼び出し ===');
        const itemRows = document.querySelectorAll('.item-row');
        console.log('既存の商品行数:', itemRows.length);
        console.log('既存の商品行:', itemRows);
        
        itemRows.forEach((row, index) => {
            console.log(`商品行 ${index + 1} の設定中:`, row);
            this.setupItemRowCalculation(row);
        });
        
        console.log('setupExistingItemRows 完了');
    }
    
    // 商品行の計算機能を設定
    setupItemRowCalculation(row) {
        console.log('=== setupItemRowCalculation 呼び出し ===');
        console.log('対象行:', row);
        
        const quantityInput = row.querySelector('input[name="itemQuantity[]"]');
        const priceInput = row.querySelector('input[name="itemPrice[]"]');
        const subtotalInput = row.querySelector('input[name="itemSubtotal[]"]');
        
        console.log('数量input:', quantityInput);
        console.log('単価input:', priceInput);
        console.log('小計input:', subtotalInput);
        
        if (quantityInput && priceInput) {
            console.log('イベントリスナーを設定します');
            
            // 既存のリスナーを削除（重複防止）
            quantityInput.removeEventListener('input', this.quantityChangeHandler);
            priceInput.removeEventListener('input', this.priceChangeHandler);
            
            // 新しいリスナーを設定
            this.quantityChangeHandler = () => {
                console.log('数量入力イベント:', quantityInput.value);
                this.calculateItemSubtotal(quantityInput);
                this.calculateTotals();
            };
            
            this.priceChangeHandler = () => {
                console.log('単価入力イベント:', priceInput.value);
                this.calculateItemSubtotal(priceInput);
                this.calculateTotals();
            };
            
            quantityInput.addEventListener('input', this.quantityChangeHandler);
            priceInput.addEventListener('input', this.priceChangeHandler);
            
            console.log('イベントリスナー設定完了');
        } else {
            console.error('数量または単価のinputが見つかりません');
        }
    }

    removeItemRow(button) {
        const container = document.getElementById('itemsContainer');
        const itemRows = container.querySelectorAll('.item-row');
        
        // 最低1行は残す
        if (itemRows.length > 1) {
            const itemRow = button.closest('.item-row');
            itemRow.remove();
            this.calculateTotals();
        } else {
            alert('最低1行の商品情報が必要です。');
        }
    }

    calculateItemSubtotal(input) {
        console.log('=== calculateItemSubtotal が呼ばれました ===');
        console.log('input要素:', input);
        console.log('input.name:', input.name);
        console.log('input.value:', input.value);
        
        const row = input.closest('.item-row');
        console.log('対象行:', row);
        
        if (!row) {
            console.error('行要素が見つかりません');
            return;
        }
        
        const quantityInput = row.querySelector('input[name="itemQuantity[]"]');
        const priceInput = row.querySelector('input[name="itemPrice[]"]');
        const subtotalInput = row.querySelector('input[name="itemSubtotal[]"]');
        
        console.log('数量input:', quantityInput);
        console.log('単価input:', priceInput);
        console.log('小計input:', subtotalInput);
        
        const quantity = parseFloat(quantityInput?.value) || 0;
        const price = parseFloat(priceInput?.value) || 0;
        const subtotal = quantity * price;
        
        console.log('小計計算:', { quantity, price, subtotal });
        
        if (subtotalInput) {
            subtotalInput.value = Math.floor(subtotal);
            console.log('小計を設定しました:', Math.floor(subtotal));
        } else {
            console.error('小計inputが見つかりません');
        }
    }

    calculateTotals() {
        const subtotalInputs = document.querySelectorAll('input[name="itemSubtotal[]"]');
        let subtotal = 0;
        
        subtotalInputs.forEach(input => {
            subtotal += parseFloat(input.value) || 0;
        });
        
        const tax = Math.ceil(subtotal * 0.1); // 10%の消費税（小数点切り上げ）
        const total = subtotal + tax;
        
        console.log('合計計算:', { subtotal, tax, total });
        
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');
        
        if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString();
        if (taxElement) taxElement.textContent = tax.toLocaleString();
        if (totalElement) totalElement.textContent = total.toLocaleString();
        
        // 商品合計を表示
        this.updateItemsTotal(subtotal);
    }
    
    // 商品合計を更新
    updateItemsTotal(total) {
        const itemsTotalElement = document.getElementById('itemsTotal');
        if (itemsTotalElement) {
            itemsTotalElement.textContent = total.toLocaleString();
        }
    }

    showPreview() {
        console.log('=== showPreview が呼び出されました ===');
        
        try {
        const formData = this.getFormData();
            console.log('フォームデータ取得完了:', formData);
        
        const previewContent = this.generatePreviewHTML(formData);
            console.log('プレビューHTML生成完了');
            console.log('プレビューHTML（最初の200文字）:', previewContent.substring(0, 200));
            
            const previewModal = document.getElementById('previewModal');
            const previewContentDiv = document.getElementById('previewContent');
            
            console.log('previewModal要素:', previewModal);
            console.log('previewContentDiv要素:', previewContentDiv);
            
            if (previewContentDiv) {
                previewContentDiv.innerHTML = previewContent;
                console.log('プレビューコンテンツを設定しました');
            } else {
                console.error('previewContentDiv が見つかりません');
            }
            
            if (previewModal) {
                previewModal.style.display = 'block';
                console.log('プレビューモーダルを表示しました');
        } else {
                console.error('previewModal が見つかりません');
            }
            
            // プレビュー表示時はメール送信ボタンを非表示にする
            const sendEmailBtn = document.getElementById('sendEmailBtn');
            if (sendEmailBtn) {
                sendEmailBtn.style.display = 'none';
            }
            
            console.log('showPreview 処理完了');
            
        } catch (error) {
            console.error('showPreview でエラーが発生しました:', error);
            alert('プレビュー表示中にエラーが発生しました: ' + error.message);
        }
    }
    

    hidePreview() {
        const previewModal = document.getElementById('previewModal');
        if (previewModal) {
            previewModal.style.display = 'none';
        }
        
        // メール送信ボタンを非表示にする
        const sendEmailBtn = document.getElementById('sendEmailBtn');
        if (sendEmailBtn) {
            sendEmailBtn.style.display = 'none';
        }
    }

    getFormData() {
        const form = document.getElementById('orderForm');
        console.log('=== フォームデータ取得デバッグ ===');
        console.log('フォーム要素:', form);
        
        if (!form) {
            console.error('フォーム要素が見つかりません');
            return {};
        }
        
        const formData = new FormData(form);
        const data = {};
        
        console.log('FormData作成完了');
        
        // 基本情報
        for (let [key, value] of formData.entries()) {
            console.log(`フォームデータ: ${key} = ${value}`);
            if (key.endsWith('[]')) {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
            if (key === 'staffMember') {
                console.log('担当者データ取得:', JSON.stringify(value));
                console.log('担当者データの型:', typeof value);
                console.log('担当者データの長さ:', value ? value.length : 'undefined');
            }
        }
        
        console.log('取得されたデータ:', data);
        
        // 商品情報の空行を除外
        if (data['itemName[]']) {
            const validItems = [];
            const validProjectNames = [];
            const validQuantities = [];
            const validUnits = [];
            const validPrices = [];
            
            for (let i = 0; i < data['itemName[]'].length; i++) {
                const name = data['itemName[]'][i];
                const projectName = data['itemProjectName[]'] ? data['itemProjectName[]'][i] : '';
                const quantity = data['itemQuantity[]'][i];
                const unit = data['itemUnit[]'] ? data['itemUnit[]'][i] : '';
                const price = data['itemPrice[]'][i];
                
                // 商品名または発注工事件名のいずれかが入力されている場合は有効な行とする
                if (name.trim() || projectName.trim()) {
                    validItems.push(name);
                    validProjectNames.push(projectName);
                    validQuantities.push(quantity);
                    validUnits.push(unit);
                    validPrices.push(price);
                }
            }
            
            data['itemName[]'] = validItems;
            data['itemProjectName[]'] = validProjectNames;
            data['itemQuantity[]'] = validQuantities;
            data['itemUnit[]'] = validUnits;
            data['itemPrice[]'] = validPrices;
        }
        
        return data;
    }

    generatePreviewHTML(data) {
        const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        
        let itemsHTML = '';
        let subtotal = 0;
        
        if (data['itemName[]']) {
            for (let i = 0; i < data['itemName[]'].length; i++) {
                const name = data['itemName[]'][i];
                const projectName = data['itemProjectName[]'] ? data['itemProjectName[]'][i] : '';
                
                // 空行をスキップ
                if (!name.trim() && !projectName.trim()) {
                    continue;
                }
                
                const quantity = parseFloat(data['itemQuantity[]'][i]) || 0;
                const unit = data['itemUnit[]'] ? data['itemUnit[]'][i] : '';
                const price = parseFloat(data['itemPrice[]'][i]) || 0;
                const itemSubtotal = quantity * price;
                subtotal += itemSubtotal;
                
                itemsHTML += `
                    <tr>
                        <td>${projectName}</td>
                        <td>${name}</td>
                        <td>${quantity}</td>
                        <td>${unit}</td>
                        <td>¥${price.toLocaleString()}</td>
                        <td>¥${itemSubtotal.toLocaleString()}</td>
                    </tr>
                `;
            }
        }
        
        const tax = Math.ceil(subtotal * 0.1); // 10%の消費税（小数点切り上げ）
        const total = subtotal + tax;
        
        return `
            <div class="order-preview">
                <div class="pdf-header">
                    <div class="header-main">
                        <div class="company-brand">
                            <div class="logo-section">
                                <img src="logo.png" alt="株式会社諸鹿彩色" class="header-logo" onload="this.nextElementSibling.style.display='none';" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="header-logo-fallback">
                                    <div class="header-logo-icon">M</div>
                                    <div class="header-logo-text">MOROGA</div>
                                </div>
                            </div>
                            <div class="company-details">
                                <h1 class="company-name">株式会社諸鹿彩色</h1>
                                <div class="company-contact">
                                    <span class="address">〒321-0111 栃木県宇都宮市川田町1048-5</span>
                                    <span class="contact-info">TEL: 028-688-8618 | Email: info@moroga.info</span>
                                </div>
                            </div>
                        </div>
                        <div class="document-header">
                            <h2 class="document-title">発注書</h2>
                            <div class="document-subtitle">ORDER FORM</div>
                        </div>
                    </div>
                    
                    <div class="order-info-section">
                        <div class="info-grid">
                            <div class="info-item date-item">
                                <span class="info-icon">📅</span>
                                <div class="info-content">
                                    <span class="info-label">発注日</span>
                                    <span class="info-value">${data.orderDate}</span>
                                </div>
                            </div>
                            <div class="info-item completion-item">
                                <span class="info-icon">🏗️</span>
                                <div class="info-content">
                                    <span class="info-label">工事完了予定</span>
                                    <span class="info-value">${data.completionMonth || '別途調整'}</span>
                                </div>
                            </div>
                            <div class="info-item payment-item">
                                <span class="info-icon">💰</span>
                                <div class="info-content">
                                    <span class="info-label">支払条件</span>
                                    <span class="info-value">${data.paymentTerms}</span>
                                </div>
                            </div>
                            <div class="info-item staff-item">
                                <span class="info-icon">👤</span>
                                <div class="info-content">
                                    <span class="info-label">担当者</span>
                                    <span class="info-value">${data.staffMember || '未設定'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="supplier-section">
                    <h3>発注先</h3>
                    <div class="supplier-info">
                        <p><strong>${data.supplierName}</strong></p>
                        <p>${data.supplierAddress}</p>
                        ${data.contactPerson ? `<p>担当者: ${data.contactPerson}</p>` : ''}
                    </div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                                <th>工事名</th>
                            <th>商品名</th>
                            <th>数量</th>
                            <th>単位</th>
                            <th>単価（円）</th>
                            <th>小計（円）</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <div class="total-row">
                        <span>小計:</span>
                        <span>¥${subtotal.toLocaleString()}</span>
                    </div>
                    <div class="total-row">
                        <span>消費税 (10%):</span>
                        <span>¥${tax.toLocaleString()}</span>
                    </div>
                    <div class="total-row total-final">
                        <span><strong>合計金額:</strong></span>
                        <span><strong>¥${total.toLocaleString()}</strong></span>
                    </div>
                </div>
                
                ${data.remarks ? `
                    <div class="remarks">
                        <h3>備考</h3>
                        <p>${data.remarks}</p>
                    </div>
                ` : ''}
                
                <div class="pdf-footer">
                    <div class="footer-content">
                        <div class="footer-logo">
                            <img src="logo.png" alt="株式会社諸鹿彩色" class="footer-logo-img" onload="this.nextElementSibling.style.display='none';" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="footer-logo-fallback">
                                <div class="footer-logo-icon">M</div>
                            </div>
                        </div>
                        <div class="footer-info">
                            <p class="footer-thanks">この度はお取引いただき、誠にありがとうございます。</p>
                            <p class="footer-company">株式会社諸鹿彩色</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async generatePDF() {
        const generateBtn = document.getElementById('generatePdfBtn');
        const originalText = generateBtn.textContent;
        
        try {
            generateBtn.textContent = 'PDF生成中...';
            generateBtn.classList.add('loading');
            generateBtn.disabled = true;
            
            // プレビューを表示してからPDF生成
            this.showPreview();
            await new Promise(resolve => setTimeout(resolve, 1000)); // プレビュー表示を待つ
            
            const previewElement = document.getElementById('previewContent');
            const contentElement = previewElement.querySelector('.order-preview') || previewElement;
            
            // jsPDFライブラリの確認
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDFライブラリが読み込まれていません');
            }
            
            // html2canvasライブラリの確認
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvasライブラリが読み込まれていません');
            }
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // プレビュー要素（発注書本体）のみをキャプチャ
            const canvas = await html2canvas(contentElement, {
                scale: 2, // 高解像度でキャプチャ
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: contentElement.scrollWidth,
                height: contentElement.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 1200,
                windowHeight: 800
            });
            
            console.log('Canvas size:', canvas.width, 'x', canvas.height);
            
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
            
            // 画像サイズをA4にフィット（余白ありで完全収まるように調整）
            const margin = 10; // mm（上下左右）
            let imgWidth = pageWidth - margin * 2;
            let imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (imgHeight > pageHeight - margin * 2) {
                imgHeight = pageHeight - margin * 2;
                imgWidth = (canvas.width * imgHeight) / canvas.height;
            }
            
            console.log('PDF image size:', imgWidth, 'x', imgHeight);
            
            // 中央揃えのためのX位置計算
            const xPosition = (pageWidth - imgWidth) / 2;
            
            const yPosition = (pageHeight - imgHeight) / 2; // 縦方向も中央寄せ（上下に余白）

            // 1ページにフィットして配置（はみ出しなし）
            pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
            
            // PDF保存
            const fileName = `発注書_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            console.log('PDF生成完了:', fileName);
            
            // PDF生成成功時にメール送信ボタンを表示
            const sendEmailBtn = document.getElementById('sendEmailBtn');
            if (sendEmailBtn) {
                sendEmailBtn.style.display = 'block';
                // 生成されたPDFデータを保存
                this.lastGeneratedPDF = {
                    data: imgData,
                    fileName: fileName,
                    blob: new Blob([pdf.output('blob')], { type: 'application/pdf' })
                };
            }
            
        } catch (error) {
            console.error('PDF生成エラー:', error);
            alert('PDF生成中にエラーが発生しました: ' + error.message + '\n\n詳細はコンソールを確認してください。');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    }

    // 高品質PDF生成（最高品質設定）
    async generateHighQualityPDF() {
        const generateBtn = document.getElementById('generateHighQualityPdfBtn');
        const originalText = generateBtn.textContent;
        
        try {
            generateBtn.textContent = '高品質PDF生成中...';
            generateBtn.classList.add('loading');
            generateBtn.disabled = true;
            
            // プレビューを表示してからPDF生成
            this.showPreview();
            await new Promise(resolve => setTimeout(resolve, 1500)); // より長く待つ
            
            const previewElement = document.getElementById('previewContent');
            const contentElement = previewElement.querySelector('.order-preview') || previewElement;
            
            // ライブラリの確認
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDFライブラリが読み込まれていません');
            }
            
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvasライブラリが読み込まれていません');
            }
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // 最高品質設定でhtml2canvasを実行
            const canvas = await html2canvas(contentElement, {
                scale: 3.0, // 最高解像度
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: contentElement.scrollWidth,
                height: contentElement.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 1600, // より大きなウィンドウサイズ
                windowHeight: 1200,
                logging: false,
                imageTimeout: 20000,
                removeContainer: true,
                foreignObjectRendering: true // より高品質なレンダリング
            });
            
            console.log('高品質Canvas size:', canvas.width, 'x', canvas.height);
            
            // 最高品質で画像データを取得
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
            
            // 画像サイズをA4に最適化
            const margin = 8; // 最小マージン
            let imgWidth = pageWidth - margin * 2;
            let imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (imgHeight > pageHeight - margin * 2) {
                imgHeight = pageHeight - margin * 2;
                imgWidth = (canvas.width * imgHeight) / canvas.height;
            }
            
            console.log('高品質PDF image size:', imgWidth, 'x', imgHeight);
            
            // 中央配置
            const xPosition = (pageWidth - imgWidth) / 2;
            const yPosition = (pageHeight - imgHeight) / 2;

            // 複数ページ対応（高品質）
            if (imgHeight > pageHeight - margin * 2) {
                const totalPages = Math.ceil(imgHeight / (pageHeight - margin * 2));
                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) pdf.addPage();
                    const yOffset = yPosition - (i * (pageHeight - margin * 2));
                    pdf.addImage(imgData, 'PNG', xPosition, yOffset, imgWidth, imgHeight);
                }
            } else {
                pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
            }
            
            // PDF保存
            const fileName = `発注書_最高品質_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            console.log('高品質PDF生成完了:', fileName);
            
        } catch (error) {
            console.error('高品質PDF生成エラー:', error);
            alert('高品質PDF生成中にエラーが発生しました: ' + error.message + '\n\n詳細はコンソールを確認してください。');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    }

    // ブラウザ印刷PDF（最高品質）
    printPDF() {
        try {
            // プレビューを表示
            this.showPreview();
            
            // 少し待ってから印刷ダイアログを開く
            setTimeout(() => {
                // 印刷用のスタイルを一時的に適用
                const printStyle = document.createElement('style');
                printStyle.textContent = `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #previewArea, #previewArea * {
                            visibility: visible;
                        }
                        #previewArea {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .order-preview {
                            width: 100% !important;
                            max-width: none !important;
                            margin: 0 !important;
                            padding: 20px !important;
                            box-shadow: none !important;
                            border: none !important;
                        }
                    }
                `;
                document.head.appendChild(printStyle);
                
                // 印刷ダイアログを開く
                window.print();
                
                // 印刷後、スタイルを削除
                setTimeout(() => {
                    document.head.removeChild(printStyle);
                }, 1000);
            }, 500);
            
        } catch (error) {
            console.error('印刷エラー:', error);
            alert('印刷中にエラーが発生しました: ' + error.message);
        }
    }







    resetForm() {
        if (confirm('フォームをリセットしますか？入力したデータは失われます。')) {
            document.getElementById('orderForm').reset();
            this.setDefaultDate();
            
            // 商品行を1つだけ残す
            const container = document.getElementById('itemsContainer');
            container.innerHTML = `
                <div class="item-row">
                    <div class="form-group">
                        <label>工事名</label>
                        <input type="text" name="itemProjectName[]" required>
                    </div>
                    <div class="form-group">
                        <label>商品名</label>
                        <input type="text" name="itemName[]" required>
                    </div>
                    <div class="form-group">
                        <label>数量</label>
                        <input type="number" name="itemQuantity[]" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>単位</label>
                        <input type="text" name="itemUnit[]" placeholder="個、台、kg等">
                    </div>
                    <div class="form-group">
                        <label>単価（円）</label>
                        <input type="number" name="itemPrice[]" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>小計（円）</label>
                        <input type="number" name="itemSubtotal[]" readonly>
                    </div>
                    <div class="form-group">
                        <button type="button" class="remove-item-btn" onclick="removeItem(this)">削除</button>
                    </div>
                </div>
            `;
            
            this.calculateTotals();
            this.hidePreview();
        }
    }



    // 成功メッセージ表示
    showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                z-index: 10000;
                font-weight: 600;
                animation: slideInRight 0.3s ease;
            ">
                ✅ ${message}
            </div>
        `;
        
        document.body.appendChild(messageDiv);
        
        // 3秒後に自動削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // エラーメッセージ表示
    showErrorMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'error-message';
        messageDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #dc3545, #c82333);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
                z-index: 10000;
                font-weight: 600;
                animation: slideInRight 0.3s ease;
            ">
                ❌ ${message}
            </div>
        `;
        
        document.body.appendChild(messageDiv);
        
        // 5秒後に自動削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    // 発注書データをLocalStorageに保存
    saveOrderToStorage(formData) {
        try {
            console.log('=== saveOrderToStorage ===');
            console.log('保存するフォームデータ:', formData);
            console.log('フォームデータの型:', typeof formData);
            console.log('フォームデータのキー:', Object.keys(formData));
            
            // 既存の発注書データを取得
            const existingOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
            console.log('既存の発注書数:', existingOrders.length);
            console.log('既存の発注書データ:', existingOrders);
            
            // 新しい発注書IDを生成
            const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // 発注書データを構築
            const orderData = {
                id: orderId,
                orderDate: formData.orderDate || new Date().toISOString().split('T')[0],
                companyName: formData.companyName || '',
                companyAddress: formData.companyAddress || '',
                companyPhone: formData.companyPhone || '',
                companyEmail: formData.companyEmail || '',
                staffMember: formData.staffMember || '',
                supplierName: formData.supplierName || '',
                supplierAddress: formData.supplierAddress || '',
                contactPerson: formData.contactPerson || '',
                items: this.buildItemsArray(formData),
                subtotal: this.calculateSubtotal(formData),
                tax: this.calculateTax(formData),
                total: this.calculateTotal(formData),
                remarks: formData.remarks || '',
                createdAt: new Date().toISOString()
            };
            
            console.log('構築された発注書データ:', orderData);
            
            // 発注書を追加
            existingOrders.push(orderData);
            
            // LocalStorageに保存
            localStorage.setItem('purchaseOrders', JSON.stringify(existingOrders));
            
            console.log('発注書保存完了 - ID:', orderId);
            console.log('保存後の発注書数:', existingOrders.length);
            
            // 保存後のデータを確認
            const savedData = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
            console.log('保存後の全データ:', savedData);
            
            return orderId;
            
        } catch (error) {
            console.error('発注書保存エラー:', error);
            return null;
        }
    }
    
    // 商品配列を構築
    buildItemsArray(formData) {
        console.log('=== buildItemsArray ===');
        console.log('フォームデータ:', formData);
        
        const items = [];
        const projectNames = formData['itemProjectName[]'] || [];
        const itemNames = formData['itemName[]'] || [];
        const quantities = formData['itemQuantity[]'] || [];
        const units = formData['itemUnit[]'] || [];
        const prices = formData['itemPrice[]'] || [];
        
        console.log('商品データ:');
        console.log('- 工事件名:', projectNames);
        console.log('- 商品名:', itemNames);
        console.log('- 数量:', quantities);
        console.log('- 単位:', units);
        console.log('- 単価:', prices);
        
        const maxLength = Math.max(
            projectNames.length,
            itemNames.length,
            quantities.length,
            units.length,
            prices.length
        );
        
        for (let i = 0; i < maxLength; i++) {
            const projectName = projectNames[i] || '';
            const itemName = itemNames[i] || '';
            const quantity = parseFloat(quantities[i]) || 0;
            const unit = units[i] || '';
            const price = parseFloat(prices[i]) || 0;
            
            // 空の行はスキップ
            if (itemName.trim() || quantity > 0 || price > 0) {
                items.push({
                    projectName: projectName,
                    name: itemName,
                    quantity: quantity,
                    unit: unit,
                    unitPrice: price,
                    subtotal: quantity * price
                });
            }
        }
        
        return items;
    }
    
    // 小計を計算
    calculateSubtotal(formData) {
        const items = this.buildItemsArray(formData);
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    }
    
    // 消費税を計算
    calculateTax(formData) {
        const subtotal = this.calculateSubtotal(formData);
        return Math.ceil(subtotal * 0.1); // 10%の消費税（小数点切り上げ）
    }
    
    // 合計を計算
    calculateTotal(formData) {
        const subtotal = this.calculateSubtotal(formData);
        const tax = this.calculateTax(formData);
        return subtotal + tax;
    }

    // 管理ページモーダル表示
    showManagementPageModal() {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'management-modal';
        modalDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                ">
                    <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.5rem;">
                        ✅ 発注書を登録しました！
                    </h3>
                    <p style="margin: 0 0 25px 0; color: #666; font-size: 1.1rem;">
                        発注書管理ページで確認しますか？
                    </p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="openManagementBtn" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            border: none;
                            padding: 12px 25px;
                            border-radius: 25px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        ">📋 管理ページを開く</button>
                        <button id="closeModalBtn" style="
                            background: #6c757d;
                            color: white;
                            border: none;
                            padding: 12px 25px;
                            border-radius: 25px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        ">閉じる</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalDiv);
        
        // ボタンのイベントリスナーを設定
        const openBtn = modalDiv.querySelector('#openManagementBtn');
        const closeBtn = modalDiv.querySelector('#closeModalBtn');
        
        openBtn.addEventListener('click', () => {
            window.open('management.html', '_blank');
            document.body.removeChild(modalDiv);
        });
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modalDiv);
        });
        
        // 背景クリックで閉じる
        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv.querySelector('div')) {
                document.body.removeChild(modalDiv);
            }
        });
    }

    // メール送信機能
    async sendPDFByEmail() {
        try {
            console.log('メール送信機能を開始');
            
            // PDF生成チェック
            if (!this.lastGeneratedPDF) {
                alert('先にPDFを生成してください。\n「PDF生成」ボタンをクリックしてからメール送信を行ってください。');
                return;
            }
            
            const data = this.getFormData();
            
            // メール件名と本文を作成
            const supplierName = data.supplierName || '発注先未入力';
            const subject = encodeURIComponent(`【発注書】${supplierName} 様 - ${data.orderDate}`);
            const body = encodeURIComponent(`${supplierName} 様

いつもお世話になっております。
株式会社諸鹿彩色です。

添付の発注書をご確認いただき、工事のお手配をお願いいたします。

【発注内容】
発注先: ${supplierName}
発注日: ${data.orderDate}
工事完了予定: ${data.completionMonth || '別途調整'}
支払条件: ${data.paymentTerms}

ご不明な点がございましたら、お気軽にお問い合わせください。
よろしくお願いいたします。

────────────────────────
株式会社諸鹿彩色
${data.staffMember ? '担当: ' + data.staffMember : ''}
〒321-0111 栃木県宇都宮市川田町1048-5
TEL: 028-688-8618
Email: info@moroga.info
────────────────────────`);

            // メーラーを起動
            const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
            window.open(mailtoLink);
            
            console.log('メーラーを起動しました');
            alert('メーラーが起動されました。\n生成されたPDFファイルを手動で添付してください。');
            
        } catch (error) {
            console.error('メール送信エラー:', error);
            alert('メール送信中にエラーが発生しました: ' + error.message);
        }
    }

    // 全ての行の小計を強制的に計算
    forceCalculateAllSubtotals() {
        console.log('=== 全ての小計を強制計算 ===');
        const rows = document.querySelectorAll('.item-row');
        console.log('見つかった商品行数:', rows.length);
        
        rows.forEach((row, index) => {
            console.log(`行 ${index + 1} の小計計算中...`);
            
            const quantityInput = row.querySelector('input[name="itemQuantity[]"]');
            const priceInput = row.querySelector('input[name="itemPrice[]"]');
            const subtotalInput = row.querySelector('input[name="itemSubtotal[]"]');
            
            if (quantityInput && priceInput && subtotalInput) {
                const quantity = parseFloat(quantityInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const subtotal = quantity * price;
                
                console.log(`行 ${index + 1}:`, { quantity, price, subtotal });
                
                if (subtotal > 0) {
                    subtotalInput.value = Math.floor(subtotal);
                    console.log(`行 ${index + 1} 小計設定:`, Math.floor(subtotal));
                }
            } else {
                console.log(`行 ${index + 1}: input要素が見つかりません`);
            }
        });
        
        // 合計も再計算
        this.calculateTotals();
        console.log('=== 強制計算完了 ===');
    }

    // 次のフィールドに移動
    moveToNextField(currentField) {
        const row = currentField.closest('.item-row');
        if (!row) return;

        // 現在の行内でのフィールド順序を定義
        const fieldOrder = [
            'input[name="itemProjectName[]"]',  // 工事名
            'input[name="itemName[]"]',         // 商品名
            'input[name="itemQuantity[]"]',     // 数量
            'input[name="itemUnit[]"]',         // 単位
            'input[name="itemPrice[]"]'         // 単価
            // 小計は readonly なのでスキップ
        ];

        // 現在のフィールドのインデックスを取得
        let currentIndex = -1;
        for (let i = 0; i < fieldOrder.length; i++) {
            const field = row.querySelector(fieldOrder[i]);
            if (field === currentField) {
                currentIndex = i;
                break;
            }
        }

        // 次のフィールドに移動
        if (currentIndex >= 0 && currentIndex < fieldOrder.length - 1) {
            const nextField = row.querySelector(fieldOrder[currentIndex + 1]);
            if (nextField) {
                nextField.focus();
                nextField.select(); // 既存の内容を選択
                console.log('次のフィールドに移動:', fieldOrder[currentIndex + 1]);
            }
        } else if (currentIndex === fieldOrder.length - 1) {
            // 最後のフィールド（単価）の場合、次の行の最初のフィールドに移動
            this.moveToNextRow(row);
        }
    }

    // 次の行に移動
    moveToNextRow(currentRow) {
        const container = document.getElementById('itemsContainer');
        const rows = container.querySelectorAll('.item-row');
        
        let currentIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i] === currentRow) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex >= 0 && currentIndex < rows.length - 1) {
            // 次の行が存在する場合
            const nextRow = rows[currentIndex + 1];
            const firstField = nextRow.querySelector('input[name="itemProjectName[]"]');
            if (firstField) {
                firstField.focus();
                firstField.select();
                console.log('次の行に移動');
            }
        } else {
            // 最後の行の場合、新しい行を追加
            this.addItemRow();
            setTimeout(() => {
                const newRows = container.querySelectorAll('.item-row');
                const newRow = newRows[newRows.length - 1];
                const firstField = newRow.querySelector('input[name="itemProjectName[]"]');
                if (firstField) {
                    firstField.focus();
                    console.log('新しい行を追加して移動');
                }
            }, 100);
        }
    }
}

// グローバル関数（HTMLから呼び出される）
function removeItem(button) {
    const manager = window.orderFormManager;
    if (manager) {
        manager.removeItemRow(button);
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - 初期化開始');
    
    // プレビューボタンの存在確認
    const previewBtn = document.getElementById('previewBtn');
    console.log('DOMContentLoaded時点でのプレビューボタン:', previewBtn);
    
    try {
        window.orderFormManager = new OrderFormManager();
        console.log('OrderFormManager 初期化完了');
        
        // 初期化後にもう一度ボタンを確認
        setTimeout(() => {
            const previewBtnAfter = document.getElementById('previewBtn');
            console.log('初期化後のプレビューボタン:', previewBtnAfter);
            if (previewBtnAfter && !previewBtnAfter.onclick) {
                console.log('手動でプレビューボタンにイベントを追加');
                previewBtnAfter.addEventListener('click', () => {
                    console.log('手動イベント: プレビューボタンクリック');
                    if (window.orderFormManager) {
                        window.orderFormManager.showPreview();
                    }
                });
            }
        }, 500);
        
    } catch (error) {
        console.error('OrderFormManager 初期化エラー:', error);
        alert('システム初期化エラー: ' + error.message);
    }
});

// フォールバック: ページ読み込み完了後にも初期化を試行
window.addEventListener('load', () => {
    console.log('window.load - フォールバック初期化');
    if (!window.orderFormManager) {
        try {
            window.orderFormManager = new OrderFormManager();
            console.log('フォールバック初期化完了');
        } catch (error) {
            console.error('フォールバック初期化エラー:', error);
        }
    }
});

// フォームバリデーション
document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('プレビューまたはPDF生成ボタンを使用してください。');
});

// エクスポート（必要に応じて）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrderFormManager;
}
