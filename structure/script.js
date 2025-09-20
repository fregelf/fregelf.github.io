document.addEventListener('DOMContentLoaded', () => {
    // 構造物のデータ
    const structures = [
        {
            name: "F-15 イーグル戦闘機",
            creator: "Your Name",
            dimensions: { length: 28, width: 20, height: 8 },
            description: "高い機動性を持つ単座式戦闘機です。",
            image: "images/f15.png",
            category: "fighter",
            file: "files/f15_eagle.mcstructure",
            details_page: "f15_details.html" // 詳細ページのファイル名を追加
        },
        {
            name: "C-130 ハーキュリーズ輸送機",
            creator: "Your Name",
            dimensions: { length: 55, width: 60, height: 18 },
            description: "物資や人員を運ぶための大型輸送機です。",
            image: "images/c130.png",
            category: "transport",
            file: "files/c130_hercules.mcstructure",
            details_page: "c130_details.html"
        },
        {
            name: "M1 エイブラムス戦車",
            creator: "Your Name",
            dimensions: { length: 15, width: 8, height: 6 },
            description: "分厚い装甲と強力な主砲を持つ主力戦車です。",
            image: "images/m1_abrams.png",
            category: "tank",
            file: "files/m1_abrams.mcstructure",
            details_page: "m1_abrams_details.html"
        },
        {
            name: "ボーイング 747 旅客機",
            creator: "Your Name",
            dimensions: { length: 70, width: 65, height: 25 },
            description: "二階建ての大型旅客機です。",
            image: "images/b747.png",
            category: "transport",
            file: "files/boeing747.mcstructure",
            details_page: "b747_details.html"
        },
        {
            name: "F-22 ラプター戦闘機",
            creator: "Your Name",
            dimensions: { length: 25, width: 17, height: 7 },
            description: "高いステルス性を持つ最新鋭の戦闘機です。",
            image: "images/f22.png",
            category: "fighter",
            file: "files/f22_raptor.mcstructure",
            details_page: "f22_details.html"
        },
        // 新しいカテゴリのサンプルデータ
        {
            name: "駆逐艦",
            creator: "Your Name",
            dimensions: { length: 150, width: 20, height: 35 },
            description: "小型で高速の軍艦です。",
            image: "images/destroyer.png",
            category: "vessel",
            file: "files/destroyer.mcstructure",
            details_page: "destroyer_details.html"
        },
        {
            name: "装甲車",
            creator: "Your Name",
            dimensions: { length: 10, width: 5, height: 5 },
            description: "人員輸送用の装甲車両です。",
            image: "images/armored_car.png",
            category: "vehicle",
            file: "files/armored_car.mcstructure",
            details_page: "armored_car_details.html"
        }
    ];

    const structuresGrid = document.getElementById('structures');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const noResultsMessage = document.getElementById('no-results-message');

    // 構造物カードを作成する関数
    const createStructureCard = (structure) => {
        const card = document.createElement('a'); // aタグに変更
        card.className = 'structure-card';
        card.dataset.category = structure.category;
        card.href = structure.details_page; // 詳細ページへのリンクを設定

        const html = `
            <img src="${structure.image}" alt="${structure.name}" class="card-image">
            <div class="card-content">
                <h3>${structure.name}</h3>
                <div class="card-details">
                    <p>制作者: ${structure.creator}</p>
                    <p>サイズ: 全長 ${structure.dimensions.length} Blm / 全幅 ${structure.dimensions.width} Blm / 全高 ${structure.dimensions.height} Blm</p>
                </div>
                <p>${structure.description}</p>
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
