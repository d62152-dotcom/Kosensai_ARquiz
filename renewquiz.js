// ==========================================
// 1. 初期化処理
// ==========================================
if (!sessionStorage.getItem('initialized')) {
  localStorage.setItem("bit", 0);
  localStorage.setItem("score", 0);
  localStorage.setItem("totalQuestion", 4);
  localStorage.setItem("AnserQuestion", 0);
  sessionStorage.setItem('initialized', 'true');
}

let bit = Number(localStorage.getItem("bit")) || 0;
const totalQuestion = 4;

// 回答済み判定関数 (ビット演算)
function checkanswered(qn, currentBit) {
  return (currentBit & (1 << (qn - 1))) ? 1 : 0;
}

// 答えた問題の数を計算
function countAnsweredQuestions(currentBit) {
  let count = 0;
  for (let i = 1; i <= totalQuestion; i++) {
    if (checkanswered(i, currentBit)) {
      count++;
    }
  }
  return count;
}

// ==========================================
// 2. 4連ガイドイラスト＆進捗の更新UI処理
// ==========================================
function updateUI() {
  const currentBit = Number(localStorage.getItem("bit")) || 0;
  const answeredCount = countAnsweredQuestions(currentBit);

  // 進捗数の更新
  const answeredValueElem = document.getElementById('answeredValue');
  if (answeredValueElem) {
    answeredValueElem.textContent = `${answeredCount} / ${totalQuestion}`;
  }

  // 4つのイラストアイコンの表示状態（モノクロ / カラー）を更新
  for (let i = 1; i <= totalQuestion; i++) {
    const itemElem = document.getElementById(`target-item-${i}`);
    if (itemElem) {
      if (checkanswered(i, currentBit)) {
        itemElem.classList.remove('unanswered');
        itemElem.classList.add('answered');
      } else {
        itemElem.classList.remove('answered');
        itemElem.classList.add('unanswered');
      }
    }
  }

  // 全問クリア時の判定（クリア画面へリダイレクト）
  if (answeredCount >= totalQuestion) {
    setTimeout(() => {
      window.location.href = './clear.html';
    }, 800);
  }
}

// 案内メッセージの表示処理
let messageTimer = null;
function showMessage(text) {
  const msgElem = document.getElementById('message');
  if (msgElem) {
    msgElem.textContent = text;
    msgElem.style.display = 'block';

    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      msgElem.style.display = 'none';
    }, 3500);
  }
}

// ==========================================
// 3. マーカー検知処理 (順番は完全自由)
// ==========================================
function setupMarkerListener(markerId, quizNumber, redirectUrl) {
  const marker = document.querySelector(markerId);
  if (!marker) return;

  marker.addEventListener('markerFound', () => {
    const currentBit = Number(localStorage.getItem("bit")) || 0;

    // まだ答えていない問題の場合 ➔ クイズ画面へ遷移
    if (!checkanswered(quizNumber, currentBit)) {
      window.location.href = redirectUrl;
    } else {
      // 既に解答済みの場合 ➔ 案内メッセージを表示
      showMessage("💡 このイラストのクイズはもう答えたよ！ほかのイラストをさがそう！");
    }
  });
}

// 各マーカーへのイベント登録
setupMarkerListener('#marker01', 1, './Quiz/1/quiz1.html');
setupMarkerListener('#marker02', 2, './Quiz/2/quiz2.html');
setupMarkerListener('#marker03', 3, './Quiz/3/quiz3.html');
setupMarkerListener('#marker04', 4, './Quiz/4/quiz4.html');

// ==========================================
// 4. アセットのプリロード ＆ 画面読み込み時実行
// ==========================================
function preloadAssets() {
  const imagesToCache = [
    './images/marker/pattern-yanaseraion.png',
    './images/marker/pattern-syougajizou.png',
    './images/marker/pattern-syougatyan.png',
    './images/marker/pattern-senbeityan.png'
  ];

  imagesToCache.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  preloadAssets();
  updateUI();
});
