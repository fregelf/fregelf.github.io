document.addEventListener('DOMContentLoaded', () => {
    // 構造物のデータ (idはファイル名に対応)
    const structures = [
        {
            id: "f15",
            name: "F-15 イーグル戦闘機",
            description: "高い機動性を持つ単座式戦闘機です。",
            image: "images/f15.png",
            category: "fighter"
        },
        {
            id: "a10",
            name: "A-10 サンダーボルトII",
            description: "地上攻撃に特化した攻撃機です。",
            image: "images/a10.png",
            category: "attack"
        },
        {
            id: "b52",
            name: "B-52 ストラトフォートレス",
            description: "長距離飛行が可能な戦略爆撃機です。",
            image: "images/b52.png",
            category: "bomber"
        },
        {
            id: "sr71",
            name: "SR-71 ブラックバード",
            description: "超音速で飛行する戦略偵察機です。",
            image: "images/sr71.png",
            category: "recon"
        },
        {
            id: "t4",
            name: "T-4 練習機",
            description: "航空自衛隊で使用されるジェット練習機です。",
            image: "images/t4.png",
            category: "trainer"
        },
        {
            id: "c130",
            name: "C-130 ハーキュリーズ輸送機",
            description: "物資や人員を運ぶための大型輸送機です。",
            image: "images/c130.png",
            category: "transport"
        },
        {
            id: "f14",
            name: "F-14 トムキャット",
            description: "可変翼を持つ艦載戦闘機です。",
            image: "images/f14.png",
            category: "carrier-based"
        },
        {
            id: "destroyer",
            name: "イージス駆逐艦",
            description: "防空能力に優れた大型艦艇です。",
            image: "images/destroyer.png",
            category: "vessel"
        },
        {
            id: "patrol_boat",
            name: "巡視艇",
            description: "沿岸警備に使用される小型艦艇です。",
            image: "images/patrol_boat.png",
            category: "small-vessel"
        },
        {
            id: "uh1",
            name: "UH-1 イロコイ",
            description: "多用途に使用される汎用ヘリコプターです。",
            image: "images/uh1.png",
            category: "helicopter"
        },
        {
            id: "m1_abrams",
            name: "M1 エイブラムス戦車",
            description: "分厚い装甲と強力な主砲を持つ主力戦車です。",
            image: "images/m1_abrams.png",
            category: "tank"
        },
        {
            id: "jeep",
            name: "軍用ジープ",
            description: "人員輸送に特化した軍用車両です。",
            image: "images/jeep.png",
            category: "vehicle"
        },
        {
            id: "ac130",
            name: "AC-130 ガンシップ",
            description: "夜間・地上支援に特化した攻撃機です。",
            image: "images/ac130.png",
            category: "other"
        }
    ];

    const structuresGrid = document.getElementById('structures');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const accordionHeaders = document.querySelectorAll('.accordion-header');

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
                <a href="pages/${structure.id}.html" class="detail-link">詳細を見る</a>
            </div>
        `;
        card.innerHTML = html;
        structuresGrid.appendChild(card);
    };

    // フィルターと検索に基づいて構造物を表示
    const displayStructures = () => {
        const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
        const searchTerm = searchInput.value.toLowerCase();
        structuresGrid.innerHTML = ''; // グリッドをクリア

        structures.forEach(structure => {
            const matchesCategory = (activeCategory === 'all' || structure.category === activeCategory);
            const matchesSearch = (
                structure.name.toLowerCase().includes(searchTerm) ||
                structure.description.toLowerCase().includes(searchTerm)
            );

            if (matchesCategory && matchesSearch) {
                createStructureCard(structure);
            }
        });
    };

    // 初期表示
    displayStructures();

    // フィルターボタンのイベントリスナー
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            button.classList.add('active');
            displayStructures();
        });
    });

    // 検索入力のイベントリスナー
    searchInput.addEventListener('input', displayStructures);

    // アコーディオンヘッダーのイベントリスナー
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            if (!accordionItem.classList.contains('active')) {
                document.querySelectorAll('.accordion-item.active').forEach(item => {
                    item.classList.remove('active');
                });
            }
            accordionItem.classList.toggle('active');
        });
    });
});
