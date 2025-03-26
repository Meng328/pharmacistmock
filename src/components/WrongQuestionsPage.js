import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase"; // 假設 firebase-config.js 文件已經包含正確的初始化

export default function WrongQuestionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chapter, subject } = location.state || { chapter: "", subject: "" };

  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 讀取 Firebase 中的錯誤題目資料（來自 wrongQuestions 集合）
  useEffect(() => {
    const fetchWrongQuestions = async () => {
      try {
        setLoading(true);

        // 從指定的科目和章節讀取 wrongQuestions 集合
        const wrongQuestionsSnapshot = await getDocs(
          collection(db, "subjects", subject, "chapters", chapter, "wrongQuestions")
        );

        const wrongQuestionsData = [];
        wrongQuestionsSnapshot.forEach((doc) => {
          wrongQuestionsData.push(doc.data()); // 將錯誤題目資料儲存至陣列
        });

        setWrongQuestions(wrongQuestionsData); // 設定錯誤的題目資料
        setLoading(false);
      } catch (error) {
        console.error("Error fetching wrong questions: ", error);
        setLoading(false);
      }
    };

    fetchWrongQuestions();
  }, [subject, chapter]); // 依賴 subject 和 chapter 進行重新加載

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
      <h2>{subject} {chapter} 的錯誤題目</h2>

      {loading ? (
        <p>正在加載錯誤題目...</p>
      ) : wrongQuestions.length > 0 ? (
        <ul>
          {wrongQuestions.map((item, index) => (
            <li key={index} className="mb-4">
              <h3>{index + 1}.</h3>
              <p><strong>{item.question}</strong></p>
              <ul>
                {item.options?.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
              <p>選擇答案：{item.userAnswer}</p>
              <p>正確答案：{item.answer}</p>
              <p>解析：{item.explanation}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>目前沒有錯誤題目。</p>
      )}
    </div>
  );
}
