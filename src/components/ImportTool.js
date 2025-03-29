import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, doc, setDoc } from "../firebase"; // 引入 Firebase 配置

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

  // 儲存題目到 Firestore
  const saveToFirebase = async () => {
    // 檢查是否有完整的題目資料
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
      // 儲存至 Firebase Firestore 的結構：科目 -> 章節 -> 問題
      const subjectRef = doc(db, "subjects", subject);  // 科目資料夾
      const chapterRef = doc(subjectRef, "chapters", chapter);  // 章節資料夾
      const questionRef = doc(chapterRef, "questions", question);  // 問題資料

      // 使用 setDoc 將資料儲存到 Firestore
      await setDoc(questionRef, newQuestion);
      
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");
      setExplanation("");
      setConfirmSaved(true);
      console.log("Document written with ID: ", questionRef.id);
      alert("題目已儲存到 Firebase！");

    } catch (e) {
      console.error("Error adding document: ", e);
      alert("儲存 Firebase 失敗");
    }
  };

  // 上傳資料夾中的多個 JSON 檔案至 Firebase
  const handleFolderUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) {
      alert("請選擇至少一個 JSON 檔案");
      return;
    }

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData = JSON.parse(reader.result);
          console.log("Processing file: ", file.name);

          // 儲存科目、章節及問題到 Firebase
          for (const subjectName in fileData) {
            // 創建科目資料夾
            const subjectRef = doc(collection(db, "subjects"), subjectName);
            await setDoc(subjectRef, { name: subjectName });
          
            for (const chapterName in fileData[subjectName]) {
              // 創建章節資料夾，並設置為 "chapters" 子集合中的文檔
              const chapterRef = doc(collection(subjectRef, "chapters"), chapterName);
              await setDoc(chapterRef, { name: chapterName });
          
              for (const questionData of fileData[subjectName][chapterName]) {
                // 儲存每個問題資料作為 "questions" 子集合中的文檔
                const questionRef = doc(collection(chapterRef, "questions"));
                await setDoc(questionRef, questionData);
              }
            }
          }
          // alert(`檔案 ${file.name} 已成功上傳至 Firebase！`);
        } catch (error) {
          alert("上傳 JSON 檔案失敗: " + error.message);
        }
      };
      reader.readAsText(file);
    }
    alert(`全部檔案已成功上傳至 Firebase！`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={goToHomePage} className="bg-yellow-500 text-white px-4 py-2 rounded">回首頁</button>

      <h2 className="text-xl font-bold mb-4">新增題目</h2>

      {/* 上傳 JSON 檔案，允許選擇資料夾 */}
      <input type="file" accept="application/JSON" onChange={handleFolderUpload} multiple webkitdirectory className="mb-4" />

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

      <button onClick={saveToFirebase} className="bg-green-600 text-white px-4 py-2 rounded ml-4">儲存至 Firebase</button>

      {confirmSaved && <p className="text-green-700 mt-2">✅ 題目已儲存到本機資料庫！</p>}
    </div>
  );
}
