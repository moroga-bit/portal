// シンプルなテスト用スクリプト
console.log('テストスクリプト開始');

// 小計計算機能のテスト
function testCalculation() {
    console.log('小計計算テスト開始');
    
    const rows = document.querySelectorAll('.item-row');
    console.log('商品行数:', rows.length);
    
    rows.forEach((row, index) => {
        const quantityInput = row.querySelector('input[name="itemQuantity[]"]');
        const priceInput = row.querySelector('input[name="itemPrice[]"]');
        const subtotalInput = row.querySelector('input[name="itemSubtotal[]"]');
        
        if (quantityInput && priceInput && subtotalInput) {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const subtotal = quantity * price;
            
            console.log(`行${index + 1}:`, { quantity, price, subtotal });
            
            if (subtotal > 0) {
                subtotalInput.value = subtotal;
                console.log(`行${index + 1} 小計設定: ${subtotal}`);
            }
        }
    });
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - テストスクリプト初期化');
    
    // 数量・単価変更時の計算
    document.addEventListener('input', (e) => {
        if (e.target.name === 'itemQuantity[]' || e.target.name === 'itemPrice[]') {
            console.log('入力変更:', e.target.name, e.target.value);
            
            const row = e.target.closest('.item-row');
            if (row) {
                const quantityInput = row.querySelector('input[name="itemQuantity[]"]');
                const priceInput = row.querySelector('input[name="itemPrice[]"]');
                const subtotalInput = row.querySelector('input[name="itemSubtotal[]"]');
                
                if (quantityInput && priceInput && subtotalInput) {
                    const quantity = parseFloat(quantityInput.value) || 0;
                    const price = parseFloat(priceInput.value) || 0;
                    const subtotal = quantity * price;
                    
                    console.log('計算結果:', { quantity, price, subtotal });
                    subtotalInput.value = subtotal;
                }
            }
        }
    });
    
    // グローバル関数として公開
    window.testCalculation = testCalculation;
    
    console.log('テストスクリプト初期化完了');
});
