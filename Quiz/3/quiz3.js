(function(){
let tokenizer;

function initKuromojiAndQuiz() {
  kuromoji.builder({ dicPath: "../../dict/" }).build(function(err, t) {
    if (err) {
      console.error(err);
      loadQuestion();
      return;
    }
    tokenizer = t;
    console.log("Kuromoji ready ✅");
    loadQuestion();
  });
}

// 高専仕様クイズデータ 3
const quizData = [
  {
    question: "「Iコース」の正式名称はどれかな？",
    choices: [
      { text: "情報セキュリティコース" },
      { text: "インターネットコース" },
      { text: "イラストデザインコース" },
      { text: "イノベーションコース" },
    ],
    correct: 0, // 正解：「情報セキュリティコース」
  },
];

let currentQuiz = quizData;
let currentQuestion = 0;
let Charscore = localStorage.getItem("score") || 0;
let score = Number(Charscore);
let CharAnserQuestion = localStorage.getItem("AnserQuestion") || 0;
let AnserQuestion = Number(CharAnserQuestion);
let Right = 0;
let QuizNumber = [0];
let i = 0;
const Questions = 1;
const totalQuestion = localStorage.getItem("totalQuestion") || 4;

function loadQuestion() {
  if (document.getElementById("quiz-container")) document.getElementById("quiz-container").style.display = "block";
  if (document.getElementById("answer-section")) document.getElementById("answer-section").style.display = "none";
  if (document.getElementById("final-result")) document.getElementById("final-result").style.display = "none";

  const questionData = quizData[i];

  document.getElementById("question").innerHTML = addRuby(questionData.question);

  const choicesContainer = document.getElementById("choices-container");
  choicesContainer.innerHTML = "";
  questionData.choices.forEach((choice, index) => {
    const choiceDiv = document.createElement("div");
    choiceDiv.classList.add("choice");
    choiceDiv.innerHTML = `${index + 1}. ${addRuby(choice.text)}`;
    choiceDiv.onclick = () => checkAnswer(index, questionData);
    choicesContainer.appendChild(choiceDiv);
  });
}

function checkAnswer(selected, questionData) {
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("answer-section").style.display = "block";

  const resultText = document.getElementById("answer-result");
  const choicesContainer = document.getElementById("choices-container");
  choicesContainer.innerHTML = "";

  if (selected === questionData.correct) {
    resultText.innerHTML = "<span class='correct'> <ruby>正解<rt>せいかい</rt></ruby>！</span>";
    Right++;
  } else {
    resultText.innerHTML = "<span class='wrong'><ruby>不正解<rt>ふせいかい</rt></ruby>です。</span>";
    localStorage.setItem("score", score);
  }

  i++;

  if (i === Questions) {
    if(Right === Questions){
      AnserQuestion++;
      localStorage.setItem("AnserQuestion", AnserQuestion);
      let test1 = localStorage.getItem("bit") || 0;
      let bit = Number(test1);
      bit = bit + 4; // 3問目のビット加算 (+4)
      localStorage.setItem("bit", bit);
    }
    setTimeout(() => {
      endCord();
    }, 2000);
  }
}

function nextQuestion() {
  if (i < Questions) {
    loadQuestion();
    document.getElementById("container")?.scrollIntoView({ behavior: "smooth" });
  } else {
    showResult();
  }
}

let isSending = false;

function endCord() {
  if (isSending) return;
  isSending = true;

  const gasUrl = "https://script.google.com/macros/s/AKfycby-9lUW73-r32G7pmNsPAkSIz6yR6bDBGk3S5HNbnXuvWbWJcjm97tMQKdXlF8sYXN3/exec";

  let currentBit = Number(localStorage.getItem("bit")) || 0;
  if (currentBit >= 15 || AnserQuestion == totalQuestion) {
    fetch(gasUrl).finally(() => {
      window.location.href = '../../clear.html';
    });
  } else {
    window.location.href = '../../newquiz.html';
  }
}

function showResult() {
  if (document.getElementById("answer-section")) document.getElementById("answer-section").style.display = "none";
  if (document.getElementById("final-result")) document.getElementById("final-result").style.display = "block";

  const percentage = (Right / Questions) * 100;
  if (document.getElementById("score")) {
    document.getElementById("score").textContent = `正解数: ${Right}/${Questions} (${percentage.toFixed(2)}%)`;
  }
  setTimeout(() => {
    document.getElementById("restart-quiz")?.click();
  }, 5000);
}

window.onload = () => {
  initKuromojiAndQuiz();
};

function katakanaToHiragana(str) {
  if (!str) return "";
  return Array.from(str).map(ch => {
    const code = ch.charCodeAt(0);
    if (code >= 0x30A1 && code <= 0x30F3) {
      return String.fromCharCode(code - 0x60);
    }
    return ch;
  }).join('');
}

function addRuby(text) {
  if (!tokenizer) return escapeHtml(text);

  const tokens = tokenizer.tokenize(text);

  return tokens.map(token => {
    const surface = token.surface_form;
    const reading = token.reading;

    if (/[一-龠々]/.test(surface) && reading) {
      let hira = katakanaToHiragana(reading);
      let s = surface;
      let r = hira;

      while (
        s.length > 1 && 
        r.length > 1 && 
        s.slice(-1) === r.slice(-1) && 
        !/[一-龠々]/.test(s.slice(-1))
      ) {
        s = s.slice(0, -1);
        r = r.slice(0, -1);
      }

      const suffix = surface.slice(s.length);
      return `<ruby>${escapeHtml(s)}<rt>${escapeHtml(r)}</rt></ruby>${escapeHtml(suffix)}`;
    } else {
      return escapeHtml(surface);
    }
  }).join('');
}

function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}

window.nextQuestion = nextQuestion;
window.endCord = endCord;
})();
