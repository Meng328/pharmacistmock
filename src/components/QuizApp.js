import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const storedQuestionsKey = "customQuestions";
const wrongQuestionsKey = "wrongQuestions";

export default function QuizApp() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [questionsData, setQuestionsData] = useState({});
  const [wrongQuestions, setWrongQuestions] = useState([]);

  const navigate = useNavigate();

  // 當組件載入時，從 localStorage 讀取題目資料和錯題資料
  useEffect(() => {
    const storedData = JSON.parse(
      localStorage.getItem(storedQuestionsKey) || "{}"
    );
    const storedWrongQuestions = JSON.parse(
      localStorage.getItem(wrongQuestionsKey) || "[]"
    );
    setQuestionsData(storedData);
    setWrongQuestions(storedWrongQuestions);
  }, []);

  // 處理科目選擇
  const handleSubjectSelection = (subj) => {
    setSubject(subj);
    setChapter(""); // 清除章節
  };

  // 處理章節選擇
  const handleChapterSelection = (chap) => {
    setChapter(chap);
  };

  // 處理導航到測驗頁面
  const handleNavigateToQuiz = (subj,chap) => {
    navigate(`/quiz/${subj}/${chap}`);
  };

  // 處理導航到錯題頁面
  const handleNavigateToWrongQuestions = (chap) => {
    navigate("/wrong-questions", {
      state: {
        wrongQuestions: wrongQuestions.filter((item) => item.chapter === chap),
        chapter: chap,
      },
    });
  };

  // 渲染固定橫向導覽列
  const renderNavigation = () => {
    return (
      <div className="fixed top-0 left-0 w-full bg-blue-600 p-4 text-white z-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl">選擇科目和章節</h2>
        </div>

        <nav>
          <ul className="space-x-10 mt-4 flex" id="nav">
            {Object.keys(questionsData).map((subj) => (
              <li key={subj} className="relative group px-6">
                <button
                  onClick={() => handleSubjectSelection(subj)}
                  className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                  {subj}
                </button>

                {/* 章節選單，當游標懸停在科目上時顯示 */}
                {
                  <ul className="absolute left-0 mt-2 bg-white text-black shadow-md rounded w-40 p-2 group-hover:block opacity-0 group-hover:opacity-100 visibility-hidden group-hover:visible transition-all duration-300">
                    {Object.keys(questionsData[subj]).map((chap) => (
                      <li key={chap} className="mb-2">
                        <button
                          onClick={() => handleChapterSelection(chap)}
                          className="block w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                        >
                          <div className="block">{chap}</div>{" "}
                          {/* 顯示章節名稱並換行 */}
                          <div className="text-sm text-gray-500">
                            {questionsData[subj][chap].length} 題
                          </div>{" "}
                          {/* 顯示題數，顯示在下一行 */}
                        </button>
                        {chapter === chap && (
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleNavigateToQuiz(subj, chap)}
                              className="bg-yellow-500 text-white px-4 py-2 rounded"
                            >
                              測驗
                            </button>
                            <button
                              onClick={() =>
                                handleNavigateToWrongQuestions(chap)
                              }
                              className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                              錯題
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                }
              </li>
            ))}
            <li className="bg-blue-600 text-white px-6 py-2 rounded cursor-pointer">
              <a href="/add-questions">新增題目</a>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  // 如果科目或章節未選擇，顯示選擇科目和章節的按鈕
  if (!subject || !chapter) {
    return (
      <div>
        {renderNavigation()}
        <div className="mt-20">
          <p>請選擇科目和章節來開始測驗。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderNavigation()}
      <div className="mt-20">
        <p>選擇的科目：{subject}</p>
        <p>選擇的章節：{chapter}</p>
      </div>
    </div>
  );
}
