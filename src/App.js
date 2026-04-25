import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, ArrowRight, ArrowLeft, Flame, TrendingUp, Sparkles, Target, Settings, Download, RefreshCw, X, Check, ChevronRight, Zap, MessageSquare, Volume2, Eye, BookOpen, Loader2 } from 'lucide-react';

const C = {
  bg: '#FAF6F0', bgWarm: '#F5EFE3', surface: '#FFFFFF',
  primary: '#E85D3C', primaryDark: '#C9482D', primaryLight: '#FFE4DA', primarySoft: '#FFF4ED',
  sage: '#4A6B5C', sageLight: '#E0EBE3',
  text: '#1F2421', textLight: '#3F4541', muted: '#7C7872',
  border: '#EBE3D5', borderLight: '#F2EBDD',
};

const GOALS = [
  { id: 'speaker', label: 'Better public speaker', emoji: '🎤', desc: 'Command attention on stage' },
  { id: 'presentation', label: 'Nail a presentation', emoji: '📊', desc: 'For a specific upcoming moment' },
  { id: 'confidence', label: 'Confident in meetings', emoji: '✨', desc: 'Show up with more presence' },
  { id: 'fillers', label: 'Reduce filler words', emoji: '🎯', desc: 'Cut the ums and likes' },
  { id: 'thinking', label: 'Think more clearly', emoji: '🧠', desc: 'Sharpen your mind by speaking' },
  { id: 'custom', label: 'Something else', emoji: '✏️', desc: 'Write your own goal' },
];

const STORAGE = {
  get: (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
  listSignups: () => { const r = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('signup:')) { try { r.push(JSON.parse(localStorage.getItem(k))); } catch {} } } return r; },
};

const Logo = ({ size = 64, animated = false }) => (
  <svg viewBox="0 0 64 64" width={size} height={size}>
    <circle cx="32" cy="32" r="28" fill="none" stroke={C.primary} strokeWidth="2.5" />
    <g style={animated ? { transformOrigin: '32px 32px', animation: 'mspin 60s linear infinite' } : {}}>
      <line x1="32" y1="32" x2="32" y2="9" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" />
    </g>
    <circle cx="32" cy="32" r="3.5" fill={C.primary} />
  </svg>
);

const Button = ({ children, onClick, variant = 'primary', disabled, fullWidth = true, icon, iconRight = true }) => {
  const styles = {
    primary: { background: disabled ? '#D9D5CC' : C.primary, color: 'white' },
    secondary: { background: C.surface, color: C.text, border: `1.5px solid ${C.border}` },
    ghost: { background: 'transparent', color: C.muted, padding: '8px 12px' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], padding: variant === 'ghost' ? '8px 12px' : '15px 24px', borderRadius: 14, fontSize: 16, fontWeight: 500, transition: 'all 0.2s', width: fullWidth ? '100%' : 'auto', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: variant === 'secondary' ? styles[variant].border : 'none' }}>
      {!iconRight && icon}{children}{iconRight && icon}
    </button>
  );
};

const Screen = ({ children }) => (
  <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: C.text }}>
    <div style={{ width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>{children}</div>
  </div>
);

const WelcomeScreen = ({ onNext }) => (
  <Screen>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 28px 32px', animation: 'fadeUp 0.6s ease' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <Logo size={80} animated />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 56, fontWeight: 400, letterSpacing: '-0.03em', margin: 0, color: C.text }}>minute</h1>
          <p style={{ fontSize: 17, color: C.muted, margin: '12px 0 0', fontWeight: 400, letterSpacing: '-0.01em' }}>Be the best communicator you can be.</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14, color: C.muted, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>One minute a day. Real feedback.<br/>Become measurably better at speaking.</p>
        <Button onClick={onNext} icon={<ArrowRight size={18} />}>Begin</Button>
      </div>
    </div>
  </Screen>
);

const Input = ({ label, value, onChange, placeholder, type = 'text', multiline, rows = 3 }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 13, color: C.textLight, fontWeight: 500 }}>{label}</span>
    {multiline ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', fontSize: 16, outline: 'none', fontFamily: 'inherit', color: C.text, resize: 'none' }} />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', fontSize: 16, outline: 'none', fontFamily: 'inherit', color: C.text }} />
    )}
  </label>
);

const SignupScreen = ({ onNext, onBack }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const valid = firstName.trim() && lastName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const submit = async () => {
    const user = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim().toLowerCase(), signedUpAt: new Date().toISOString() };
    STORAGE.set('user', user);
    STORAGE.set(`signup:${user.email}`, user);
    try {
      await fetch('https://formspree.io/f/REPLACE_WITH_YOUR_FORMSPREE_ID', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(user) });
    } catch {}
    onNext(user);
  };
  return (
    <Screen>
      <div style={{ padding: '24px 24px 0' }}><button onClick={onBack} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}><ArrowLeft size={22} /></button></div>
      <div style={{ flex: 1, padding: '24px 28px 32px', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 400, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Let's start with you</h2>
        <p style={{ color: C.muted, fontSize: 15, margin: '0 0 32px', lineHeight: 1.5 }}>Just your name and email. We'll keep you updated as Minute grows.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          <Input label="First name" value={firstName} onChange={setFirstName} placeholder="Mamad" />
          <Input label="Last name" value={lastName} onChange={setLastName} placeholder="Hormatipour" />
          <Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
        </div>
        <div style={{ marginTop: 24 }}>
          <Button onClick={submit} disabled={!valid} icon={<ArrowRight size={18} />}>Continue</Button>
          <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', margin: '12px 0 0' }}>By continuing, you agree to be a beta tester. Free for the first month.</p>
        </div>
      </div>
    </Screen>
  );
};

const GoalScreen = ({ onNext, onBack }) => {
  const [step, setStep] = useState('pick');
  const [selected, setSelected] = useState(null);
  const [context, setContext] = useState('');
  const pickGoal = (g) => { setSelected(g); setStep('context'); };
  const finish = () => { const goal = { ...selected, context: context.trim() }; STORAGE.set('goal', goal); onNext(goal); };
  if (step === 'context') {
    const isCustom = selected.id === 'custom';
    return (
      <Screen>
        <div style={{ padding: '24px 24px 0' }}><button onClick={() => setStep('pick')} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}><ArrowLeft size={22} /></button></div>
        <div style={{ flex: 1, padding: '24px 28px 32px', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{selected.emoji}</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{isCustom ? 'What do you want to work on?' : 'Tell us a bit more'}</h2>
          <p style={{ color: C.muted, fontSize: 15, margin: '0 0 28px', lineHeight: 1.5 }}>{isCustom ? 'Describe your goal in your own words.' : 'Optional, but it makes your feedback sharper.'}</p>
          <Input label={isCustom ? 'Your goal' : 'Context'} value={context} onChange={setContext} placeholder={isCustom ? 'I want to...' : 'Big board meeting next month...'} multiline rows={5} />
          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <Button onClick={finish} disabled={isCustom && !context.trim()} icon={<ArrowRight size={18} />}>{isCustom ? 'Continue' : (context.trim() ? 'Continue' : 'Skip for now')}</Button>
          </div>
        </div>
      </Screen>
    );
  }
  return (
    <Screen>
      <div style={{ padding: '24px 24px 0' }}><button onClick={onBack} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}><ArrowLeft size={22} /></button></div>
      <div style={{ flex: 1, padding: '24px 28px 32px', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 400, margin: '0 0 8px', letterSpacing: '-0.02em' }}>What's your goal?</h2>
        <p style={{ color: C.muted, fontSize: 15, margin: '0 0 24px', lineHeight: 1.5 }}>Pick one. You can always change this later.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GOALS.map((g) => (
            <button key={g.id} onClick={() => pickGoal(g)} style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'inherit' }}>
              <div style={{ fontSize: 24 }}>{g.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: C.text }}>{g.label}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{g.desc}</div>
              </div>
              <ChevronRight size={18} color={C.muted} />
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
};

const computeStreak = (sessions) => {
  if (!sessions.length) return 0;
  const dates = [...new Set(sessions.map(s => new Date(s.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const expected = new Date(new Date(dates[i - 1]).getTime() - 86400000).toDateString();
    if (dates[i] === expected) streak++; else break;
  }
  return streak;
};

const formatDate = (iso, short = false) => {
  const d = new Date(iso);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (!short) {
    if (d.toDateString() === today) return `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    if (d.toDateString() === yesterday) return `Yesterday, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const MiniTrend = ({ sessions }) => {
  const recent = sessions.slice(-7);
  const max = Math.max(...recent.map(s => s.scores?.overall || 0), 100);
  return (
    <div style={{ background: C.surface, borderRadius: 14, padding: 18, border: `1px solid ${C.borderLight}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60, marginBottom: 10 }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const s = recent[recent.length - 7 + i] || recent[i];
          const score = s?.scores?.overall || 0;
          const h = score ? Math.max(8, (score / max) * 60) : 4;
          return <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}><div style={{ height: h, background: score ? C.primary : C.borderLight, borderRadius: 4, opacity: score ? 1 : 0.4 }} /></div>;
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted }}>
        <span>Last 7 sessions</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: C.sage, fontWeight: 500 }}>
          <TrendingUp size={12} /> {sessions.length === 1 ? 'First minute!' : `Avg ${Math.round(recent.reduce((a, s) => a + (s.scores?.overall || 0), 0) / recent.length)}/100`}
        </span>
      </div>
    </div>
  );
};

const HomeScreen = ({ user, goal, sessions, onRecord, onProgress, onSettings }) => {
  const today = new Date().toDateString();
  const recordedToday = sessions.some(s => new Date(s.date).toDateString() === today);
  const streak = computeStreak(sessions);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <Screen>
      <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo size={32} />
        <button onClick={onSettings} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}><Settings size={22} /></button>
      </div>
      <div style={{ flex: 1, padding: '32px 28px 32px', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease' }}>
        <div>
          <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>{greeting},</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 400, margin: '4px 0 0', letterSpacing: '-0.02em' }}>{user.firstName}</h2>
        </div>
        {streak > 0 && (
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: C.surface, borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.borderLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.primary }}><Flame size={16} fill={C.primary} /><span style={{ fontSize: 22, fontWeight: 600 }}>{streak}</span></div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>day streak</div>
            </div>
            <div style={{ flex: 1, background: C.surface, borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.borderLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sage }}><Zap size={16} /><span style={{ fontSize: 22, fontWeight: 600 }}>{sessions.length}</span></div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>minutes practiced</div>
            </div>
          </div>
        )}
        <div style={{ marginTop: 28, background: recordedToday ? C.sageLight : C.primarySoft, borderRadius: 18, padding: 24, border: `1px solid ${recordedToday ? '#C9DAC8' : C.primaryLight}` }}>
          {recordedToday ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.sage, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={16} color="white" strokeWidth={3} /></div>
                <span style={{ fontWeight: 600, fontSize: 15, color: C.sage }}>Today's minute is in.</span>
              </div>
              <p style={{ color: C.textLight, fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 }}>Beautiful. Come back tomorrow to keep your streak alive.</p>
              <Button onClick={onRecord} variant="secondary" icon={<RefreshCw size={16} />}>Record again</Button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, color: C.primary, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today</p>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, margin: '6px 0 8px', letterSpacing: '-0.01em' }}>Take your minute.</h3>
              <p style={{ color: C.textLight, fontSize: 14, margin: '0 0 18px', lineHeight: 1.5 }}>Talk about anything. Your goal: <span style={{ fontWeight: 500 }}>{goal.label.toLowerCase()}</span>.</p>
              <Button onClick={onRecord} icon={<Mic size={18} />} iconRight={false}>Start recording</Button>
            </>
          )}
        </div>
        {sessions.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your progress</h3>
              <button onClick={onProgress} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>See all <ChevronRight size={14} /></button>
            </div>
            <MiniTrend sessions={sessions} />
          </div>
        )}
      </div>
    </Screen>
  );
};

const RecordScreen = ({ goal, onComplete, onCancel }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const framesRef = useRef([]);
  const intervalRef = useRef(null);
  const frameTimersRef = useRef([]);
  const [phase, setPhase] = useState('init');
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setPhase('ready');
      } catch (e) {
        setError('We need camera and microphone access. Please enable them in your browser settings and reload.');
      }
    })();
    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    frameTimersRef.current.forEach(t => clearTimeout(t));
    if (recorderRef.current?.state === 'recording') { try { recorderRef.current.stop(); } catch {} }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const captureFrame = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 240;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 320, 240);
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
  };

  const start = () => {
    setPhase('recording'); setTimeLeft(60);
    transcriptRef.current = ''; framesRef.current = []; setLiveTranscript('');
    try { const recorder = new MediaRecorder(streamRef.current); recorder.start(); recorderRef.current = recorder; } catch {}
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      try {
        const recognition = new SR();
        recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
        let finalText = '';
        recognition.onresult = (e) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
            else interim += e.results[i][0].transcript;
          }
          transcriptRef.current = finalText + interim;
          setLiveTranscript(finalText + interim);
        };
        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      } catch {}
    }
    [4000, 30000, 56000].forEach((delay) => {
      const t = setTimeout(() => { const f = captureFrame(); if (f) framesRef.current.push(f); }, delay);
      frameTimersRef.current.push(t);
    });
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(intervalRef.current); finishRecording(); return 0; } return t - 1; });
    }, 1000);
  };

  const finishRecording = () => {
    setPhase('done');
    if (recorderRef.current?.state === 'recording') { try { recorderRef.current.stop(); } catch {} }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setTimeout(() => onComplete({ transcript: transcriptRef.current.trim(), frames: framesRef.current }), 600);
  };

  const stopEarly = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    frameTimersRef.current.forEach(t => clearTimeout(t));
    const f = captureFrame(); if (f && framesRef.current.length < 3) framesRef.current.push(f);
    finishRecording();
  };

  if (error) {
    return (
      <Screen>
        <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <div style={{ fontSize: 40 }}>📷</div>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, margin: 0 }}>Camera access needed</h3>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.5, margin: 0 }}>{error}</p>
          <div style={{ marginTop: 12, width: '100%' }}><Button onClick={onCancel} variant="secondary">Back home</Button></div>
        </div>
      </Screen>
    );
  }

  return (
    <div style={{ background: '#0F1110', minHeight: '100vh', display: 'flex', justifyContent: 'center', color: 'white' }}>
      <div style={{ width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%)' }} />
        <div style={{ position: 'relative', padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => { cleanup(); onCancel(); }} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(10px)' }}><X size={20} /></button>
          {phase === 'recording' && (
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(10px)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF3B30', animation: 'pulse 1.2s ease-in-out infinite' }} />
              <span style={{ fontWeight: 600, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>0:{String(timeLeft).padStart(2, '0')}</span>
            </div>
          )}
          <div style={{ width: 40 }} />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {liveTranscript && phase === 'recording' && (
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: 14, fontSize: 14, lineHeight: 1.5, maxHeight: 100, overflow: 'hidden', color: 'rgba(255,255,255,0.95)' }}>{liveTranscript.slice(-180)}</div>
          )}
        </div>
        <div style={{ position: 'relative', padding: '24px 28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {phase === 'ready' && (
            <>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', margin: 0, lineHeight: 1.5, maxWidth: 280 }}>Talk about anything for one minute. Press the button when you're ready.</p>
              <button onClick={start} style={{ width: 76, height: 76, borderRadius: '50%', border: '4px solid white', background: C.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(232,93,60,0.4)' }}><div style={{ width: 28, height: 28, borderRadius: '50%', background: 'white' }} /></button>
            </>
          )}
          {phase === 'recording' && (
            <>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', margin: 0 }}>Tap to finish early</p>
              <button onClick={stopEarly} style={{ width: 76, height: 76, borderRadius: '50%', border: '4px solid white', background: C.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(232,93,60,0.4)' }}><Square size={26} fill="white" color="white" /></button>
            </>
          )}
          {phase === 'done' && <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: 14, backdropFilter: 'blur(12px)' }}><Loader2 size={18} style={{ animation: 'mspin 1s linear infinite' }} /><span style={{ fontSize: 15 }}>Wrapping up…</span></div>}
          {phase === 'init' && <div style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 10 }}><Loader2 size={18} style={{ animation: 'mspin 1s linear infinite' }} /><span>Starting camera…</span></div>}
        </div>
      </div>
    </div>
  );
};

const analyzeWithClaude = async ({ transcript, frames }, goal, apiKey) => {
  const hasTranscript = transcript && transcript.length > 5;
  const hasFrames = frames && frames.length > 0;
  const promptText = `You are an expert communication coach giving daily feedback to someone practicing for one minute.

Their goal: "${goal.label}"
${goal.context ? `Their specific context: "${goal.context}"` : ''}

${hasTranscript ? `Today they recorded a 1-minute video. Transcript:\n\n"${transcript}"` : 'Today they recorded a 1-minute video but we couldn\'t capture a transcript. Focus on body language and presence.'}

${hasFrames ? `${frames.length} still frames are attached above showing their posture, expression, body language.` : ''}

Be warm but honest. Be specific. Find what they did well AND one concrete improvement. Speak directly ("you"). Avoid sycophancy.

Respond ONLY with valid JSON (no markdown fences) in this schema:
{"scores":{"words":<0-100>,"voice":<0-100>,"structure":<0-100>,"bodyLanguage":<0-100>,"overall":<0-100>},"words":{"summary":"<1-2 sentences>","fillerWords":["<word>"],"swaps":[{"weak":"<phrase>","strong":"<better>","why":"<reason>"}],"highlights":["<strong phrase>"]},"voice":{"summary":"<1-2 sentences>","tip":"<tip>"},"structure":{"summary":"<1-2 sentences>","hook":"<assessment>","tip":"<tip>"},"bodyLanguage":{"summary":"<1-2 sentences>","tip":"<tip>"},"tomorrowsNudge":"<concrete action>","goalAlignment":"<1-2 sentences>","encouragement":"<short genuine sentence>"}`;

  const content = [];
  if (hasFrames) frames.forEach(f => content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: f } }));
  content.push({ type: 'text', text: promptText });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, messages: [{ role: 'user', content }] }),
  });
  if (!response.ok) throw new Error(`Analysis failed (${response.status}). Check your API key.`);
  const data = await response.json();
  const textBlock = data.content.find(c => c.type === 'text');
  if (!textBlock) throw new Error('No analysis returned.');
  return JSON.parse(textBlock.text.replace(/```json|```/g, '').trim());
};

const AnalyzingScreen = ({ data, goal, apiKey, onDone, onError }) => {
  const [stage, setStage] = useState(0);
  const stages = ['Listening to your words…', 'Analyzing your delivery…', 'Reading your body language…', 'Putting it together…'];
  useEffect(() => { const i = setInterval(() => setStage(s => Math.min(s + 1, stages.length - 1)), 1800); return () => clearInterval(i); }, []);
  useEffect(() => {
    (async () => {
      try {
        const result = await analyzeWithClaude(data, goal, apiKey);
        const session = { id: Date.now().toString(), date: new Date().toISOString(), transcript: data.transcript, goal, ...result };
        const existing = STORAGE.get('sessions') || [];
        const updated = [...existing, session];
        STORAGE.set('sessions', updated);
        onDone(session, updated);
      } catch (e) { onError(e.message || 'Analysis failed.'); }
    })();
  }, []);
  return (
    <Screen>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 32, animation: 'fadeUp 0.4s ease' }}>
        <Logo size={56} animated />
        <div style={{ textAlign: 'center', minHeight: 60 }}>
          <p style={{ fontSize: 13, color: C.primary, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Analyzing</p>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, margin: '8px 0 0', letterSpacing: '-0.01em' }} key={stage}>{stages[stage]}</h3>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>{stages.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i <= stage ? C.primary : C.borderLight, transition: 'all 0.4s' }} />)}</div>
      </div>
    </Screen>
  );
};

const ScoreBar = ({ score }) => {
  const color = score >= 75 ? C.sage : score >= 55 ? C.primary : '#D89D5C';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <div style={{ flex: 1, height: 4, background: C.borderLight, borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} /></div>
      <span style={{ fontSize: 12, color: C.muted, fontWeight: 500, minWidth: 28, textAlign: 'right' }}>{score}</span>
    </div>
  );
};

const SimpleSection = ({ summary, tip }) => (
  <>
    <p style={{ color: C.textLight, fontSize: 14, margin: '4px 0 12px', lineHeight: 1.55 }}>{summary}</p>
    {tip && <div style={{ background: C.bgWarm, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}><Sparkles size={14} color={C.primary} style={{ marginTop: 2, flexShrink: 0 }} /><p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{tip}</p></div>}
  </>
);

const WordsContent = ({ data }) => (
  <>
    <p style={{ color: C.textLight, fontSize: 14, margin: '4px 0 12px', lineHeight: 1.55 }}>{data.summary}</p>
    {data.fillerWords?.length > 0 && (
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filler words caught</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{data.fillerWords.map((w, i) => <span key={i} style={{ background: '#FFF0E8', color: C.primaryDark, padding: '4px 10px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>{w}</span>)}</div>
      </div>
    )}
    {data.swaps?.length > 0 && (
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try instead</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.swaps.map((s, i) => (
            <div key={i} style={{ background: C.bgWarm, borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: C.muted, textDecoration: 'line-through' }}>{s.weak}</span><ArrowRight size={12} color={C.muted} /><span style={{ color: C.text, fontWeight: 500 }}>{s.strong}</span>
              </div>
              {s.why && <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>{s.why}</p>}
            </div>
          ))}
        </div>
      </div>
    )}
    {data.highlights?.length > 0 && (
      <div>
        <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strong choices</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{data.highlights.map((h, i) => <span key={i} style={{ background: C.sageLight, color: C.sage, padding: '4px 10px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>{h}</span>)}</div>
      </div>
    )}
  </>
);

const StructureContent = ({ data }) => (
  <>
    <p style={{ color: C.textLight, fontSize: 14, margin: '4px 0 10px', lineHeight: 1.55 }}>{data.summary}</p>
    {data.hook && <div style={{ marginBottom: 10, padding: 10, background: C.bgWarm, borderRadius: 10 }}><p style={{ fontSize: 12, color: C.muted, fontWeight: 600, margin: '0 0 4px' }}>HOOK</p><p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{data.hook}</p></div>}
    {data.tip && <div style={{ background: C.primarySoft, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}><Sparkles size={14} color={C.primary} style={{ marginTop: 2, flexShrink: 0 }} /><p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{data.tip}</p></div>}
  </>
);

const FeedbackScreen = ({ session, onDone }) => {
  const [expanded, setExpanded] = useState(null);
  const sections = [
    { key: 'words', title: 'Words', icon: <MessageSquare size={18} />, score: session.scores.words, content: <WordsContent data={session.words} /> },
    { key: 'voice', title: 'Voice', icon: <Volume2 size={18} />, score: session.scores.voice, content: <SimpleSection summary={session.voice.summary} tip={session.voice.tip} /> },
    { key: 'structure', title: 'Structure', icon: <BookOpen size={18} />, score: session.scores.structure, content: <StructureContent data={session.structure} /> },
    { key: 'bodyLanguage', title: 'Body language', icon: <Eye size={18} />, score: session.scores.bodyLanguage, content: <SimpleSection summary={session.bodyLanguage.summary} tip={session.bodyLanguage.tip} /> },
  ];
  return (
    <Screen>
      <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'flex-end' }}><button onClick={onDone} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}><X size={22} /></button></div>
      <div style={{ flex: 1, padding: '12px 24px 32px', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
          <p style={{ fontSize: 13, color: C.primary, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Today's minute</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, margin: '8px 0' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 64, fontWeight: 400, letterSpacing: '-0.04em', color: C.text, lineHeight: 1 }}>{session.scores.overall}</span>
            <span style={{ fontSize: 16, color: C.muted, fontWeight: 400 }}>/100</span>
          </div>
          <p style={{ color: C.textLight, fontSize: 15, margin: '8px 16px 0', lineHeight: 1.5, fontStyle: 'italic' }}>"{session.encouragement}"</p>
        </div>
        <div style={{ background: C.primarySoft, borderRadius: 14, padding: 18, border: `1px solid ${C.primaryLight}`, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Sparkles size={16} color={C.primary} /><span style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try tomorrow</span></div>
          <p style={{ color: C.text, fontSize: 15, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{session.tomorrowsNudge}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.map(s => (
            <div key={s.key} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.borderLight}`, overflow: 'hidden' }}>
              <button onClick={() => setExpanded(expanded === s.key ? null : s.key)} style={{ width: '100%', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit', textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>{s.icon}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 500, color: C.text }}>{s.title}</div><ScoreBar score={s.score} /></div>
                <ChevronRight size={18} color={C.muted} style={{ transform: expanded === s.key ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
              {expanded === s.key && <div style={{ padding: '0 18px 18px' }}>{s.content}</div>}
            </div>
          ))}
        </div>
        {session.goalAlignment && (
          <div style={{ marginTop: 24, padding: 18, background: C.sageLight, borderRadius: 14, border: '1px solid #C9DAC8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Target size={16} color={C.sage} /><span style={{ fontSize: 12, color: C.sage, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Toward your goal</span></div>
            <p style={{ color: C.text, fontSize: 14, margin: 0, lineHeight: 1.55 }}>{session.goalAlignment}</p>
          </div>
        )}
        <div style={{ marginTop: 28 }}><Button onClick={onDone} icon={<Check size={18} />} iconRight={false}>Done</Button></div>
      </div>
    </Screen>
  );
};

const StatCard = ({ icon, value, label, color }) => (
  <div style={{ background: C.surface, borderRadius: 12, padding: '14px 16px', border: `1px solid ${C.borderLight}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color }}>{icon}<span style={{ fontSize: 22, fontWeight: 600, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>{value}</span></div>
    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</div>
  </div>
);

const BigChart = ({ sessions }) => {
  const data = sessions.slice(-14);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
        {data.map((s, i) => { const h = Math.max(6, (s.scores.overall / 100) * 100); return <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}><div style={{ height: h + '%', background: `linear-gradient(180deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, borderRadius: 3 }} title={`${s.scores.overall}/100`} /></div>; })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: C.muted }}>
        <span>{data.length > 0 ? formatDate(data[0].date, true) : ''}</span><span>{data.length > 0 ? formatDate(data[data.length - 1].date, true) : 'Today'}</span>
      </div>
    </div>
  );
};

const ProgressScreen = ({ sessions, onBack, onSession }) => {
  const streak = computeStreak(sessions);
  const avgRecent = sessions.length >= 1 ? Math.round(sessions.slice(-7).reduce((a, s) => a + (s.scores?.overall || 0), 0) / Math.min(sessions.length, 7)) : 0;
  const avgEarly = sessions.length >= 8 ? Math.round(sessions.slice(0, 7).reduce((a, s) => a + (s.scores?.overall || 0), 0) / 7) : null;
  const delta = avgEarly !== null ? avgRecent - avgEarly : null;
  return (
    <Screen>
      <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}><ArrowLeft size={22} /></button>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>Your progress</h2>
      </div>
      <div style={{ flex: 1, padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <StatCard icon={<Flame size={18} fill={C.primary} color={C.primary} />} value={streak} label="day streak" color={C.primary} />
          <StatCard icon={<Zap size={18} color={C.sage} />} value={sessions.length} label="minutes" color={C.sage} />
          <StatCard icon={<TrendingUp size={18} color={C.text} />} value={avgRecent} label="avg score (last 7)" color={C.text} />
          <StatCard icon={<Sparkles size={18} color={delta > 0 ? C.sage : C.muted} />} value={delta !== null ? (delta > 0 ? `+${delta}` : delta) : '—'} label="vs first 7" color={delta > 0 ? C.sage : C.text} />
        </div>
        {sessions.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 14, padding: 18, border: `1px solid ${C.borderLight}`, marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, color: C.muted, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score over time</h3>
            <BigChart sessions={sessions} />
          </div>
        )}
        <h3 style={{ fontSize: 13, color: C.muted, fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent sessions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...sessions].reverse().map(s => (
            <button key={s.id} onClick={() => onSession(s)} style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: C.primary }}>{s.scores.overall}</span></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{formatDate(s.date)}</div><div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.tomorrowsNudge?.slice(0, 50)}{s.tomorrowsNudge?.length > 50 ? '…' : ''}</div></div>
              <ChevronRight size={16} color={C.muted} />
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
};

const Section = ({ title, children }) => (<div style={{ marginBottom: 20 }}><h3 style={{ fontSize: 12, color: C.muted, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div></div>);
const Row = ({ label, value }) => (<div style={{ background: C.surface, borderRadius: 12, padding: 14, border: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 13, color: C.muted }}>{label}</span><span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{value}</span></div>);

const SettingsScreen = ({ user, goal, onClose, onLogout, onChangeGoal }) => {
  const [tapCount, setTapCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const tapTitle = () => { const c = tapCount + 1; setTapCount(c); if (c >= 5) setShowAdmin(true); };
  const exportSignups = () => {
    const all = STORAGE.listSignups();
    const csv = 'First Name,Last Name,Email,Signed Up\n' + all.map(u => `${u.firstName},${u.lastName},${u.email},${u.signedUpAt}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `minute-signups-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Screen>
      <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 onClick={tapTitle} style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, margin: 0, letterSpacing: '-0.02em', cursor: 'default', userSelect: 'none' }}>Settings</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}><X size={22} /></button>
      </div>
      <div style={{ flex: 1, padding: '20px 24px 32px', animation: 'fadeUp 0.4s ease' }}>
        <Section title="Profile"><Row label="Name" value={`${user.firstName} ${user.lastName}`} /><Row label="Email" value={user.email} /></Section>
        <Section title="Goal">
          <button onClick={onChangeGoal} style={{ width: '100%', background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 12, padding: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{goal.emoji}</span><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500 }}>{goal.label}</div>{goal.context && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{goal.context.slice(0, 60)}{goal.context.length > 60 ? '…' : ''}</div>}</div><ChevronRight size={16} color={C.muted} />
          </button>
        </Section>
        <Section title="Subscription">
          <div style={{ background: C.primarySoft, borderRadius: 12, padding: 16, border: `1px solid ${C.primaryLight}` }}>
            <div style={{ fontSize: 13, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Free trial</div>
            <p style={{ fontSize: 14, margin: '6px 0 0', color: C.text, lineHeight: 1.5 }}>Your first month is on us. After that, Minute is $10/month.</p>
          </div>
        </Section>
        {showAdmin && <Section title="Admin"><Button onClick={exportSignups} variant="secondary" icon={<Download size={16} />} iconRight={false}>Export signups (CSV)</Button></Section>}
        <div style={{ marginTop: 28 }}><Button onClick={onLogout} variant="secondary">Sign out</Button></div>
        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 24 }}>minute · beta v0.1</p>
      </div>
    </Screen>
  );
};

const ApiKeyScreen = ({ onSave }) => {
  const [key, setKey] = useState('');
  const save = () => { if (key.trim().startsWith('sk-ant-')) { STORAGE.set('apiKey', key.trim()); onSave(key.trim()); } };
  return (
    <Screen>
      <div style={{ flex: 1, padding: '40px 28px 32px', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease' }}>
        <Logo size={48} />
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, margin: '24px 0 8px', letterSpacing: '-0.02em' }}>One quick setup step</h2>
        <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px', lineHeight: 1.55 }}>Minute uses Claude AI for analysis. Paste your Anthropic API key (starts with <code style={{ background: C.bgWarm, padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>sk-ant-</code>). Get one free at console.anthropic.com. Stored only on your device.</p>
        <Input label="API Key" value={key} onChange={setKey} placeholder="sk-ant-..." />
        <div style={{ marginTop: 'auto', paddingTop: 24 }}><Button onClick={save} disabled={!key.trim().startsWith('sk-ant-')} icon={<ArrowRight size={18} />}>Continue</Button></div>
      </div>
    </Screen>
  );
};

const ErrorScreen = ({ message, onRetry, onHome }) => (
  <Screen>
    <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 16 }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, margin: 0 }}>Something went off-track</h3>
      <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.5, margin: 0, maxWidth: 320 }}>{message}</p>
      <div style={{ marginTop: 12, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {onRetry && <Button onClick={onRetry} icon={<RefreshCw size={16} />} iconRight={false}>Try again</Button>}
        <Button onClick={onHome} variant="secondary">Back home</Button>
      </div>
    </div>
  </Screen>
);

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [user, setUser] = useState(null);
  const [goal, setGoal] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [apiKey, setApiKey] = useState(null);
  const [recordingData, setRecordingData] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const u = STORAGE.get('user'); const g = STORAGE.get('goal'); const s = STORAGE.get('sessions') || []; const k = STORAGE.get('apiKey');
    if (u) setUser(u); if (g) setGoal(g); setSessions(s); if (k) setApiKey(k);
    if (!k) setScreen('apiKey'); else if (u && g) setScreen('home'); else if (u) setScreen('goal'); else setScreen('welcome');
  }, []);

  const handleLogout = () => { STORAGE.del('user'); STORAGE.del('goal'); STORAGE.del('sessions'); setUser(null); setGoal(null); setSessions([]); setScreen('welcome'); };

  const styleTag = (<style>{`@keyframes mspin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.92)}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}input,textarea,button{font-family:inherit}button:active{transform:scale(.98)}`}</style>);

  if (screen === 'loading') return <>{styleTag}<Screen><div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Logo size={48} animated /></div></Screen></>;

  return (<>
    {styleTag}
    {screen === 'apiKey' && <ApiKeyScreen onSave={(k) => { setApiKey(k); setScreen(user && goal ? 'home' : user ? 'goal' : 'welcome'); }} />}
    {screen === 'welcome' && <WelcomeScreen onNext={() => setScreen('signup')} />}
    {screen === 'signup' && <SignupScreen onNext={(u) => { setUser(u); setScreen('goal'); }} onBack={() => setScreen('welcome')} />}
    {screen === 'goal' && <GoalScreen onNext={(g) => { setGoal(g); setScreen('home'); }} onBack={() => setScreen(user ? 'home' : 'signup')} />}
    {screen === 'home' && <HomeScreen user={user} goal={goal} sessions={sessions} onRecord={() => setScreen('record')} onProgress={() => setScreen('progress')} onSettings={() => setScreen('settings')} />}
    {screen === 'record' && <RecordScreen goal={goal} onComplete={(d) => { setRecordingData(d); setScreen('analyzing'); }} onCancel={() => setScreen('home')} />}
    {screen === 'analyzing' && <AnalyzingScreen data={recordingData} goal={goal} apiKey={apiKey} onDone={(s, u) => { setCurrentSession(s); setSessions(u); setScreen('feedback'); }} onError={(m) => { setError(m); setScreen('error'); }} />}
    {screen === 'feedback' && currentSession && <FeedbackScreen session={currentSession} onDone={() => setScreen('home')} />}
    {screen === 'progress' && <ProgressScreen sessions={sessions} onBack={() => setScreen('home')} onSession={(s) => { setCurrentSession(s); setScreen('feedback'); }} />}
    {screen === 'settings' && <SettingsScreen user={user} goal={goal} onClose={() => setScreen('home')} onLogout={handleLogout} onChangeGoal={() => setScreen('goal')} />}
    {screen === 'error' && <ErrorScreen message={error} onRetry={recordingData ? () => setScreen('analyzing') : null} onHome={() => { setError(null); setScreen('home'); }} />}
  </>);
}
