import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, addDoc } from "../firebase"; // 引入 Firebase 配置

const storedQuestionsKey = "customQuestions";

export default function ImportTool() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState(""); // 用來儲存用戶選擇的科目
  const [chapter, setChapter] = useState(""); // 用來儲存用戶選擇的章節
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]); // 預設四個選項
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [confirmSaved, setConfirmSaved] = useState(false);
  const [existingData, setExistingData] = useState({}); // 用來儲存從 localStorage 讀取的資料

  useEffect(() => {
    // 讀取現有的題庫資料
    const data = JSON.parse(localStorage.getItem(storedQuestionsKey) || "{}");
    setExistingData(data); // 設置 existingData
  }, []);
  
  const goToHomePage = () => {
    navigate("/"); // 返回首頁路徑
  };

  // 更新選項
  const handleOptionChange = (e, index) => {
    const newOptions = [...options];
    newOptions[index] = e.target.value;
    setOptions(newOptions);
  };

  // 儲存題目到 Firebase Firestore
  const saveToFirebase = async () => {
    if (!subject || !chapter || !question || !answer || !explanation) {
      alert("請完整填寫題目、選項、答案和解析");
      return;
    }

    const newQuestion = {
      question,
      options,
      answer,
      explanation,
    };

    try {
      // 儲存至 Firestore (collection name: questions)
      const docRef = await addDoc(collection(db, "questions"), newQuestion);
      console.log("Document written with ID: ", docRef.id);
      alert("題目已儲存到 Firebase！");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("儲存 Firebase 失敗");
    }
  };

  // 儲存題目到 localStorage
  const saveToLocalStorage = () => {
    if (!subject || !chapter || !question || !answer || !explanation) {
      alert("請完整填寫題目、選項、答案和解析");
      return;
    }

    const newQuestion = {
      question,
      options,
      answer,
      explanation,
    };

    const questionsDataFromStorage = { ...existingData };

    // 如果科目不存在，則新增科目
    if (!questionsDataFromStorage[subject]) {
      questionsDataFromStorage[subject] = {};
    }

    // 如果章節不存在，則新增章節
    if (!questionsDataFromStorage[subject][chapter]) {
      questionsDataFromStorage[subject][chapter] = [];
    }

    // 將新題目加入章節的題目列表
    questionsDataFromStorage[subject][chapter].push(newQuestion);

    // 儲存更新後的題庫資料到 localStorage
    localStorage.setItem(storedQuestionsKey, JSON.stringify(questionsDataFromStorage));

    // 清除表單並顯示成功訊息
    setQuestion("");
    setOptions(["", "", "", ""]);
    setAnswer("");
    setExplanation("");
    setConfirmSaved(true);

    console.log("Updated questionsData: ", questionsDataFromStorage);
    alert("題目已儲存到 localStorage！");
  };

  // 上傳 JSON 檔案至 Firebase
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("請選擇一個 JSON 檔案");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = JSON.parse(reader.result);
        // 儲存 JSON 資料到 Firebase
        for (const subjectName in fileData) {
          for (const chapterName in fileData[subjectName]) {
            for (const questionData of fileData[subjectName][chapterName]) {
              await addDoc(collection(db, "questions"), questionData);
            }
          }
        }
        alert("JSON 檔案已成功上傳至 Firebase！");
      } catch (error) {
        alert("上傳 JSON 檔案失敗: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={goToHomePage} className="bg-yellow-500 text-white px-4 py-2 rounded">回首頁</button>

      <h2 className="text-xl font-bold mb-4">新增題目</h2>

      {/* 上傳 JSON 檔案 */}
      <input type="file" accept="application/JSON" onChange={handleFileUpload} className="mb-4" />

      {/* 選擇科目 */}
      <div className="mb-4">
        <label className="block font-semibold">選擇科目</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
          <option value="">-- 選擇科目 --</option>
          {Object.keys(existingData).map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {/* 選擇章節 */}
      {subject && (
        <div className="mb-4">
          <label className="block font-semibold">選擇章節</label>
          <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
            <option value="">-- 選擇章節 --</option>
            {Object.keys(existingData[subject] || {}).map((chap) => (
              <option key={chap} value={chap}>{chap}</option>
            ))}
          </select>
        </div>
      )}

      {/* 題目輸入框 */}
      <div className="mb-4">
        <label className="block font-semibold">題目</label>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="請輸入題目" />
      </div>

      {/* 選項輸入框 */}
      <div className="mb-4">
        <label className="block font-semibold">選項</label>
        {options.map((opt, index) => (
          <div key={index} className="flex items-center mb-2">
            <input type="text" value={opt} onChange={(e) => handleOptionChange(e, index)} className="w-1/4 p-2 border border-gray-300 rounded mr-2" placeholder={`選項 ${String.fromCharCode(65 + index)}`} />
          </div>
        ))}
      </div>

      {/* 答案與解析 */}
      <div className="mb-4">
        <label className="block font-semibold">正確答案</label>
        <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="輸入正確答案（例如：A）" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">解析</label>
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="請輸入解析" />
      </div>

      <button onClick={saveToLocalStorage} className="bg-blue-600 text-white px-4 py-2 rounded">保存題目</button>

      <button onClick={saveToFirebase} className="bg-green-600 text-white px-4 py-2 rounded ml-4">儲存至 Firebase</button>

      {confirmSaved && <p className="text-green-700 mt-2">✅ 題目已儲存到本機資料庫！</p>}
    </div>
  );
}
