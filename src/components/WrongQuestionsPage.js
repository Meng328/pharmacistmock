import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function WrongQuestionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { wrongQuestions, chapter, subject } = location.state || {
    wrongQuestions: [],
    chapter: "",
    subject: "",
  };


  const goToHomePage = () => {
    navigate("/"); // 返回首頁路徑
  };

  return (
    <div>
      <button
        onClick={goToHomePage}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        回首頁
      </button>
      <h2>{subject}{chapter} 的錯誤題目</h2>
      {wrongQuestions.length > 0 ? (
        <ul>
          {wrongQuestions.map((item, index) => {
            // 取得當前錯誤題目的選項
            // const questionData = questionsData[subject]?.[chapter]?.find(
            //   (question) => question.question === item.question
            // );


            return (
              <li key={index} className="mb-4">
                <h2>{index+1}.</h2>
                <p>
                  <strong>{item.question}</strong>
                </p>
                <ul>
                  {item.options.map((opt, idx) => (
                    <li key={idx}>{opt}</li>
                  ))}
                </ul>
                <p>選擇答案：{item.userAnswer}</p>
                <p>正確答案：{item.answer}</p>
                <p>解析：{item.explanation}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>目前沒有錯誤題目。</p>
      )}
    </div>
  );
}
