import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">國考模擬系統</h1>
      <div>
        <h2 className="text-xl mb-4">選擇操作模式</h2>
        <div className="space-y-4">
          <Link
            to="/quiz"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded block text-center"
          >
            選擇科目並開始練習
          </Link>
          <Link
            to="/import"
            className="w-full bg-green-600 text-white px-4 py-2 rounded block text-center"
          >
            新增題目
          </Link>
        </div>
      </div>
    </div>
  );
}
