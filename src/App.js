import React from 'react';
import ImportTool from './components/ImportTool';
import QuizApp from './components/QuizApp';
import { Route, Routes } from 'react-router-dom';  // 引入 Router 所需要的部分
import './index.css';  // 確保這是正確的路徑
// import WrongQuestionsPage from './components/WrongQuestionsPage'; // 新增的錯誤題目頁面
import WrongQuizPage from './components/WrongQuizPage'; // 新增的錯誤題目頁面

import QuizPage from './components/QuizPage'; // 測驗頁面



function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<QuizApp />} />
        <Route path="/quiz/:subject/:chapter" element={<QuizPage />} /> {/* 測驗頁面 */}
        <Route path="/add-questions" element={<ImportTool />} />
        <Route path="/wrong-questions" element={<WrongQuizPage />} />
      </Routes>
      </div>
  );
}

export default App;
