(function(){
function initKuromojiAndQuiz() {
  kuromoji.builder({ dicPath: "../../dict/" }).build(function(err, t) {
    if (err) {
      console.error(err);
      return;
    }
    tokenizer = t;
    console.log("Kuromoji ready ✅");

    // Kuromoji 初期化後にクイズを開始
    loadQuestion();
  });
}
// ルビ付け関数

const quizData = [
	{
      question: "[ありがとう駅のセンベちゃん]センベちゃんはどこの駅に住んでいるかな？",
      choices: [
        { text: "こうち駅" },
        { text: "ありがとう駅" },
        { text: "しょうが駅" },
        { text: "ごめん駅" },
      ],
      correct: 1,
    },
	// 他の問題もここに追加
];
let currentQuiz = quizData; // 全問題をそのまま使用
let currentQuestion = 0;
let Charscore = localStorage.getItem("score") || 0;
let score = Number(Charscore);
let CharAnserQuestion = localStorage.getItem("AnserQuestion") || 0;
let AnserQuestion = Number(CharAnserQuestion);
let Right = 0;
let QuizNumber = [0];
let i = 0;
const Questions = 1;
const totalQuestion = localStorage.getItem("totalQuestion");
// 初期化

// 問題と選択肢を表示
function loadQuestion() {
  document.getElementById("quiz-container").style.display = "block";
  document.getElementById("answer-section").style.display = "none";
  document.getElementById("final-result").style.display = "none";

  const questionData = quizData[i];

  // 問題文にルビを付けて表示
  document.getElementById("question").innerHTML = addRuby(questionData.question);

  // 選択肢表示
  const choicesContainer = document.getElementById("choices-container");
  choicesContainer.innerHTML = "";
  questionData.choices.forEach((choice, index) => {
    const choiceDiv = document.createElement("div");
    choiceDiv.classList.add("choice");
    // ここを変更：textContent -> innerHTML にして addRuby() の結果を入れる
    choiceDiv.innerHTML = `${index + 1}. ${addRuby(choice.text)}`;
    choiceDiv.onclick = () => checkAnswer(index, questionData);
    choicesContainer.appendChild(choiceDiv);
  });
}


// 答えを確認
function checkAnswer(selected, questionData) {
	document.getElementById("quiz-container").style.display = "none";
	document.getElementById("answer-section").style.display = "block";

	const resultText = document.getElementById("answer-result");
	const choicesContainer = document.getElementById("choices-container");
	choicesContainer.innerHTML = ""; // クリアして選択肢を再描画

	// 正解・不正解のメッセージ表示
	if (selected === questionData.correct) {
		resultText.innerHTML = "<span class='correct'> <ruby>正解<rt>せいかい</rt></ruby>！</span>";
		//score++;
		Right++;
		//localStorage.setItem("score", score);

	} else {
		resultText.innerHTML = "<span class='wrong'><ruby>不正解<rt>ふせいかい</rt></ruby>です。</span>";
		localStorage.setItem("score", score);
	}
	//currentQuestion++;
	i++;
	// 最終問題かどうかのチェック
	if (i === Questions) {
		if(Right === Questions){
			AnserQuestion++;
			localStorage.setItem("AnserQuestion",AnserQuestion);
			let test1 = localStorage.getItem("bit") || 0;
			let bit = Number(test1);
			bit = bit+8;
			localStorage.setItem("bit", bit);
		}
		setTimeout(() =>{
      endCord();
		},3000);
	}
}

// 次の問題へ
function nextQuestion() {
	if (i < Questions) {
		loadQuestion();
		document.getElementById("container").scrollIntoView({ behavior: "smooth" }); // containerにスクロール

	} else {
		showResult();
	}
}

let isSending = false; // 送信中フラグ

function endCord() {
  if (isSending) return; // すでに送信中なら何もしない
  isSending = true;      // 送信開始！

  const gasUrl = "https://script.google.com/macros/s/AKfycby-9lUW73-r32G7pmNsPAkSIz6yR6bDBGk3S5HNbnXuvWbWJcjm97tMQKdXlF8sYXN3/exec";

  if (AnserQuestion == totalQuestion) {
    fetch(gasUrl).finally(() => {
      window.location.href = '../../clear.html';
    });
  } else {
    window.location.href = '../../newquiz.html';
  }
}

//最終結果への遷移関数
// 結果を表示
function showResult() {
	document.getElementById("answer-section").style.display = "none";
	document.getElementById("final-result").style.display = "block";

	const percentage = (Right / Questions) * 100;
	document.getElementById("score").textContent = `正解数: ${Right}/${Questions} (${percentage.toFixed(2)}%)`;
			setTimeout(() =>{
			const button = document.getElementById("restart-quiz");
			button.click();
		},5000);
}


window.onload = () => {
  initKuromojiAndQuiz();
};
// ---------- 補助: カタカナ -> ひらがな ----------
function katakanaToHiragana(str) {
  if (!str) return "";
  return Array.from(str).map(ch => {
    const code = ch.charCodeAt(0);
    // カタカナの範囲内であればひらがなへ変換
    if (code >= 0x30A1 && code <= 0x30F3) {
      return String.fromCharCode(code - 0x60);
    }
    return ch;
  }).join('');
}

// ---------- ルビ付け関数（漢字が含まれる場合のみ） ----------
function addRuby(text) {
  if (!tokenizer) return text;

  const tokens = tokenizer.tokenize(text);

  return tokens.map(token => {
    const surface = token.surface_form;
    const reading = token.reading;

    // 漢字が含まれているかチェック
    if (/[一-龠々]/.test(surface) && reading) {
      let hira = katakanaToHiragana(reading);
      
      // 送り仮名（単語の終わりの方のひらがな）をルビの外に出す処理
      let s = surface;
      let r = hira;
      
      // 末尾から1文字ずつ比較し、共通するひらがながあれば切り離す
      while (
        s.length > 1 && 
        r.length > 1 && 
        s.slice(-1) === r.slice(-1) && 
        !/[一-龠々]/.test(s.slice(-1)) // 末尾が漢字じゃない場合のみ
      ) {
        s = s.slice(0, -1);
        r = r.slice(0, -1);
      }

      // 共通部分を切り離した後の残り（漢字部分）にだけルビを振る
      const suffix = surface.slice(s.length);
      return `<ruby>${escapeHtml(s)}<rt>${escapeHtml(r)}</rt></ruby>${escapeHtml(suffix)}`;
    } else {
      // 漢字がない場合はそのまま
      return escapeHtml(surface);
    }
  }).join('');
}

// 必要ならHTMLエスケープ（トークンに <> 等が入る可能性を防ぐ）
function escapeHtml(s) {
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