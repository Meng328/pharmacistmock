import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const storedQuestionsKey = "customQuestions";
const wrongQuestionsKey = "wrongQuestions";


export default function QuizPage() {
  const { subject, chapter } = useParams();
  const navigate = useNavigate();

  const [questionsData, setQuestionsData] = useState({});
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // 當組件載入時，從 localStorage 讀取題目資料、錯題資料和已完成測驗資料
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem(storedQuestionsKey) || "{}");
    const storedWrongQuestions = JSON.parse(localStorage.getItem(wrongQuestionsKey) || "[]");
    setQuestionsData(storedData);
    setWrongQuestions(storedWrongQuestions);
  }, []);

  // 取得當前的題目數據
  const currentQuestion = questionsData[subject]?.[chapter]?.[currentIndex];
  const totalQuestions = questionsData[subject]?.[chapter]?.length;

  // 處理選擇答案
  const checkAnswer = (option) => {
    setSelected(option);
    setShowAnswer(true); // 顯示答案和解析

    // 如果選錯答案，記錄錯題
    if (option !== currentQuestion.answer) {
      const wrongItem = { ...currentQuestion, userAnswer: option, chapter };
      if (
        !wrongQuestions.some((item) => item.question === wrongItem.question)
      ) {
        const updatedWrongQuestions = [...wrongQuestions, wrongItem];
        setWrongQuestions(updatedWrongQuestions);
        localStorage.setItem(
          wrongQuestionsKey,
          JSON.stringify(updatedWrongQuestions)
        );
      }
    } else {
      const updatedWrongQuestions = wrongQuestions.filter(
        (item) => item.question !== currentQuestion.question
      );
      setWrongQuestions(updatedWrongQuestions);
      localStorage.setItem(
        wrongQuestionsKey,
        JSON.stringify(updatedWrongQuestions)
      );
    }
  };
  
  // 下一題
  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setSelected(null);
      setShowAnswer(false);
      setCurrentIndex((prev) => prev + 1); // 顯示下一題
    } else {
      setQuizFinished(true); // 當所有題目完成後顯示結束
    }
  };

  // 錯題檢視
  const viewWrongQuestions = () => {
    navigate("/wrong-questions", {
      state: {
        wrongQuestions: wrongQuestions.filter(
          (item) => item.chapter === chapter
        ),
        chapter: chapter,
        subject: subject,
      },
    });
  };


  const goToHomePage = () => {
    navigate("/"); // 返回首頁路徑
  };

  return (
    <div>
      <div className="mt-20">
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
                {currentQuestion?.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => !showAnswer && checkAnswer(opt)}
                    className={`cursor-pointer p-2 border rounded mb-2 w-full text-left ${
                      showAnswer
                        ? opt === currentQuestion.answer
                          ? "bg-green-100" // 正確答案顯示綠色
                          : selected === opt
                          ? "bg-red-100" // 錯誤答案顯示紅色
                          : ""
                        : ""
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {showAnswer && (
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
            <p></p>
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
