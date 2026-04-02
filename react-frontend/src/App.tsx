import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Excel2Json from './pages/Excel2Json.tsx';
import Json2Excel from './pages/Json2Excel.tsx';
import AddPrefixes2Expression from './pages/AddPrefixes2Expression.tsx';
import JsonStringify from './pages/JsonStringify.tsx';
import Base64ToExcel from './pages/Base64ToExcel.tsx';
import Response2Excel from './pages/Response2Excel.tsx';
import SqlMinifier from './pages/SqlMinifier.tsx';
import DataCleaner from './pages/DataCleaner.tsx';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Excel2Json />} />
          <Route path="json2excel" element={<Json2Excel />} />
          <Route path="stringify" element={<JsonStringify />} />
          <Route path="b64toexcel" element={<Base64ToExcel />} />
          <Route path="ap2e" element={<AddPrefixes2Expression />} />
          <Route path="resp2excel" element={<Response2Excel />} />
          <Route path="sqlmin" element={<SqlMinifier />} />
          <Route path="cleaner" element={<DataCleaner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
