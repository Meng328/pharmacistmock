import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocs, collection, doc, setDoc } from "firebase/firestore"; // 引入 Firebase 方法
import { db } from "../firebase"; // 假設 db 是您 Firebase 配置中的實例

export default function QuizPage() {
  const { subject, chapter } = useParams();
  const navigate = useNavigate();

  const [questionsData, setQuestionsData] = useState({});
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false); // 用來標記是否回答正確

  // 讀取題目資料
  const fetchQuestionsData = async () => {
    try {
      console.log("Starting to fetch data from Firestore");

      const questions = {};

      const subjectsSnapshot = await getDocs(collection(db, "subjects"));
      console.log("Got subjects snapshot:", subjectsSnapshot);

      // 使用 for...of 來處理每個科目，並確保每次的異步操作完成後再進行下一步
      for (const subjectDoc of subjectsSnapshot.docs) {
        const subjectName = subjectDoc.id; // 科目名稱
        questions[subjectName] = {}; // 初始化科目

        // 讀取每個科目的章節
        const chaptersSnapshot = await getDocs(
          collection(subjectDoc.ref, "chapters")
        );

        // 使用 for...of 來處理每個章節
        for (const chapterDoc of chaptersSnapshot.docs) {
          const chapterName = chapterDoc.id; // 章節名稱
          questions[subjectName][chapterName] = { questions: [] }; // 初始化章節內的問題數組

          // 讀取該章節下的問題
          const questionsInChapterSnapshot = await getDocs(
            collection(chapterDoc.ref, "questions")
          );

          // 迭代每個問題並將其加入章節
          for (const questionDoc of questionsInChapterSnapshot.docs) {
            const questionData = questionDoc.data();
            questionData.id = questionDoc.id;
            questions[subjectName][chapterName].questions.push(questionData); // 添加問題資料
          }
        }
      }

      setQuestionsData(questions); // 設定資料到 state
    } catch (error) {
      console.error("Error fetching questions: ", error);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, []);

  // 檢查答案並儲存錯誤題目
  const checkAnswer = async (option) => {
    setSelected(option);
    setShowAnswer(true);

    // 確認 currentQuestion 是否存在
    if (!currentQuestion) {
      console.error("No current question data available");
      return;
    }
    if (
      !currentQuestion ||
      !currentQuestion.options ||
      currentQuestion.options.length === 0
    ) {
      console.error("No valid question data or empty options available");
      return; // 跳過此題
    }

    // 解析答案格式
    const correctAnswer = currentQuestion.answer;
    let isAnswerCorrect = false;

    if (correctAnswer === "E") {
      // 若答案是 E，代表所有選項都正確
      isAnswerCorrect =
        option === "A" || option === "B" || option === "C" || option === "D";
    } else if (correctAnswer.includes(",")) {
      // 若答案是多個選項，使用逗號分隔
      const correctAnswers = correctAnswer.split(",").map((ans) => ans.trim());
      isAnswerCorrect = correctAnswers.includes(option);
    } else {
      // 若只有單一選項，直接比對
      isAnswerCorrect = option === correctAnswer;
    }

    setIsCorrect(isAnswerCorrect); // 設置回答是否正確

    if (!isAnswerCorrect) {
      const wrongItem = {
        question: currentQuestion.question,
        answer: currentQuestion.answer,
        explanation: currentQuestion.explanation,
        options: currentQuestion.options,
        userAnswer: option,
      };

      try {
        // 確保 currentQuestion.id 存在
        if (!currentQuestion.id) {
          console.error("Current question does not have an id!");
          return;
        }

        const wrongQuestionRef = doc(
          db,
          "subjects",
          subject,
          "chapters",
          chapter,
          "wrongQuestions",
          currentQuestion.id // 使用原本題目的 ID
        );

        // 儲存錯題資料
        await setDoc(wrongQuestionRef, wrongItem);
        console.log("錯題已儲存至 Firebase, document ID: ", currentQuestion.id);

        // 更新錯題列表
        setWrongQuestions((prev) => [...prev, wrongItem]);
      } catch (error) {
        console.error("錯題儲存失敗:", error);
      }
    }
    if (isAnswerCorrect) {
      setTimeout(() => {
        nextQuestion();
      }, 1000); // 1秒後自動跳到下一題
    }
  };

  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setSelected(null);
      setShowAnswer(false);
      setIsCorrect(false); // 清除是否正確的標記
      setCurrentIndex((prev) => prev + 1); // 顯示下一題
    } else {
      setQuizFinished(true); // 當所有題目完成後顯示結束
    }
  };

  const viewWrongQuestions = () => {
    navigate("/wrong-questions", {
      state: {
        wrongQuestions: wrongQuestions,
        chapter: chapter,
        subject: subject,
      },
    });
  };

  const goToHomePage = () => {
    navigate("/"); // 返回首頁路徑
  };

  // 設定章節完成
  // const handleCompleteChapter = (subj, chap) => {
  //   const updatedQuestionsData = { ...questionsData };
  //   updatedQuestionsData[subj][chap].isCompleted = true; // 設定章節為完成
  //   setQuestionsData(updatedQuestionsData); // 更新狀態
  //   // 可以選擇將章節完成狀態儲存在 Firebase
  //   saveChapterCompletionStatus(subj, chap);
  // };

  // const saveChapterCompletionStatus = async (subj, chap) => {
  //   try {
  //     const chapterRef = doc(db, "subjects", subj, "chapters", chap);
  //     await setDoc(chapterRef, { isCompleted: true }, { merge: true });
  //     console.log(`Chapter ${chap} completed and saved to Firestore.`);
  //   } catch (error) {
  //     console.error("Error saving chapter completion status:", error);
  //   }
  // };

  // const handleCompleteTest = () => {
  //   setQuizFinished(true);
  //   handleCompleteChapter(subject, chapter);
  // };

  const currentQuestion =
    questionsData[subject]?.[chapter]?.questions?.[currentIndex];

  const totalQuestions = questionsData[subject]?.[chapter]?.questions?.length;

  return (
    <div>
      <div className="mt-20">
        <button
          onClick={goToHomePage}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          回首頁
        </button>
        <h3>科目：{subject}</h3>
        <h3>章節：{chapter}</h3>
        <p>
          第 {currentIndex + 1} 題 / 共 {totalQuestions} 題
        </p>

        {!quizFinished ? (
          <>
            <div>
              <h2>{currentIndex + 1}.</h2>
              <p>{currentQuestion?.question}</p>
              <div>
                {currentQuestion?.options.map((opt, idx) => {
                  const optionLetter = opt.split(".")[0]; // 取得選項的字母 A, B, C, D
                  const correctAnswers = currentQuestion.answer.includes(",")
                    ? currentQuestion.answer.split(",").map((ans) => ans.trim()) // 處理多個答案
                    : [currentQuestion.answer]; // 單一正確答案

                  const isCorrectAnswer = correctAnswers.includes(optionLetter); // 判斷是否是正確答案
                  const isSelected = selected === optionLetter; // 判斷用戶選擇的選項

                  return (
                    <button
                      key={idx}
                      onClick={() => !showAnswer && checkAnswer(optionLetter)} // 傳遞字母
                      className={`cursor-pointer p-2 border rounded mb-2 w-full text-left ${
                        showAnswer
                          ? isCorrectAnswer
                            ? "bg-green-100" // 正確答案顯示綠色
                            : isSelected
                            ? "bg-red-100" // 錯誤答案顯示紅色
                            : ""
                          : ""
                      }`}
                    >
                      {opt} {/* 顯示選項內容，包含 A, B, C, D */}
                    </button>
                  );
                })}
              </div>

              {showAnswer && !isCorrect && (
                <div>
                  <p>正確答案：{currentQuestion.answer}</p>
                  <p>解析：{currentQuestion.explanation}</p>
                  <button
                    onClick={nextQuestion}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    下一題
                  </button>
                </div>
              )}
              {/* 尚未作答也能略過（非最後一題時） */}
              {!showAnswer && currentIndex < totalQuestions - 1 && (
                <button
                  onClick={nextQuestion}
                  className="bg-gray-300 text-black px-4 py-2 rounded mt-4"
                >
                  略過此題
                </button>
              )}

              {/* {showAnswer && isCorrect && (
                setTimeout(() => {
                  nextQuestion();
                }, 1000) // 1秒後自動跳到下一題
              )} */}
            </div>
          </>
        ) : (
          <div>
            <h3>恭喜你完成了所有題目！</h3>
            <button
              onClick={viewWrongQuestions}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              查看錯題
            </button>
            <button
              onClick={goToHomePage}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              回首頁
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
