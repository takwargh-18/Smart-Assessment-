import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'            // หน้าแบบประเมินสำหรับคนทั่วไป
import AdminApp from './AdminApp.jsx'  // หน้าแดชบอร์ดสำหรับแอดมินที่เราเพิ่งสร้าง
import './index.css'

// เช็คว่าลิงก์ที่เข้ามีคำว่า /admin ต่อท้ายหรือไม่
const currentPath = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ถ้าเข้า /admin ให้โชว์หน้า AdminApp แต่ถ้าเข้าปกติให้โชว์หน้า App */}
    {currentPath === '/admin' ? <AdminApp /> : <App />}
  </React.StrictMode>,
)
