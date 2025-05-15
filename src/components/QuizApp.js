import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, getDocs } from "../firebase"; // 引入 Firebase 配置

export default function QuizApp() {
  const [subject, setSubject] = useState(""); // 用來儲存用戶選擇的科目
  const [chapter, setChapter] = useState(""); // 用來儲存用戶選擇的章節
  const [questionsData, setQuestionsData] = useState({});
  const [wrongQuestions, setWrongQuestions] = useState([]);

  const navigate = useNavigate();
  
  // const fetchQuestionsData = async () => {
  //   try {
  //     // console.log("Starting to fetch data from Firestore");
  //     // const subjectsRef = collection(db, "subjects")
  //     const questionsSnapshot = await getDocs(collection(db, "subjects")); // 取得科目集合
  //     // console.log("Got subjects snapshot:", questionsSnapshot);
  //     const questions = {};
  //     // 迭代每個科目文件
  //     for (const subjectDoc of questionsSnapshot.docs) {
  //       const subjectName = subjectDoc.id; // 科目名稱
  //       const subjectData = subjectDoc.data(); // 科目資料
  //       console.log(subjectDoc)
  //       console.log(subjectName, subjectData);

  //       questions[subjectName] = {};

  //       // 讀取每個科目的章節
  //       const chaptersSnapshot = await getDocs(collection(subjectDoc.ref, "chapters"));
        
  //       // 迭代每個章節
  //       for (const chapterDoc of chaptersSnapshot.docs) {
  //         const chapterName = chapterDoc.id;
  //         const chapterData = chapterDoc.data();
  //         questions[subjectName][chapterName] = [];
  //         console.log(chapterName, chapterData);

  //         // 讀取該章節下的問題
  //         const questionsInChapterSnapshot = await getDocs(collection(chapterDoc.ref, "questions"));
  //         questionsInChapterSnapshot.forEach((questionDoc) => {
  //           const questionData = questionDoc.data();
  //           console.log(questionData)
  //           questions[subjectName][chapterName].push(questionData); // 將問題資料儲存到對應的章節
  //         });
  //       }
  //     }

  //     setQuestionsData(questions); // 設定資料到 state

  //   } catch (error) {
  //     console.error("Error fetching questions: ", error);
  //   }
  // };
  const fetchQuestionsData = async () => {
    try {
      const questionsSnapshot = await getDocs(collection(db, "subjects"));
      const questions = {};
  
      // 處理所有 subject 的 Promise
      const subjectPromises = questionsSnapshot.docs.map(async (subjectDoc) => {
        const subjectName = subjectDoc.id;
        questions[subjectName] = {};
  
        // 平行處理章節
        const chaptersSnapshot = await getDocs(collection(subjectDoc.ref, "chapters"));
  
        const chapterPromises = chaptersSnapshot.docs.map(async (chapterDoc) => {
          const chapterName = chapterDoc.id;
          const questionsInChapterSnapshot = await getDocs(collection(chapterDoc.ref, "questions"));
          questions[subjectName][chapterName] = questionsInChapterSnapshot.docs.map(doc => doc.data());
        });
  
        await Promise.all(chapterPromises);
      });
  
      await Promise.all(subjectPromises);
      setQuestionsData(questions);
    } catch (error) {
      console.error("Error fetching questions: ", error);
    }
  };
  


  useEffect(() => {
    const fetchWrongQuestions = async () => {
      try {
        const wrongQuestionsSnapshot = await getDocs(
          collection(db, "subjects", subject, "chapters", chapter, "wrongQuestions")
        );
        const wrongQuestionsData = [];
        wrongQuestionsSnapshot.forEach((doc) => {
          wrongQuestionsData.push(doc.data());
        });
        setWrongQuestions(wrongQuestionsData); // 設定錯誤的題目資料
      } catch (error) {
        console.error("Error fetching wrong questions: ", error);
      }
    };

    fetchQuestionsData(); // 呼叫異步函數
    fetchWrongQuestions();
  }, [subject, chapter]); 

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
  const handleNavigateToQuiz = (subj, chap) => {
    navigate(`/quiz/${subj}/${chap}`);
  };

  // 處理導航到錯題頁面
  const handleNavigateToWrongQuestions = (subj, chap) => {
    navigate("/wrong-questions", {
      state: {
        wrongQuestions: wrongQuestions.filter((item) => item.chapter === chap),
        chapter: chap,
        subject: subj,
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
      <ul className="mt-4 flex justify-between w-full space-x-10 whitespace-nowrap px-2 scrollbar-hide sm:block lg:flex lg:space-x-10" id="nav">
      {/* <ul className="mt-4 flex w-full space-x-4 overflow-x-auto whitespace-nowrap px-2 scrollbar-hide sm:block lg:flex lg:space-x-10" id="nav"> */}
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
                <ul className="absolute left-0 mt-2 bg-white text-black shadow-md rounded w-40 p-2 group-hover:block opacity-0 group-hover:opacity-100 visibility-hidden group-hover:visible transition-all duration-300 max-h-60 overflow-y-auto z-100">

                  {Object.keys(questionsData[subj]).map((chap) => (
                    <li key={chap} className="mb-2">
                      <button
                        onClick={() => handleChapterSelection(chap)}
                        className="block w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                      >
                        <div className="block">{chap}</div>{" "}
                        {/* 顯示章節名稱並換行 */}
                        <div className="text-xs text-gray-500">
                          {questionsData[subj][chap].length} 題
                        </div>{" "}
                        {/* 顯示題數，顯示在下一行 */}
                      </button>
                      {chapter === chap && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleNavigateToQuiz(subj, chap)}
                            className="bg-yellow-500 text-white text-sm px-4 py-2 rounded"
                          >
                            測驗
                          </button>
                          <button
                            onClick={() =>
                              handleNavigateToWrongQuestions(subj, chap)
                            }
                            className="bg-red-500 text-white text-sm px-4 py-2 rounded"
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
          <li className="bg-blue-600 text-white px-6 py-2 rounded cursor-pointer ml-auto">
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
      {/* <div className="mt-20">
        <p>選擇的科目：{subject}</p>
        <p>選擇的章節：{chapter}</p>
      </div> */}
    </div>
  );
}
