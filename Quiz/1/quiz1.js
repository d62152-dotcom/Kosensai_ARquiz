(function () {
  let tokenizer;


  // クイズデータ
  const quizData = [
    {
      question: "[やなせライオン]やなせライオンが見守ってきたのはどこかな？",
      choices: [
        { text: "なんこく町" },
        { text: "あんぱん町" },
        { text: "ごめん町" },
        { text: "ばいきん町" },
      ],
      correct: 2,
    },
  ];


  // 状態管理変数
  let currentIndex = 0;
  let rightCount = 0;
  let isSending = false;


  // LocalStorage から値を取得（数値化と初期値設定）
  let score = Number(localStorage.getItem("score")) || 0;
  let answeredQuestionCount = Number(localStorage.getItem("AnserQuestion")) || 0;
  const totalQuestion = Number(localStorage.getItem("totalQuestion")) || 0;


  // Kuromoji とクイズの初期化
  function initKuromojiAndQuiz() {
    kuromoji.builder({ dicPath: "../../dict/" }).build(function (err, t) {
      if (err) {
        console.error("Kuromoji initialization failed:", err);
        return;
      }
      tokenizer = t;
      console.log("Kuromoji ready ✅");
      loadQuestion();
    });
  }


  // 問題と選択肢の表示
  function loadQuestion() {
    document.getElementById("quiz-container").style.display = "block";
    document.getElementById("answer-section").style.display = "none";
    document.getElementById("final-result").style.display = "none";


    const questionData = quizData[currentIndex];


    // 問題文表示
    document.getElementById("question").innerHTML = addRuby(questionData.question);


    // 選択肢表示
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


  // 回答チェック
  function checkAnswer(selectedIndex, questionData) {
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("answer-section").style.display = "block";


    const resultText = document.getElementById("answer-result");


    if (selectedIndex === questionData.correct) {
      resultText.innerHTML = "<span class='correct'><ruby>正解<rt>せいかい</rt></ruby>！</span>";
      score++;
      rightCount++;
      localStorage.setItem("score", score);
    } else {
      resultText.innerHTML = "<span class='wrong'><ruby>不正解<rt>ふせいかい</rt></ruby>です。</span>";
    }


    currentIndex++;


    // 全問終了時の判定
    if (currentIndex === quizData.length) {
      if (rightCount === quizData.length) {
        answeredQuestionCount++;
        localStorage.setItem("AnserQuestion", answeredQuestionCount);


        let bit = Number(localStorage.getItem("bit")) || 0;
        localStorage.setItem("bit", bit + 1);
      }


      setTimeout(() => {
        endCode();
      }, 3000);
    }
  }


  // 次の問題へ（手動遷移用ボタン等で使用する場合）
  function nextQuestion() {
    if (currentIndex < quizData.length) {
      loadQuestion();
      document.getElementById("container")?.scrollIntoView({ behavior: "smooth" });
    } else {
      showResult();
    }
  }


  // 終了処理・外部連携
  function endCode() {
    if (isSending) return;
    isSending = true;


    const gasUrl = "https://script.google.com/macros/s/AKfycby-9lUW73-r32G7pmNsPAkSIz6yR6bDBGk3S5HNbnXuvWbWJcjm97tMQKdXlF8sYXN3/exec";


    if (answeredQuestionCount === totalQuestion) {
      fetch(gasUrl).finally(() => {
        window.location.href = "../../clear.html";
      });
    } else {
      window.location.href = "../../newquiz.html";
    }
  }


  // リザルト表示
  function showResult() {
    document.getElementById("answer-section").style.display = "none";
    document.getElementById("final-result").style.display = "block";


    const percentage = (rightCount / quizData.length) * 100;
    document.getElementById("score").textContent = `正解数: ${rightCount}/${quizData.length} (${percentage.toFixed(2)}%)`;


    setTimeout(() => {
      document.getElementById("restart-quiz")?.click();
    }, 5000);
  }


  // 補助: カタカナ -> ひらがな
  function katakanaToHiragana(str) {
    if (!str) return "";
    return Array.from(str)
      .map(ch => {
        const code = ch.charCodeAt(0);
        return code >= 0x30a1 && code <= 0x30f3 ? String.fromCharCode(code - 0x60) : ch;
      })
      .join("");
  }


  // ルビ付け関数
  function addRuby(text) {
    if (!tokenizer) return escapeHtml(text);


    const tokens = tokenizer.tokenize(text);


    return tokens
      .map(token => {
        const surface = token.surface_form;
        const reading = token.reading;


        if (/[一-龠々]/.test(surface) && reading) {
          let hira = katakanaToHiragana(reading);
          let s = surface;
          let r = hira;


          // 送り仮名の切り離し処理
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
      })
      .join("");
  }


  // HTMLエスケープ処理
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }


  // グローバル公開関数
  window.nextQuestion = nextQuestion;
  window.endCode = endCode;


  // 初期化実行
  window.onload = initKuromojiAndQuiz;
})();
