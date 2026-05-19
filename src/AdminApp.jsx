import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Calendar, MessageCircle, ShieldAlert, Pill, 
  Hexagon, Leaf, Wine, Flame, HelpCircle, Award, Lightbulb, 
  HeartPulse, FileText, BarChart3, Search, Filter, Phone, 
  RefreshCw, Users, AlertTriangle, Check, Lock, LogOut, Eye, EyeOff
} from 'lucide-react';

// ==========================================
// 🔴 นำ URL ของ Web App จาก Google Apps Script มาวางตรงนี้
// ⚠️ ต้องเป็นลิงก์ /exec เท่านั้น ไม่ใช่ลิงก์ /edit ของ Sheets
// ==========================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgC9rWpNHmynaTk_b8YB9p5QDGcuvnisBcthzX6VTWFBtKTUlssK41eUVENIu6_M4feA/exec';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'PSM11288';
const ADMIN_AUTH_KEY = 'smartAssessmentAdminAuth';

const normalizePhoneFromSheet = (value) => String(value || '').replace(/^'/, '');
const WAITING_STATUS = 'รอติดต่อ';

const normalizeSheetRow = (item) => ({
  id: item.ID || item.id || '',
  date: item['วันที่'] || item.date || '',
  nickname: item['ชื่อเล่น'] || item.nickname || '',
  drug: item['ประเภท'] || item.drug || '',
  imp: Number(item['ความสำคัญ'] || item.imp) || 0,
  conf: Number(item['ความมั่นใจ'] || item.conf) || 0,
  phase: item['ระยะ'] || item.phase || '',
  reasons: item['สาเหตุ'] || item.reasons || '',
  history: item['ประวัติ'] || item.history || '',
  risks: item['ความเสี่ยง'] || item.risks || '',
  notes: item['บันทึก'] || item.notes || '',
  contact: normalizePhoneFromSheet(item['เบอร์โทร'] || item.contact),
  status: item['สถานะ'] || item.status || WAITING_STATUS
});

const hasAssessmentDetails = (record) => Boolean(
  record.nickname ||
  record.drug ||
  record.contact ||
  record.date ||
  record.imp ||
  record.conf ||
  record.phase ||
  record.reasons ||
  record.history ||
  record.risks
);

const mergeSheetRows = (rawData) => {
  const byId = new Map();
  const noIdRows = [];

  rawData.map(normalizeSheetRow).forEach((record) => {
    if (!record.id) {
      noIdRows.push(record);
      return;
    }

    const existing = byId.get(record.id);
    if (!existing) {
      byId.set(record.id, record);
      return;
    }

    const detailRecord = hasAssessmentDetails(record) ? record : existing;
    const statusRecord = record.status !== WAITING_STATUS || !existing.status ? record : existing;
    const notesRecord = record.notes ? record : existing;

    byId.set(record.id, {
      ...existing,
      ...Object.fromEntries(
        Object.entries(detailRecord).filter(([, value]) => value !== '' && value !== 0)
      ),
      id: record.id,
      status: statusRecord.status || WAITING_STATUS,
      notes: notesRecord.notes || ''
    });
  });

  return [...byId.values(), ...noIdRows].filter(hasAssessmentDetails);
};

export default function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [records, setRecords] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrug, setFilterDrug] = useState('ทั้งหมด');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // โหลดข้อมูลอัตโนมัติเมื่อเปิดหน้า
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated]);

  const handleLogin = (event) => {
    event.preventDefault();

    if (loginUsername.trim() === ADMIN_USERNAME && loginPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setLoginError('');
      setLoginPassword('');
      return;
    }

    setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setRecords([]);
    setSelectedRecord(null);
    setAppointmentModal(false);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
  };

  // ✅ ฟังก์ชันดึงข้อมูล
 const fetchRecords = async () => {

  setIsFetching(true);

  try {

    const response = await fetch(GOOGLE_SCRIPT_URL);

    const rawData = await response.json();

    const mergedData = mergeSheetRows(rawData);
    setRecords(mergedData);
    setLastUpdated(new Date().toLocaleString('th-TH'));
    return;

    // ✅ แปลงชื่อคอลัมน์ภาษาไทย → อังกฤษ
    const normalizedData = rawData.map(item => ({

  id: item.ID || '',

  date: item['วันที่'] || '',

  nickname: item['ชื่อเล่น'] || '',

  drug: item['ประเภท'] || '',

  imp: Number(item['ความสำคัญ']) || 0,

  conf: Number(item['ความมั่นใจ']) || 0,

  phase: item['ระยะ'] || '',

  reasons: item['สาเหตุ'] || '',

  history: item['ประวัติ'] || '',

  risks: item['ความเสี่ยง'] || '',

  notes: item['บันทึก'] || '',

  contact: normalizePhoneFromSheet(item['เบอร์โทร']),

  status: item['สถานะ'] || 'รอติดต่อ'

}));

    setRecords(normalizedData);

    setLastUpdated(
      new Date().toLocaleString('th-TH')
    );

  } catch (error) {

    console.error(
      "Error fetching records:",
      error
    );

    setRecords([]);

  } finally {

    setIsFetching(false);

  }
};

  // ✅ อัปเดตสถานะ
  const updateRecordStatus = async (id, newStatus) => {

    setAppointmentModal(false);

    // Optimistic Update
    setRecords(
      records.map(r =>
        r.id === id
          ? { ...r, status: newStatus }
          : r
      )
    );

    setSelectedRecord(null);

    try {
      await postToSheet({
        action: 'updateStatus',
        id,
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  // ระบบกรองข้อมูล
  const filteredRecords = records.filter(r => {
    const safeNotes = String(r.notes || '').toLowerCase();

    const safeContact = String(r.contact || '').toLowerCase();

    const safeDrugName = String(
      r.drug === 'อื่นๆ'
        ? (r.otherDrug || '')
        : (r.drug || '')
      ).toLowerCase();

    const safeSearchTerm = String(searchTerm || '').toLowerCase();

    const matchSearch = safeNotes.includes(safeSearchTerm) || 
                        safeContact.includes(safeSearchTerm) ||
                        safeDrugName.includes(safeSearchTerm);
    const matchFilter = filterDrug === 'ทั้งหมด' || r.drug === filterDrug;
    return matchSearch && matchFilter;
  });

  // คำนวณสถิติ
  const stats = {
    total: records.length,
    waiting: records.filter(r => r.status === 'รอติดต่อ').length,
    ready: records.filter(r => r.imp >= 4 && r.conf >= 4).length,
    needHelp: records.filter(r => r.imp >= 4 && r.conf < 4).length,
  };

  // ฟังก์ชันแปลง String เป็น Array สำหรับแสดงผล (แก้บัคจากโค้ดเดิม)
  const formatList = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    return str.split(',').map(s => s.trim()).filter(s => s);
  };
  const postToSheet = async (payload) => {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    return response.text();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center px-4" style={{ fontFamily: "'Prompt', sans-serif" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        `}} />
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/70 p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Lock size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">เข้าสู่ระบบเจ้าหน้าที่</h1>
              <p className="text-sm text-slate-500 mt-1">ระบบจัดการข้อมูลประเมิน</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อผู้ใช้</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => {
                  setLoginUsername(e.target.value);
                  setLoginError('');
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="px-4 py-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-semibold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-colors"
            >
              เข้าสู่แดชบอร์ด
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-indigo-900 text-white shadow-md">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ShieldAlert size={24} className="text-indigo-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                ระบบจัดการข้อมูลประเมิน
              </h1>
              <p className="text-indigo-300 text-xs font-medium">โรงพยาบาลพยาบาลสถานพระบารมี</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {lastUpdated && <span className="text-xs text-indigo-300 hidden sm:inline-block">อัปเดตล่าสุด: {lastUpdated}</span>}
            <button 
              onClick={fetchRecords} 
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin text-indigo-300" : ""} />
              <span className="hidden sm:inline-block">{isFetching ? 'กำลังซิงค์...' : 'รีเฟรช'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg font-medium text-sm transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline-block">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        
        {/* Stats Cards - Modern Redesign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Card 1: Total */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-500/30 text-white group hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300">
            <Users className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner border border-white/10">
                  <Users className="text-white w-6 h-6" />
                </div>
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">ภาพรวม</span>
              </div>
              <div>
                <div className="text-4xl font-black font-sans tracking-tight mb-1">{stats.total}</div>
                <h4 className="text-blue-100 text-sm font-medium">เคสประเมินทั้งหมด</h4>
              </div>
            </div>
          </div>

          {/* Card 2: Waiting */}
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 p-6 rounded-3xl shadow-lg shadow-rose-500/30 text-white group hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/40 transition-all duration-300">
            <AlertTriangle className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner border border-white/10">
                  <AlertTriangle className="text-white w-6 h-6" />
                </div>
                {stats.waiting > 0 && <span className="text-xs font-bold bg-white text-rose-600 px-3 py-1 rounded-full shadow-md animate-pulse">ด่วนที่สุด</span>}
              </div>
              <div>
                <div className="text-4xl font-black font-sans tracking-tight mb-1">{stats.waiting}</div>
                <h4 className="text-rose-100 text-sm font-medium">รอการติดต่อกลับ</h4>
              </div>
            </div>
          </div>

          {/* Card 3: Ready */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-3xl shadow-lg shadow-emerald-500/30 text-white group hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300">
            <Award className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner border border-white/10">
                  <Award className="text-white w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-black font-sans tracking-tight mb-1">{stats.ready}</div>
                <h4 className="text-emerald-100 text-sm font-medium">พร้อมเริ่มเลิกทันที</h4>
              </div>
            </div>
          </div>

          {/* Card 4: Need Help */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-3xl shadow-lg shadow-amber-500/30 text-white group hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300">
            <Lightbulb className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner border border-white/10">
                  <Lightbulb className="text-white w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-black font-sans tracking-tight mb-1">{stats.needHelp}</div>
                <h4 className="text-amber-100 text-sm font-medium">ต้องการตัวช่วยเสริม</h4>
              </div>
            </div>
          </div>

        </div>

        {/* Main Data Table Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <FileText className="text-slate-500" size={20} />
              <h3 className="font-bold text-slate-800">รายการรับประเมินล่าสุด</h3>
              <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs font-bold ml-2">{filteredRecords.length} รายการ</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex items-center w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหาบันทึก หรือเบอร์โทร..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
                />
              </div>
              <div className="relative flex items-center w-full sm:w-48">
                <Filter size={16} className="absolute left-3.5 text-slate-400" />
                <select 
                  value={filterDrug} 
                  onChange={(e) => setFilterDrug(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="ทั้งหมด">สารเสพติด: ทั้งหมด</option>
                  <option value="ยาบ้า">ยาบ้า</option>
                  <option value="ไอซ์">ไอซ์</option>
                  <option value="กัญชา">กัญชา</option>
                  <option value="เหล้า">เหล้า</option>
                  <option value="บุหรี่">บุหรี่</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {isFetching && records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
                <RefreshCw size={40} className="animate-spin mb-4" />
                <p className="font-semibold text-slate-600">กำลังซิงค์ข้อมูลจากฐานข้อมูล...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-6">ชื่อเล่น</th>
                    <th className="py-4 px-6">สถานะดำเนินการ</th>
                    <th className="py-4 px-6">วันที่รับเรื่อง</th>
                    <th className="py-4 px-6">สารที่ประเมิน</th>
                    <th className="py-4 px-6 text-center">ระดับความเสี่ยง (1-5)</th>
                    <th className="py-4 px-6">เบอร์ติดต่อ</th>
                    <th className="py-4 px-6 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FileText size={48} className="mb-4 opacity-20" />
                          <p className="font-medium text-base text-slate-500">ไม่พบข้อมูล หรือซิงค์ข้อมูลไม่สำเร็จ</p>
                          <p className="text-xs mt-2">โปรดตรวจสอบการเชื่อมต่อ URL หรือลองรีเฟรชหน้าจอ</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => {
                      const isWaiting = r.status === 'รอติดต่อ';
                      const isDoctorRequest = r.status === 'ขอนัดหมายคุยกับแพทย์';
                      const isConsultRequest = r.status === 'ขอรับคำปรึกษาผ่านแชท/โทร';
                      const stColor = isWaiting
                        ? 'bg-rose-100 text-rose-700 border-rose-200'
                        : isDoctorRequest
                          ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                          : isConsultRequest
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : r.status === 'นัดหมายแล้ว'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-emerald-100 text-emerald-700 border-emerald-200';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors group">

  {/* 👤 ชื่อเล่น */}
  <td className="py-4 px-6">
    <div className="font-bold text-slate-800">
      {r.nickname || '-'}
    </div>
  </td>

  {/* 📌 สถานะ */}
  <td className="py-4 px-6">
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stColor} flex items-center gap-1.5 w-max`}>
      {isWaiting && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
      )}
      {r.status}
    </span>
  </td>

  {/* 📅 วันที่ */}
  <td className="py-4 px-6 font-medium text-slate-600 font-sans">
    {r.date}
  </td>

  {/* 💊 สารเสพติด */}
  <td className="py-4 px-6">
    <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
      {r.drug === 'อื่นๆ' && r.otherDrug
        ? r.otherDrug
        : r.drug}
    </span>
  </td>

  {/* 📊 คะแนน */}
  <td className="py-4 px-6 text-center">
    <div className="inline-flex items-center bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
      <span className={`font-bold font-sans ${r.imp >= 4 ? 'text-rose-600' : 'text-slate-600'}`}>
        {r.imp}
      </span>

      <span className="text-slate-300 font-normal mx-1">
        |
      </span>

      <span className={`font-bold font-sans ${r.conf >= 4 ? 'text-emerald-600' : 'text-slate-600'}`}>
        {r.conf}
      </span>
    </div>
  </td>

  {/* ☎️ เบอร์โทร */}
  <td className="py-4 px-6 font-mono text-slate-700 font-medium">
    {r.contact || '-'}
  </td>

  {/* 🔍 ปุ่ม */}
  <td className="py-4 px-6 text-right">
    <button
      onClick={() => setSelectedRecord(r)}
      className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg font-semibold transition-colors shadow-sm group-hover:shadow"
    >
      เปิดดูเคส
    </button>
  </td>

</tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* ════════════════════ MODAL: รายละเอียดเคส ════════════════════ */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-0 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={20} /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">จัดการนัดหมายและประเมิน</h3>
                  <p className="text-xs text-slate-500 font-medium font-sans mt-0.5">รับเรื่อง: {selectedRecord.date}</p>
                  <p className="text-sm text-indigo-600 font-semibold mt-1">
                    ผู้ประเมิน: {selectedRecord.nickname || '-'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {appointmentModal ? (
                // ---------------- วิว: อัปเดตสถานะ ----------------
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-sm font-bold text-slate-500 mb-1">เบอร์ติดต่อสำหรับเคสนี้</div>
                    <div className="text-3xl font-mono text-indigo-600 font-bold tracking-wider">{selectedRecord.contact}</div>
                  </div>
                  
                  <h4 className="font-bold text-slate-700 mt-2 flex items-center gap-2">
                    <CheckCircle size={18} className="text-indigo-500"/> อัปเดตสถานะการดำเนินการลงฐานข้อมูล
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => updateRecordStatus(selectedRecord.id, 'นัดหมายแล้ว')} className="p-4 border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 text-left flex justify-between items-center transition-colors">
                      นัดหมายคิวแพทย์เรียบร้อยแล้ว <Calendar size={20} />
                    </button>
                    <button onClick={() => updateRecordStatus(selectedRecord.id, 'ให้คำปรึกษาแล้ว')} className="p-4 border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 text-left flex justify-between items-center transition-colors">
                      ให้คำปรึกษาจบในแชท/โทร <MessageCircle size={20} />
                    </button>
                    <button onClick={() => updateRecordStatus(selectedRecord.id, 'รอติดต่อ')} className="p-4 border border-rose-200 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 text-left flex justify-between items-center transition-colors">
                      รอการติดต่อกลับ (รอดำเนินการ) <AlertTriangle size={20} />
                    </button>
                  </div>
                  
                  <button onClick={() => setAppointmentModal(false)} className="mt-2 py-3 text-slate-500 font-semibold hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    ย้อนกลับ
                  </button>
                </div>
              ) : (
                // ---------------- วิว: ดูข้อมูล ----------------
                <div className="flex flex-col gap-6 animate-fade-in">
                  
                  {/* กล่องเบอร์โทรและสถานะ */}
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                    <div>
                      <div className="text-sm text-indigo-600 font-bold mb-1">เบอร์โทรติดต่อผู้รับประเมิน</div>
                      <div className="font-bold text-2xl font-mono text-indigo-900 flex items-center gap-2"><Phone size={20} className="text-indigo-500" /> {selectedRecord.contact}</div>
                    </div>
                    <button 
                      onClick={() => setAppointmentModal(true)} 
                      className="px-5 py-3 sm:py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      ปรับสถานะ <Check size={18} />
                    </button>
                  </div>

                  {/* สรุปคะแนน */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 md:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 font-bold mb-1">สารที่รับประเมิน</div>
                      <div className="font-bold text-lg text-slate-800">{selectedRecord.drug}</div>
                    </div>
                    <div className="col-span-2 md:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 font-bold mb-1">ระยะความพร้อม</div>
                      <div className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight">{selectedRecord.phase}</div>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                      <div className="text-xs text-rose-500 font-bold mb-1">ความสำคัญ (อยากเลิก)</div>
                      <div className="text-3xl font-black font-sans text-rose-600">{selectedRecord.imp}<span className="text-sm text-rose-400 font-normal">/5</span></div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                      <div className="text-xs text-emerald-500 font-bold mb-1">ความมั่นใจ</div>
                      <div className="text-3xl font-black font-sans text-emerald-600">{selectedRecord.conf}<span className="text-sm text-emerald-400 font-normal">/5</span></div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full my-2"></div>

                  {/* ข้อมูลเชิงลึก */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <div>
                        <div className="text-sm text-slate-500 font-bold mb-2 flex items-center gap-1.5"><HelpCircle size={16}/> สาเหตุหลักที่ยังใช้</div>
                        <div className="flex flex-wrap gap-2">
                          {formatList(selectedRecord.reasons).length > 0 
                            ? formatList(selectedRecord.reasons).map(v => <span key={v} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs">✓ {v}</span>) 
                            : <span className="text-slate-400 text-sm italic">ไม่ได้ระบุ</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 font-bold mb-2 flex items-center gap-1.5"><Calendar size={16}/> ประวัติการพยายามเลิก</div>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-semibold text-xs">
                          {selectedRecord.history || 'ไม่ได้ระบุ'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <div className="text-sm text-slate-500 font-bold mb-2 flex items-center gap-1.5"><AlertTriangle size={16}/> ปัจจัยเสี่ยงปัจจุบัน</div>
                        <div className="flex flex-wrap gap-2">
                          {formatList(selectedRecord.risks).length > 0 
                            ? formatList(selectedRecord.risks).map(v => <span key={v} className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg font-medium text-xs">⚠️ {v}</span>) 
                            : <span className="text-slate-400 text-sm italic">ไม่ได้ระบุ</span>}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-slate-500 font-bold mb-2 flex items-center gap-1.5"><FileText size={16}/> บันทึกจากผู้รับประเมิน</div>
                        <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-slate-800 text-sm min-h-[60px]">
                          {selectedRecord.notes ? `"${selectedRecord.notes}"` : <span className="text-slate-400 italic">ไม่มีข้อความฝากถึงเจ้าหน้าที่</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
