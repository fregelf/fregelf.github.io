document.addEventListener('DOMContentLoaded', () => {
    
    // --- Config & State ---
    const IDS = ['in-name', 'in-id', 'in-branch', 'in-rank', 'in-position', 'in-bio', 'in-signer'];
    const currentData = { image: null };

    // --- Init ---
    initDate();
    setupEventListeners();
    showToast('System Redo... v7.0 Ready', 'normal');

    // --- Functions ---

    function initDate() {
        const d = new Date();
        const svDate = d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('out-date').innerText = `Datum: ${svDate}`;
    }

    function setupEventListeners() {
        // Text Inputs Sync
        IDS.forEach(id => {
            document.getElementById(id).addEventListener('input', updatePreview);
        });

        // Image Drop Area
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('in-image');

        dropArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleImage(e.target.files[0]));

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.style.borderColor = '#5e81ac', false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.style.borderColor = '#30363d', false);
        });

        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleImage(files[0]);
        }, false);

        // Buttons
        document.getElementById('download-btn').addEventListener('click', generatePDF);
        document.getElementById('save-json').addEventListener('click', saveData);
        document.getElementById('load-json-trigger').addEventListener('click', () => document.getElementById('load-json-input').click());
        document.getElementById('load-json-input').addEventListener('change', loadData);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function updatePreview() {
        document.getElementById('out-name').innerText = document.getElementById('in-name').value || "NAMN / 氏名";
        document.getElementById('out-id').innerText = document.getElementById('in-id').value || "FM-0000-000";
        document.getElementById('out-branch').innerText = document.getElementById('in-branch').value;
        const rank = document.getElementById('in-rank').value || "";
        const pos = document.getElementById('in-position').value || "";
        document.getElementById('out-rank-pos').innerText = rank || pos ? `${rank} / ${pos}` : "---";
        document.getElementById('out-bio').innerText = document.getElementById('in-bio').value || "Ingen information tillgänglig...";
        document.getElementById('out-signature').innerText = document.getElementById('in-signer').value;
    }

    function handleImage(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentData.image = e.target.result;
            const imgHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
            document.getElementById('out-photo').innerHTML = imgHTML;
            showToast('Foto uppladdat / 写真を反映しました', 'success');
        };
        reader.readAsDataURL(file);
    }

    // --- PDF GENERATION ENGINE (GOLD VERSION) ---
    async function generatePDF() {
        const btn = document.getElementById('download-btn');
        const originalText = btn.innerHTML;
        
        // UI Feedback
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GENERERAR...';
        showToast('Startar export... / 出力処理を開始', 'normal');

        try {
            const element = document.getElementById('pdf-content');

            // 1. Create Clean Clone
            // 見えない場所にクローンを作成し、完全に制御された環境でレンダリングする
            const clone = element.cloneNode(true);
            Object.assign(clone.style, {
                position: 'fixed',
                top: '0', left: '0',
                width: '210mm',
                height: '296.8mm',
                margin: '0',
                zIndex: '-9999',
                visibility: 'visible', // 描画させる
                transform: 'none', // スマホ用の縮小などを解除
                boxShadow: 'none'
            });
            document.body.appendChild(clone);

            // 2. Wait for Images (Local Logo & User Photo)
            // ローカルロゴ(/img/logo.png)も含めてロード完了を待つ
            const images = Array.from(clone.querySelectorAll('img'));
            await Promise.all(images.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = () => {
                        console.warn('Image failed to load:', img.src);
                        resolve(); // エラーでも止まらない
                    };
                });
            }));

            // 3. Render Settings
            const filename = `Personakt_${document.getElementById('in-id').value || 'New'}.pdf`;
            const opt = {
                margin: 0,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, // Retina品質
                    useCORS: true, // ローカルでもTrue推奨
                    scrollY: 0,
                    scrollX: 0,
                    letterRendering: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // 4. Save
            await html2pdf().set(opt).from(clone).save();
            showToast('PDF Export Slutförd / 出力完了', 'success');

        } catch (error) {
            console.error(error);
            showToast('Fel vid export / エラーが発生しました', 'error');
        } finally {
            // Cleanup
            const clone = document.body.querySelector('.document-sheet[style*="z-index: -9999"]');
            if(clone) document.body.removeChild(clone);
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // --- Data Management ---
    function saveData() {
        const data = {};
        IDS.forEach(id => data[id] = document.getElementById(id).value);
        data.image = currentData.image;
        
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `FMPR_Backup_${document.getElementById('in-id').value}.json`;
        a.click();
        showToast('Data sparad / データを保存しました', 'success');
    }

    function loadData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                IDS.forEach(id => {
                    if (data[id] !== undefined) document.getElementById(id).value = data[id];
                });
                if (data.image) {
                    currentData.image = data.image;
                    document.getElementById('out-photo').innerHTML = `<img src="${data.image}" style="width:100%;height:100%;object-fit:cover;">`;
                }
                updatePreview();
                showToast('Data laddad / データを読み込みました', 'success');
            } catch(err) {
                showToast('Filformatet är felaktigt / ファイル形式エラー', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    }

    // --- Toast Notification ---
    function showToast(msg, type = 'normal') {
        const container = document.getElementById('toast-container');
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        
        let icon = '<i class="fas fa-info-circle"></i>';
        if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
        if (type === 'error') icon = '<i class="fas fa-exclamation-triangle"></i>';

        el.innerHTML = `${icon} <span>${msg}</span>`;
        container.appendChild(el);
        
        setTimeout(() => {
            el.style.animation = 'slideIn 0.3s reverse forwards';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }
});
