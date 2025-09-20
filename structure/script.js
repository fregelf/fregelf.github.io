document.addEventListener('DOMContentLoaded', () => {
    // 構造物のデータ
    const structures = [
        {
            name: "F-15 イーグル戦闘機",
            description: "高い機動性を持つ単座式戦闘機です。",
            image: "images/f15.png",
            category: "fighter",
            file: "files/f15_eagle.mcstructure"
        },
        {
            name: "C-130 ハーキュリーズ輸送機",
            description: "物資や人員を運ぶための大型輸送機です。",
            image: "images/c130.png",
            category: "transport",
            file: "files/c130_hercules.mcstructure"
        },
        {
            name: "M1 エイブラムス戦車",
            description: "分厚い装甲と強力な主砲を持つ主力戦車です。",
            image: "images/m1_abrams.png",
            category: "tank",
            file: "files/m1_abrams.mcstructure"
        },
        {
            name: "ボーイング 747 旅客機",
            description: "二階建ての大型旅客機です。",
            image: "images/b747.png",
            category: "transport",
            file: "files/boeing747.mcstructure"
        },
        {
            name: "F-22 ラプター戦闘機",
            description: "高いステルス性を持つ最新鋭の戦闘機です。",
            image: "images/f22.png",
            category: "fighter",
            file: "files/f22_raptor.mcstructure"
        },
        // 新しいカテゴリのサンプルデータ
        {
            name: "駆逐艦",
            description: "小型で高速の軍艦です。",
            image: "images/destroyer.png",
            category: "vessel",
            file: "files/destroyer.mcstructure"
        },
        {
            name: "装甲車",
            description: "人員輸送用の装甲車両です。",
            image: "images/armored_car.png",
            category: "vehicle",
            file: "files/armored_car.mcstructure"
        }
    ];

    const structuresGrid = document.getElementById('structures');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const noResultsMessage = document.getElementById('no-results-message');

    // 構造物カードを作成する関数
    const createStructureCard = (structure) => {
        const card = document.createElement('div');
        card.className = 'structure-card';
        card.dataset.category = structure.category;

        const html = `
            <img src="${structure.image}" alt="${structure.name}" class="card-image">
            <div class="card-content">
                <h3>${structure.name}</h3>
                <p>${structure.description}</p>
                <a href="${structure.file}" class="download-link" download>ダウンロード</a>
            </div>
        `;
        card.innerHTML = html;
        structuresGrid.appendChild(card);
    };

    // 全ての構造物を表示
    const displayStructures = (category) => {
        structuresGrid.innerHTML = ''; // グリッドをクリア
        const filteredStructures = structures.filter(structure => 
            category === 'all' || structure.category === category
        );

        if (filteredStructures.length > 0) {
            noResultsMessage.classList.add('hidden');
            filteredStructures.forEach(createStructureCard);
        } else {
            noResultsMessage.classList.remove('hidden');
        }
    };

    // 初期表示
    displayStructures('all');

    // フィルターボタンのイベントリスナーを設定
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            displayStructures(category);

            // アクティブクラスの切り替え
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});
