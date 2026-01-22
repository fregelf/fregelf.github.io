document.addEventListener('DOMContentLoaded', () => {
    
    // --- Config & State ---
    const IDS = ['in-name', 'in-id', 'in-branch', 'in-rank', 'in-position', 'in-bio', 'in-signer'];
    let currentProfileImage = null;

    // --- Init ---
    initDate();
    setupEventListeners();
    console.log("FMPR System v7.1 [FINAL_FIX] Loaded");

    function initDate() {
        const d = new Date();
        const svDate = d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
        const dateEl = document.getElementById('out-date');
        if(dateEl) dateEl.innerText = `Datum: ${svDate}`;
    }

    function setupEventListeners() {
        IDS.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', updatePreview);
        });

        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('in-image');
        if(dropArea && fileInput) {
            dropArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => handleImage(e.target.files[0]));
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
                dropArea.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); });
            });
            dropArea.addEventListener('drop', (e) => handleImage(e.dataTransfer.files[0]));
        }

        document.getElementById('download-btn')?.addEventListener('click', generatePDF_Final);
        document.getElementById('save-json')?.addEventListener('click', saveData);
        document.getElementById('load-json-trigger')?.addEventListener('click', () => document.getElementById('load-json-input').click());
        document.getElementById('load-json-input')?.addEventListener('change', loadData);
    }

    function updatePreview() {
        const getVal = (id) => document.getElementById(id)?.value || "";
        const setTxt = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };

        setTxt('out-name', getVal('in-name') || 'NAMN / 氏名');
        setTxt('out-id', getVal('in-id') || 'FM-0000-000');
        setTxt('out-branch', document.getElementById('in-branch')?.value || "");
        
        const rank = getVal('in-rank');
        const pos = getVal('in-position');
        setTxt('out-rank-pos', (rank || pos) ? `${rank} / ${pos}` : "---");
        setTxt('out-bio', getVal('in-bio') || '...');
        setTxt('out-signature', getVal('in-signer'));
    }

    function handleImage(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentProfileImage = e.target.result;
            const photoBox = document.getElementById('out-photo');
            if(photoBox) photoBox.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
            showToast('FOTO UPPLADDAT', 'success');
        };
        reader.readAsDataURL(file);
    }

    // --- 【最終解決】見切れ・座標ズレ完全修正エンジン ---
    async function generatePDF_Final() {
        const btn = document.getElementById('download-btn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GENERERAR...';

        let container = null;

        try {
            // 1. スクロールをトップに戻す（撮影範囲のズレを防止）
            window.scrollTo(0, 0);

            const source = document.getElementById('pdf-content');
            
            // 2. クローン作成と「左上ピッタリ」配置
            // 画面の裏側(z-index -1)の(0,0)に固定配置することで見切れを回避
            container = document.createElement('div');
            Object.assign(container.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '210mm',
                height: '297mm',
                zIndex: '-1', 
                opacity: '0.99', // 0だと描画されないブラウザがあるため
                background: '#fff'
            });

            const clone = source.cloneNode(true);
            Object.assign(clone.style, {
                margin: '0',
                padding: '0',
                transform: 'none',
                width: '210mm',
                height: '296.8mm',
                boxShadow: 'none'
            });

            container.appendChild(clone);
            document.body.appendChild(container);

            // 3. 画像のロードを完全に待つ
            const imgs = Array.from(clone.querySelectorAll('img'));
            await Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(res => { img.onload = res; img.onerror = res; });
            }));

            // 安定化のための僅かな待機
            await new Promise(r => setTimeout(r, 400));

            // 4. html2pdf設定（x, y座標を0に固定するのがコツ）
            const opt = {
                margin: 0,
                filename: `Personakt_${document.getElementById('in-id')?.value || 'DOC'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    scrollY: 0,
                    scrollX: 0,
                    x: 0,
                    y: 0,
                    width: 794, // A4の約96dpi相当幅
                    windowWidth: 794
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // 5. 実行
            await html2pdf().set(opt).from(clone).save();
            showToast('PDF EXPORTERAD', 'success');

        } catch (e) {
            console.error(e);
            showToast('EXPORT FEL', 'error');
        } finally {
            if (container) document.body.removeChild(container);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // --- Data Management ---
    function saveData() {
        const data = {};
        IDS.forEach(id => { data[id] = document.getElementById(id)?.value; });
        data.image = currentProfileImage;
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `FMPR_DATA.json`;
        a.click();
        showToast('DATA SPARAD', 'success');
    }

    function loadData(e) {
        const file = e.target.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = (ev) => {
            const d = JSON.parse(ev.target.result);
            IDS.forEach(id => { if(d[id] !== undefined) document.getElementById(id).value = d[id]; });
            if(d.image) {
                currentProfileImage = d.image;
                document.getElementById('out-photo').innerHTML = `<img src="${d.image}" style="width:100%;height:100%;object-fit:cover;">`;
            }
            updatePreview();
            showToast('DATA LADDAD', 'success');
        };
        r.readAsText(file);
    }

    function showToast(msg, type) {
        const container = document.getElementById('toast-container');
        if(!container) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerText = msg;
        container.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000);
    }
});
