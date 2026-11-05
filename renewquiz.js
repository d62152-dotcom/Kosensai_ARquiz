if (!sessionStorage.getItem('initialized')) {
  localStorage.setItem("bit", 0);
  localStorage.setItem("score", 0);
  localStorage.setItem("totalQuestion", 4);
  localStorage.setItem("AnserQuestion", 0);
  sessionStorage.setItem('initialized', 'true');
}

let bit = Number(localStorage.getItem("bit")) || 0;
const totalQuestion = 4;

function checkanswered(qn, currentBit) {
  return (currentBit & (1 << (qn - 1))) ? 1 : 0;
}

function countAnsweredQuestions(currentBit) {
  let count = 0;
  for (let i = 1; i <= totalQuestion; i++) {
    if (checkanswered(i, currentBit)) {
      count++;
    }
  }
  return count;
}

function updateUI() {
  const currentBit = Number(localStorage.getItem("bit")) || 0;
  const answeredCount = countAnsweredQuestions(currentBit);

  const answeredValueElem = document.getElementById('answeredValue');
  if (answeredValueElem) {
    answeredValueElem.textContent = `${answeredCount} / ${totalQuestion}`;
  }

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

  if (answeredCount >= totalQuestion) {
    setTimeout(() => {
      window.location.href = './clear.html';
    }, 800);
  }
}

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

function setupMarkerListener(markerId, quizNumber, redirectUrl) {
  const marker = document.querySelector(markerId);
  if (!marker) return;

  marker.addEventListener('markerFound', () => {
    const currentBit = Number(localStorage.getItem("bit")) || 0;

    if (!checkanswered(quizNumber, currentBit)) {
      window.location.href = redirectUrl;
    } else {
      showMessage("💡 このキャラのクイズはもう答えたよ！ほかのイラストをさがそう！");
    }
  });
}

setupMarkerListener('#marker01', 1, './Quiz/1/quiz1.html');
setupMarkerListener('#marker02', 2, './Quiz/2/quiz2.html');
setupMarkerListener('#marker03', 3, './Quiz/3/quiz3.html');
setupMarkerListener('#marker04', 4, './Quiz/4/quiz4.html');

function preloadAssets() {
  const imagesToCache = [
    './images/marker/pattern-kochiyan_c_002_r_300.png',
    './images/marker/pattern-karanchan_c_004_r_350.png',
    './images/marker/pattern-kochiyan_c_008_r_300.png',
    './images/marker/pattern-karanchan_c_009_r_350.png'
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