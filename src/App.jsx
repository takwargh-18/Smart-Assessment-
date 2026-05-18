import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, CheckCircle, Calendar, MessageCircle, 
  ShieldAlert, Check, Pill, Hexagon, Leaf, Wine, Flame, HelpCircle,
  Award, Lightbulb, HeartPulse, Activity
} from 'lucide-react';

const drugs = [
  { name: 'ยาบ้า', Icon: Pill, color: 'text-rose-500', bg: 'bg-rose-100', desc: 'การประเมินจะช่วยให้เราวางแผนฟื้นฟูระบบประสาทได้อย่างถูกต้อง' },
  { name: 'ไอซ์', Icon: Hexagon, color: 'text-cyan-500', bg: 'bg-cyan-100', desc: 'ดูแลรักษาระบบสมองควบคู่กับสภาพจิตใจ' },
  { name: 'กัญชา', Icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-100', desc: 'ปรับสมดุลความจำและสมาธิให้กลับมาปกติ' },
  { name: 'เหล้า', Icon: Wine, color: 'text-amber-500', bg: 'bg-amber-100', desc: 'ลดความเสี่ยงโรคตับ และฟื้นฟูสุขภาพองค์รวม' },
  { name: 'บุหรี่', Icon: Flame, color: 'text-slate-600', bg: 'bg-slate-200', desc: 'ลดความเสี่ยงมะเร็งปอด และโรคหลอดเลือด' },
  { name: 'อื่นๆ', Icon: HelpCircle, color: 'text-purple-500', bg: 'bg-purple-100', desc: 'เราพร้อมให้คำปรึกษาเพื่อสุขภาพที่ดีขึ้นของคุณ' }
];

const titles = {
  1: 'ระบุสิ่งที่ต้องการประเมิน',
  2: 'อยากเลิกมากแค่ไหน?',
  3: 'มั่นใจว่าจะเลิกได้แค่ไหน?',
  4: 'สาเหตุหลักที่ทำให้ยังใช้',
  5: 'ประวัติการพยายามเลิก',
  6: 'ปัจจัยเสี่ยงในปัจจุบัน',
  7: 'สรุปผลการประเมินเบื้องต้น'
};

const reasonsOptions = ['เครียด', 'เพื่อนชวน', 'ต้องการพลังงานทำงาน', 'นอนไม่หลับ'];
const historyOptions = ['ไม่เคยลองเลย', 'เคยพยายามแล้ว'];
const risksOptions = ['คนรอบตัวยังใช้อยู่', 'หาซื้อได้ง่าย', 'ความเครียด/ปัญหาครอบครัว'];

export default function App() {
  const [step, setStep] = useState(1);
  const [drug, setDrug] = useState(null);
  const [otherDrug, setOtherDrug] = useState('');
  const [imp, setImp] = useState(null);
  const [conf, setConf] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [history, setHistory] = useState(null);
  const [risks, setRisks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [messageBox, setMessageBox] = useState(null);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Countdown timer for step 7
  useEffect(() => {
    let timer;
    if (step === 7) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            resetApp();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  const resetApp = () => {
    setStep(1);
    setDrug(null);
    setOtherDrug('');
    setImp(null);
    setConf(null);
    setReasons([]);
    setHistory(null);
    setRisks([]);
    setCountdown(15);
  };

  const toggleArray = (state, setter, value) => {
    if (state.includes(value)) {
      setter(state.filter((v) => v !== value));
    } else {
      setter([...state, value]);
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 1: return drug !== null && (drug.name !== 'อื่นๆ' || otherDrug.trim() !== '');
      case 2: return imp !== null;
      case 3: return conf !== null;
      case 4: return reasons.length > 0;
      case 5: return history !== null;
      case 6: return risks.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (canGoNext()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setStep(7);
      setCountdown(15);
    }, 1200);
  };

  const handleActionClick = (actionType) => {
    setMessageBox(`ระบบได้รับความประสงค์ "${actionType}" ของคุณเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับในไม่ช้าครับ/ค่ะ`);
  };

  const closeMessageBox = () => {
    setMessageBox(null);
    resetApp();
  };

  // ปรับไล่เฉดสีใหม่ให้ชัดเจนและตัดกับพื้นหลังมากขึ้น
  const getScaleStyle = (num, isActive) => {
    if (!isActive) return 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm';
    
    if (num === 1) return 'bg-gradient-to-b from-rose-500 to-rose-600 text-white border-transparent shadow-lg shadow-rose-500/40 scale-105';
    if (num === 2) return 'bg-gradient-to-b from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/40 scale-105';
    if (num === 3) return 'bg-gradient-to-b from-amber-400 to-amber-500 text-white border-transparent shadow-lg shadow-amber-500/40 scale-105';
    if (num === 4) return 'bg-gradient-to-b from-teal-400 to-teal-500 text-white border-transparent shadow-lg shadow-teal-500/40 scale-105';
    if (num === 5) return 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/40 scale-105';
  };

  // Prepare result data
  let resultData = {};
  if (imp >= 4 && conf >= 4) {
    resultData = {
      title: 'พร้อมเริ่มต้นใหม่ทันที',
      Icon: Award,
      iconClass: 'text-emerald-500 bg-emerald-100',
      titleClass: 'text-emerald-700',
      adviceBg: 'bg-emerald-50 border-emerald-200',
      adviceIconColor: 'text-emerald-600',
      adviceTextColor: 'text-emerald-800',
      advice: 'ยอดเยี่ยมมาก! คุณมีความตั้งใจที่ชัดเจน เราพร้อมช่วยคุณกำหนดวันเริ่มต้นและวางแผนไปด้วยกันแบบก้าวต่อก้าว',
      plan: 'กำหนดวันเริ่มเลิก (Quit date) และวางแผนติดตามผลอย่างใกล้ชิด'
    };
  } else if (imp >= 4) {
    resultData = {
      title: 'มีความตั้งใจ แต่อาจต้องการตัวช่วย',
      Icon: Lightbulb,
      iconClass: 'text-amber-500 bg-amber-100',
      titleClass: 'text-amber-700',
      adviceBg: 'bg-amber-50 border-amber-200',
      adviceIconColor: 'text-amber-600',
      adviceTextColor: 'text-amber-800',
      advice: 'การอยากเลิกคือจุดเริ่มต้นที่ยิ่งใหญ่ ความกังวลเป็นเรื่องปกติ เราสามารถหาตัวช่วยเสริมความมั่นใจให้คุณได้',
      plan: 'เน้นให้คำปรึกษาเพื่อเพิ่มความมั่นใจ (Self-confidence building)'
    };
  } else {
    resultData = {
      title: 'อยู่ในช่วงค่อยๆ ปรับตัว',
      Icon: HeartPulse,
      iconClass: 'text-blue-500 bg-blue-100',
      titleClass: 'text-blue-700',
      adviceBg: 'bg-blue-50 border-blue-200',
      adviceIconColor: 'text-blue-600',
      adviceTextColor: 'text-blue-800',
      advice: 'ไม่เป็นไรเลย! ค่อยๆ ทำความเข้าใจไปก่อน หากวันไหนพร้อมเมื่อไหร่ เรายินดีให้คำปรึกษาและอยู่เคียงข้างเสมอ',
      plan: 'สร้างความไว้วางใจ และให้ข้อมูลทางสุขภาพที่จำเป็น'
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 text-center flex items-center justify-center gap-3">
          {/* เรียกใช้ไฟล์รูปจากโฟลเดอร์ public */}
          <img 
            src="/logo.png" 
            alt="โลโก้โรงพยาบาล" 
            className="h-10 w-auto object-contain" 
          />
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            โรงพยาบาลพยาบาลสถานพระบารมี
          </h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        
        {/* Title & Progress */}
        <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">แบบประเมินความพร้อมในการเลิกสารเสพติด</h1>
          <h2 className="text-slate-500 font-medium text-sm mb-6">{titles[step]}</h2>
          
          
          
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out" 
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 animate-fade-in">
          
          {/* STEP 1: Select Drug */}
          {step === 1 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {drugs.map((d) => {
                  const isSelected = drug?.name === d.name;
                  return (
                    <button
                      key={d.name}
                      onClick={() => { 
                        setDrug(d); 
                        if (d.name !== 'อื่นๆ') {
                          setTimeout(() => setStep(2), 150); 
                        }
                      }}
                      className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 group ${
                        isSelected 
                        ? `border-blue-500 bg-blue-50/80 shadow-md shadow-blue-100 text-blue-800 transform scale-[1.02]` 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-3 rounded-full transition-colors ${isSelected ? d.bg : 'bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-sm'}`}>
                        <d.Icon size={32} strokeWidth={2.5} className={d.color} />
                      </div>
                      <span className="font-semibold text-base">{d.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input form for "อื่นๆ" */}
              {drug?.name === 'อื่นๆ' && (
                <div className="mt-2 p-5 bg-purple-50/80 border border-purple-200 rounded-2xl animate-fade-in flex flex-col gap-3">
                  <label className="font-semibold text-purple-800 flex items-center gap-2">
                    <HelpCircle size={18} /> โปรดระบุสิ่งที่ต้องการประเมิน
                  </label>
                  <input
                    type="text"
                    value={otherDrug}
                    onChange={(e) => setOtherDrug(e.target.value)}
                    placeholder="เช่น ยาแก้ไอ, กระท่อม, ทินเนอร์ ฯลฯ"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all text-slate-700"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (otherDrug.trim()) setStep(2);
                    }}
                    disabled={!otherDrug.trim()}
                    className="mt-2 w-full py-3.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 hover:shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                  >
                    ยืนยันและไปต่อ <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 & 3: Importance and Confidence */}
          {(step === 2 || step === 3) && (
            <div>
              <div className="bg-blue-50/60 text-blue-900 p-5 rounded-2xl text-center mb-8 border border-blue-100 flex flex-col items-center gap-3">
                <div className={`p-3 bg-white rounded-full shadow-sm`}>
                  {drug && <drug.Icon size={28} strokeWidth={2.5} className={drug.color} />}
                </div>
                <p className="font-medium text-sm sm:text-base leading-relaxed">
                  <span className="font-bold">{drug?.name === 'อื่นๆ' && otherDrug.trim() ? otherDrug : drug?.name} :</span> {drug?.desc}
                </p>
              </div>

              <div className="flex justify-between gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((num) => {
                  const currentScore = step === 2 ? imp : conf;
                  const isActive = currentScore === num;
                  return (
                    <button
                      key={num}
                      onClick={() => step === 2 ? setImp(num) : setConf(num)}
                      className={`flex flex-col items-center justify-center py-5 px-1 sm:px-2 sm:p-4 rounded-2xl border-2 w-full transition-all duration-200 ${getScaleStyle(num, isActive)}`}
                    >
                      <span className="text-2xl sm:text-3xl font-bold mb-1 font-sans">{num}</span>
                      <span className="text-xs sm:text-sm font-medium">ระดับ</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-400 font-medium mt-4 px-2">
                <span>1 (น้อยที่สุด)</span>
                <span>5 (มากที่สุด)</span>
              </div>
            </div>
          )}

          {/* STEP 4 & 6: Multiple Choice */}
          {(step === 4 || step === 6) && (
            <div className="flex flex-col gap-3 sm:gap-4">
              {(step === 4 ? reasonsOptions : risksOptions).map((opt) => {
                const isActive = (step === 4 ? reasons : risks).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => step === 4 ? toggleArray(reasons, setReasons, opt) : toggleArray(risks, setRisks, opt)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group ${
                      isActive 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium text-base">{opt}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-500/30' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      {isActive && <Check size={14} className="text-white stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 5: Single Choice (History) */}
          {step === 5 && (
            <div className="flex flex-col gap-3 sm:gap-4">
              {historyOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setHistory(opt); setTimeout(() => setStep(6), 150); }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between ${
                    history === opt 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 shadow-sm' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium text-base">{opt}</span>
                  <div className={`w-5 h-5 rounded-full border-2 transition-colors ${history === opt ? 'border-[6px] border-blue-600 bg-white shadow-sm shadow-blue-500/30' : 'border-slate-300'}`} />
                </button>
              ))}
            </div>
          )}

          {/* STEP 7: Result */}
          {step === 7 && (
            <div className="animate-fade-in">
              <div className="text-center pb-6 border-b border-dashed border-slate-200 mb-6">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 ${resultData.iconClass}`}>
                  <resultData.Icon size={40} strokeWidth={2} />
                </div>
                <h2 className={`text-2xl font-bold mb-4 ${resultData.titleClass}`}>{resultData.title}</h2>
                <div className="bg-slate-50 inline-flex rounded-full px-5 py-2.5 text-sm font-medium border border-slate-200">
                  <span className="text-slate-500">ความสำคัญ:</span> <span className="text-slate-800 font-bold ml-1.5 mr-4">{imp}/5</span>
                  <span className="text-slate-300 mr-4">|</span>
                  <span className="text-slate-500">ความมั่นใจ:</span> <span className="text-slate-800 font-bold ml-1.5">{conf}/5</span>
                </div>
              </div>

              <div className={`p-5 sm:p-6 rounded-2xl border mb-4 ${resultData.adviceBg}`}>
                <div className={`font-bold flex items-center gap-2 mb-2 ${resultData.adviceIconColor}`}>
                  <MessageCircle size={20} strokeWidth={2.5} /> ข้อแนะนำจากผู้เชี่ยวชาญ
                </div>
                <p className={`${resultData.adviceTextColor} leading-relaxed text-sm sm:text-base`}>{resultData.advice}</p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl border bg-slate-50 border-slate-200 mb-8">
                <div className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                  <ShieldAlert size={20} strokeWidth={2.5} className="text-slate-500" /> แผนการดูแลเบื้องต้น
                </div>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{resultData.plan}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleActionClick('นัดหมายพบแพทย์')}
                  className="py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <Calendar size={20} /> นัดหมายพูดคุยกับแพทย์
                </button>
                <button 
                  onClick={() => handleActionClick('ขอคำปรึกษาเพิ่มเติม')}
                  className="py-4 px-6 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} /> ขอรับคำปรึกษาผ่านแชท/โทร
                </button>
              </div>

              <div className="mt-8 text-center text-sm text-slate-500 font-medium bg-slate-100 py-3 rounded-xl">
                หน้าจอจะรีเซ็ตอัตโนมัติใน <span className="text-slate-800 font-bold text-lg mx-1">{countdown}</span> วินาที
              </div>
            </div>
          )}

          {/* Navigation Buttons (Step 2 - 6) */}
          {step > 1 && step < 7 && (
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={handleBack}
                className="flex-1 py-3.5 px-4 bg-white text-slate-600 font-medium rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> กลับ
              </button>
              
              {step < 6 && (
                <button 
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="flex-[2] py-3.5 px-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  ถัดไป <ArrowRight size={18} />
                </button>
              )}

              {step === 6 && (
                <button 
                  onClick={handleSave}
                  disabled={!canGoNext() || isLoading}
                  className="flex-[2] py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      กำลังประมวลผล...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">บันทึกและดูผล <Check size={18} /></span>
                  )}
                </button>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Custom Modal */}
      {messageBox && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-blue-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">สำเร็จ</h3>
            <p className="text-slate-600 font-medium mb-8 leading-relaxed">
              {messageBox}
            </p>
            <button 
              onClick={closeMessageBox}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}