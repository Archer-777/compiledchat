import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { 
  MessageSquare, ArrowLeft, Send, Mic, MicOff, Zap, Flame, Menu, X, 
  PlusCircle, Cpu, User, Heart, Download, FileText, CheckCircle2, 
  ChevronDown, ChevronUp, Terminal, Wrench, Clock, Sparkles, Check, 
  Play, Loader2, Code, Activity, Layers, CornerDownRight, Bell, BellRing, BellOff 
} from 'lucide-react';
import { getChatSessions, saveChatSession, getChatMessagesForSession, generateUUID, getUserData } from '../utils/storage';
import { generateTwinJwt } from '../utils/twinJwt';
import Modal from '../components/common/Modal';
import './DigitalTwinChatScreen.css';

// Configure marked with GitHub Flavored Markdown (tables, task lists, breaks)
marked.setOptions({
  gfm: true,
  breaks: true,
});

const TWIN_API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL)
  ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')}/api/v1/twin`
  : 'http://localhost:4000/api/v1/twin';

// Audio chime using standard Web Audio API (No external audio file dependencies)
function playTaskCompleteChime() {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Harmonic note 1 (E5 - 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Harmonic note 2 (A5 - 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch (e) {}
}

// Request Desktop Notification Permission
async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return Notification.permission;
  }
}

// Notify user via browser Notification, Audio chime, and tab title flash
function notifyTaskComplete(taskTitle, durationStr, runId) {
  playTaskCompleteChime();

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const titleClean = taskTitle ? taskTitle.substring(0, 60) + (taskTitle.length > 60 ? '...' : '') : 'Task';
      const notif = new Notification('Digital Twin: Task Finished! ✨', {
        body: `Your twin completed "${titleClean}" in ${durationStr}. Click to view outputs & generated files.`,
        icon: '/logo_in_white.svg',
        tag: `twin-task-${runId || Date.now()}`,
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {}
  }

  // Flash tab title if document is hidden / tab switched
  if (typeof document !== 'undefined' && document.hidden) {
    const originalTitle = document.title;
    let flashes = 0;
    const flashInterval = setInterval(() => {
      document.title = (flashes % 2 === 0) ? '✨ (1) Task Complete!' : originalTitle;
      flashes++;
      if (flashes > 10) {
        clearInterval(flashInterval);
        document.title = originalTitle;
      }
    }, 800);
    const onFocus = () => {
      clearInterval(flashInterval);
      document.title = originalTitle;
      window.removeEventListener('focus', onFocus);
    };
    window.addEventListener('focus', onFocus);
  }
}

// Full GitHub-Flavored Markdown to HTML parser
function renderMarkdown(text) {
  if (!text) return '';
  if (typeof text !== 'string') text = String(text);
  try {
    return marked.parse(text);
  } catch (e) {
    console.warn('Markdown parsing error:', e);
    return text;
  }
}

// User avatar matching the orange sunflower eyes and smile
function UserAvatar() {
  return (
    <div className="user-avatar-circle" style={{ overflow: 'hidden', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/user_icon.svg" alt="User Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function ProfileIconSvg() {
  return (
    <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/user_icon.svg" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

// --- Live Running Execution Progress Card ---
function LiveProgressCard({ activeRun, showLogs, setShowLogs, notifPermission, onRequestNotif }) {
  if (!activeRun || !activeRun.isActive) return null;
  const elapsedSec = activeRun.elapsedMs / 1000;
  const secondsStr = elapsedSec.toFixed(1);

  return (
    <div className="twin-live-progress-card">
      {/* Top Bar with Live Indicator, Timer, and Percent */}
      <div className="twin-progress-top-bar">
        <div className="twin-progress-brand">
          <div className="twin-pulse-indicator" />
          <span className="twin-progress-label">Live Agent Execution</span>
        </div>
        <div className="twin-progress-meta-pills">
          <div className="twin-timer-pill">
            <Clock size={11} />
            <span>{secondsStr}s</span>
          </div>
          <div className="twin-percent-pill">
            {Math.round(activeRun.percent)}%
          </div>
        </div>
      </div>

      {/* Progress Track with Glowing Shimmer */}
      <div className="twin-progress-track">
        <div 
          className="twin-progress-bar-fill" 
          style={{ width: `${Math.min(100, Math.max(6, activeRun.percent))}%` }} 
        />
      </div>

      {/* Dynamic Status Headline */}
      <div className="twin-status-headline">
        <Loader2 size={15} className="spinner-icon" />
        <span>{activeRun.statusMessage || 'Processing digital twin workspace...'}</span>
      </div>

      {/* Notification Permission Opt-In Prompt (Before & During Long Runs) */}
      {notifPermission === 'default' && (
        <div className="twin-notif-prompt-card">
          <div className="twin-notif-info">
            <Bell size={14} color="#00e5ff" />
            <span>Tasks can take 2–5 mins. Notify me when done?</span>
          </div>
          <button 
            type="button" 
            className="twin-notif-action-btn"
            onClick={onRequestNotif}
          >
            <BellRing size={12} />
            <span>Enable Alert</span>
          </button>
        </div>
      )}

      {notifPermission === 'granted' && (
        <div className="twin-notif-enabled-badge">
          <Check size={13} color="#10b981" />
          <span>Alerts active • You can switch tabs or minimize freely</span>
        </div>
      )}

      {/* Informative Guidance for Long-Running Tasks (>45s & >2 mins) */}
      {elapsedSec > 120 ? (
        <div className="twin-extended-task-notice">
          <div className="twin-extended-icon-pulse">
            <Clock size={16} color="#00e5ff" />
          </div>
          <div className="twin-extended-text">
            <div className="twin-extended-title">
              ⏳ Extended Multi-Step Task ({Math.floor(elapsedSec / 60)}m {(elapsedSec % 60).toFixed(0)}s elapsed)
            </div>
            <div className="twin-extended-desc">
              Deep tool execution, data analysis, and report generation typically take 2 to 5+ minutes. You can safely switch tabs or minimize; we will send you a desktop notification and audio chime the second it finishes!
            </div>
            {notifPermission === 'default' && (
              <button 
                type="button" 
                className="twin-extended-enable-btn"
                onClick={onRequestNotif}
              >
                <BellRing size={12} />
                <span>Enable Completion Alert</span>
              </button>
            )}
            {notifPermission === 'granted' && (
              <div className="twin-extended-granted-tag">
                <Check size={12} color="#10b981" />
                <span>Desktop notification armed • Ready to alert you</span>
              </div>
            )}
          </div>
        </div>
      ) : elapsedSec > 45 ? (
        <div className="twin-long-task-notice">
          <Clock size={14} className="notice-icon" />
          <div>
            <strong>Deep Neural Synthesis in Progress:</strong> Multi-step tool runs and document builds typically take 2–5 minutes. Your task is executing smoothly in the background.
          </div>
        </div>
      ) : null}

      {/* Active Tool Calling Banner */}
      {activeRun.currentTool && (
        <div className="twin-active-tool-banner">
          <div className="twin-active-tool-header">
            <div className="twin-tool-name-tag">
              <Wrench size={13} color="#c084fc" />
              <span>Tool: {activeRun.currentTool.name || 'neural_executor'}</span>
            </div>
            <div className="twin-tool-status-badge">
              {activeRun.currentTool.status || 'Executing'}
            </div>
          </div>
          {activeRun.currentTool.input && (
            <div className="twin-tool-preview">
              <code>{activeRun.currentTool.input}</code>
            </div>
          )}
        </div>
      )}

      {/* Milestone Step Checklist */}
      <div className="twin-steps-pipeline">
        {activeRun.steps && activeRun.steps.map((step) => (
          <div key={step.id} className={`twin-step-item step-${step.status}`}>
            <div className={`step-icon-badge badge-${step.status}`}>
              {step.status === 'completed' ? (
                <Check size={11} strokeWidth={3} />
              ) : step.status === 'active' ? (
                <Loader2 size={11} strokeWidth={3} />
              ) : (
                <span style={{ fontSize: '9px' }}>○</span>
              )}
            </div>
            <span>{step.label}</span>
          </div>
        ))}
      </div>

      {/* Collapsible Activity Logs Drawer */}
      {activeRun.logs && activeRun.logs.length > 0 && (
        <div>
          <button 
            type="button" 
            className="twin-logs-toggle-btn" 
            onClick={() => setShowLogs(!showLogs)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Terminal size={12} color="#00e5ff" />
              <span>Activity Logs & Tool Events ({activeRun.logs.length})</span>
            </span>
            {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showLogs && (
            <div className="twin-logs-terminal" style={{ marginTop: '6px' }}>
              {activeRun.logs.map((log, idx) => (
                <div key={idx} className="twin-log-line">
                  <span className="twin-log-time">[{log.time}]</span>
                  <span className={`twin-log-text log-${log.type || 'info'}`}>{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Completed Works Summary Card (Attached to Completed Message) ---
function CompletedWorksSummary({ works }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!works) return null;

  return (
    <div className="twin-works-summary-card">
      <div className="twin-works-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="twin-works-title">
          <Zap size={13} color="#00e5ff" />
          <span>Works Done & Tools Invoked</span>
        </div>
        <div className="twin-works-meta">
          <span>{works.stepsCount || 4} steps • {works.duration || '2.4s'}</span>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </div>
      {isOpen && (
        <div className="twin-works-body">
          {works.tools && works.tools.length > 0 && (
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px', fontSize: '11px' }}>Tools Executed:</div>
              <div className="twin-tools-used-row">
                {works.tools.map((t, idx) => (
                  <div key={idx} className="twin-tool-chip">
                    <CheckCircle2 size={11} color="#34d399" />
                    <span>{typeof t === 'string' ? t : t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {works.steps && Array.isArray(works.steps) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              {works.steps.map((st, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)' }}>
                  <Check size={11} color="#10b981" />
                  <span>{st.label || st}</span>
                </div>
              ))}
            </div>
          )}
          {works.iterations > 1 && (
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10.5px' }}>
              Completed in {works.iterations} execution cycles • Zero errors
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DigitalTwinChatScreen() {
  const navigate = useNavigate();
  const [currentSessionId, setCurrentSessionId] = useState(() => generateUUID());
  const [recentSessions, setRecentSessions] = useState([]);
  const [userProfileName, setUserProfileName] = useState('Archer');
  const [twinAvatarPhoto, setTwinAvatarPhoto] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [inputText, setInputText] = useState('');
  const [twinName, setTwinName] = useState('Digital Twin');
  const [userAuthKey, setUserAuthKey] = useState('guest');
  const [isThinking, setIsThinking] = useState(false);
  const [activeRun, setActiveRun] = useState(null);
  const [showLiveLogs, setShowLiveLogs] = useState(false);
  const [showTopNotifBanner, setShowTopNotifBanner] = useState(true);
  const [showNotifModal, setShowNotifModal] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const alreadyPrompted = window.localStorage.getItem('@twin_notif_modal_prompted');
      return Notification.permission === 'default' && !alreadyPrompted;
    }
    return false;
  });
  const [notifPermission, setNotifPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const handleRequestNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      setShowTopNotifBanner(false);
      setShowNotifModal(false);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('@twin_notif_modal_prompted', 'true');
      }
    }
  };
  const [messages, setMessages] = useState([
    { id: '1', sender: 'twin', text: "Hello! I'm your Digital Twin. Ask me anything — I can create files, write code, analyze data, and more." },
  ]);
  const [stars, setStars] = useState([]);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions(null, 'twin');
      if (Array.isArray(sessions)) {
        setRecentSessions(sessions);
      }
    } catch (e) {}
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('@spiritual_digital_twin_profile');
        if (raw) {
          const p = JSON.parse(raw);
          if (p && p.avatarImage) setTwinAvatarPhoto(p.avatarImage);
        }
      }
      
      // Force Twin Name to First Name + 2.0 and generate JWT token
      getUserData().then(async user => {
        if (user) {
          const firstName = user.firstName || user.first_name || (user.full_name ? user.full_name.split(' ')[0] : '');
          const displayName = firstName || (user.fullName ? user.fullName.split(' ')[0] : '') || 'Guest';
          setTwinName(`${displayName !== 'Guest' ? displayName : 'User'} 2.0`);
          const token = await generateTwinJwt(user);
          setUserAuthKey(token);
        }
      }).catch(e => {});
    } catch (e) {}
  }, []);

  const isSmallScreen = windowWidth < 960;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate random twinkling stars across the entire screen
  useEffect(() => {
    const starList = Array.from({ length: 140 }, (_, i) => {
      const isBright = Math.random() > 0.75;
      const isCyan = Math.random() > 0.85;
      const sizeNum = isBright ? 1.5 + Math.random() * 1.5 : 0.8 + Math.random() * 1.2;
      return {
        id: i,
        left: `${(Math.random() * 100).toFixed(2)}%`,
        top: `${(Math.random() * 100).toFixed(2)}%`,
        size: `${sizeNum.toFixed(2)}px`,
        duration: `${(2 + Math.random() * 4.5).toFixed(2)}s`,
        delay: `${(Math.random() * 6).toFixed(2)}s`,
        isBright,
        isCyan,
      };
    });
    setStars(starList);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchLatestAccount = async () => {
      try {
        const user = await getUserData();
        if (!isMounted) return;
        const displayName = (user && (user.firstName || (user.fullName ? user.fullName.split(' ')[0] : 'User'))) || 'Archer';
        setUserProfileName(displayName);
        setIsGuest(!user || !user.email);

        // Generate verified JWT with 'sub' claim
        const jwtToken = await generateTwinJwt(user || { firstName: displayName });
        if (isMounted) {
          setUserAuthKey(jwtToken);
        }
      } catch (e) {
        if (isMounted) {
          setUserProfileName('Archer');
          setIsGuest(true);
          const fallbackToken = await generateTwinJwt({ firstName: 'Archer' });
          setUserAuthKey(fallbackToken);
        }
      }
      loadSessions();
    };

    fetchLatestAccount();

    if (typeof window !== 'undefined') {
      window.addEventListener('chat-sessions-changed', loadSessions);
      return () => {
        isMounted = false;
        window.removeEventListener('chat-sessions-changed', loadSessions);
      };
    }

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (showMobileDrawer) {
      loadSessions();
    }
  }, [showMobileDrawer]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectSession = async (sessionItem) => {
    if (!sessionItem || !sessionItem.id) return;
    setCurrentSessionId(sessionItem.id);
    let msgs = sessionItem.messages;
    if (!msgs || msgs.length === 0) {
      msgs = await getChatMessagesForSession(sessionItem.id);
    }
    if (msgs && msgs.length > 0) {
      setMessages(msgs);
    }
  };

  const handleNewChatSession = () => {
    const newId = generateUUID();
    setCurrentSessionId(newId);
    setMessages([
      { id: '1', sender: 'twin', text: 'Hello! Welcome to your Digital Twin Workspace. How can I assist you today?' },
    ]);
  };

  const handleFileDownload = async (e, url, fileName) => {
    e.preventDefault();
    try {
      let activeToken = userAuthKey;
      if (!activeToken || !activeToken.includes('.')) {
        const user = await getUserData();
        activeToken = await generateTwinJwt(user || { firstName: userProfileName });
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Blob download failed, falling back:', err);
      window.open(url, '_blank');
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    // Prompt for notification permission at start of task if not already decided
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission().then(p => setNotifPermission(p));
    }

    const textToSend = inputText.trim();
    const userMsgId = 'user_' + Date.now();
    const newMsg = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      sessionId: currentSessionId,
    };

    // Snapshot existing session files before this run begins
    const existingSessionFiles = new Set();
    messages.forEach(m => {
      if (Array.isArray(m.files)) {
        m.files.forEach(f => {
          const fn = typeof f === 'string' ? f : (f.name || f.filename || '');
          if (fn) existingSessionFiles.add(fn.toLowerCase());
        });
      }
    });

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsThinking(true);

    const startTime = Date.now();
    const initialSteps = [
      { id: '1', label: 'Prompt Ingestion & Context Mapping', status: 'active' },
      { id: '2', label: 'Agent Reasoning & Tool Selection', status: 'pending' },
      { id: '3', label: 'Tool Invocation & Neural Execution', status: 'pending' },
      { id: '4', label: 'Artifact Compilation & Output Generation', status: 'pending' },
    ];

    const initialRunState = {
      isActive: true,
      runId: '',
      percent: 14,
      statusMessage: 'Analyzing intent & semantic context...',
      currentTool: null,
      toolsInvoked: [],
      steps: initialSteps,
      logs: [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), text: 'Dispatched task to Digital Twin Engine', type: 'info' }],
      startTime,
      elapsedMs: 0,
      iterations: 1,
    };
    setActiveRun(initialRunState);

    // Dynamic progress timer ticker every 100ms with progressive milestones
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setActiveRun(prev => {
        if (!prev || !prev.isActive) return prev;
        
        let newPercent = prev.percent;
        let newSteps = prev.steps.map(s => ({ ...s }));
        let newStatus = prev.statusMessage;
        let newTool = prev.currentTool ? { ...prev.currentTool } : null;

        // Progressive milestone advancement
        if (elapsed > 1200 && newSteps[0].status === 'active') {
          newSteps[0].status = 'completed';
          newSteps[1].status = 'active';
          newPercent = Math.max(newPercent, 35);
          newStatus = 'Selecting agent tools & neural capabilities...';
        }
        if (elapsed > 3200 && newSteps[1].status === 'active') {
          newSteps[1].status = 'completed';
          newSteps[2].status = 'active';
          newPercent = Math.max(newPercent, 65);
          newStatus = 'Executing tool: python_workspace_sandbox...';
          if (!newTool) {
            newTool = { 
              name: 'python_workspace_sandbox', 
              status: 'Executing', 
              input: '# Digital Twin workspace execution sandbox\nimport os, sys\nsys.stdout.write("Processing context...")' 
            };
          }
        }
        if (elapsed > 6500 && newSteps[2].status === 'active') {
          newSteps[2].status = 'completed';
          newSteps[3].status = 'active';
          newPercent = Math.max(newPercent, 82);
          newStatus = 'Compiling output artifacts & verifying results...';
          if (newTool) newTool = { ...newTool, status: 'Completed' };
        }
        if (elapsed > 12000 && newPercent < 94) {
          // Slow progressive gain while agent continues long multi-step reasoning
          const extra = Math.min(12, (elapsed - 12000) / 15000);
          newPercent = Math.min(94, 82 + extra);
          if (elapsed > 45000 && !newStatus.includes('reasoning')) {
            newStatus = 'Deep neural synthesis & compilation in progress...';
          }
        }

        return {
          ...prev,
          elapsedMs: elapsed,
          percent: newPercent,
          steps: newSteps,
          statusMessage: newStatus,
          currentTool: newTool,
        };
      });
    }, 100);

    let aiText = 'Sorry, I could not process your request. Please try again.';
    let aiMsgId = 'twin_' + (Date.now() + 1).toString();
    let aiFiles = [];
    let completedWorksData = null;

    try {
      // Ensure active token is a valid signed JWT containing standard sub claim
      let activeToken = userAuthKey;
      if (!activeToken || !activeToken.includes('.')) {
        const user = await getUserData();
        activeToken = await generateTwinJwt(user || { firstName: userProfileName });
        setUserAuthKey(activeToken);
      }

      // 1. Create a run
      const createRes = await fetch(`${TWIN_API_BASE}/runs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: textToSend,
        }),
      });

      if (createRes.ok || createRes.status === 202) {
        const createData = await createRes.json();
        const runId = createData.run_id;

        if (runId) {
          setActiveRun(prev => prev ? { 
            ...prev, 
            runId,
            logs: [...prev.logs, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), text: `Run ID initialized: ${runId}`, type: 'info' }]
          } : prev);

          // 2. Stream events (SSE) in background if available
          let eventStreamActive = true;
          try {
            fetch(`${TWIN_API_BASE}/runs/${runId}/events`, {
              headers: { 'Authorization': `Bearer ${activeToken}` }
            }).then(async (streamRes) => {
              if (!streamRes.ok || !streamRes.body) return;
              const reader = streamRes.body.getReader();
              const decoder = new TextDecoder();
              let buffer = '';
              while (eventStreamActive) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                  if (!line.startsWith('data:')) continue;
                  const raw = line.slice(5).trim();
                  if (raw === '[DONE]') break;
                  try {
                    const evt = JSON.parse(raw);
                    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    if (evt.tool || evt.tool_name || evt.type === 'tool_call') {
                      const tName = evt.tool || evt.tool_name || evt.name || 'custom_tool';
                      setActiveRun(p => p ? {
                        ...p,
                        currentTool: { name: tName, status: 'Executing', input: evt.input || evt.args ? JSON.stringify(evt.input || evt.args) : '' },
                        toolsInvoked: [...p.toolsInvoked, { id: Date.now().toString(), name: tName, status: 'Executing', time: nowStr }],
                        logs: [...p.logs, { time: nowStr, text: `Invoked tool: ${tName}`, type: 'tool' }],
                        percent: Math.max(p.percent, 60),
                      } : p);
                    } else if (evt.type === 'thought' || evt.thought) {
                      const th = evt.content || evt.thought;
                      setActiveRun(p => p ? {
                        ...p,
                        statusMessage: typeof th === 'string' ? th.substring(0, 80) : 'Synthesizing reasoning...',
                        logs: [...p.logs, { time: nowStr, text: String(th).substring(0, 120), type: 'thought' }]
                      } : p);
                    }
                  } catch (e) {}
                }
              }
            }).catch(() => {});
          } catch (streamErr) {}

          // 3. Poll for completion for up to 300 intervals (up to 10 minutes)
          let completed = false;
          const maxPollIterations = 300;
          for (let i = 0; i < maxPollIterations; i++) {
            const pollDelay = i < 15 ? 1800 : (i < 50 ? 2200 : 2500);
            await new Promise(r => setTimeout(r, pollDelay));
            try {
              const pollRes = await fetch(`${TWIN_API_BASE}/runs/${runId}`, {
                headers: {
                  'Authorization': `Bearer ${activeToken}`
                }
              });
              if (pollRes.ok) {
                const pollData = await pollRes.json();
                const status = pollData.status || '';

                if (pollData.iterations) {
                  setActiveRun(p => p ? { ...p, iterations: pollData.iterations } : p);
                }

                if (status === 'completed' || status === 'success' || status === 'succeeded') {
                  eventStreamActive = false;
                  aiText = pollData.text || pollData.result || pollData.output || pollData.response || pollData.message || pollData.answer || 'Task completed.';
                  if (typeof aiText === 'object') aiText = JSON.stringify(aiText, null, 2);
                  aiMsgId = 'twin_' + (pollData.id || runId);

                  // Extract ONLY the newly created files or files directly referenced in this run
                  if (pollData.files && Array.isArray(pollData.files) && pollData.files.length > 0) {
                    const nonScriptFiles = pollData.files.filter(f => {
                      const n = (typeof f === 'string' ? f : (f.name || f.filename || '')).toLowerCase();
                      return !n.endsWith('.py') && !n.endsWith('.sh') && !n.endsWith('.bat') && !n.endsWith('.tmp');
                    });

                    // Match new files generated in this run
                    const newFiles = nonScriptFiles.filter(f => {
                      const n = (typeof f === 'string' ? f : (f.name || f.filename || '')).toLowerCase();
                      return !existingSessionFiles.has(n);
                    });

                    if (newFiles.length > 0) {
                      aiFiles = newFiles;
                    } else {
                      // Fallback: match files explicitly cited in AI response text
                      const citedFiles = nonScriptFiles.filter(f => {
                        const n = typeof f === 'string' ? f : (f.name || f.filename || '');
                        return n && aiText.toLowerCase().includes(n.toLowerCase());
                      });
                      if (citedFiles.length > 0) {
                        aiFiles = citedFiles;
                      }
                    }
                  }

                  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
                  completedWorksData = {
                    duration: totalDuration,
                    stepsCount: 4,
                    steps: [
                      { label: 'Prompt Ingestion & Context Mapping' },
                      { label: 'Agent Reasoning & Tool Selection' },
                      { label: 'Tool Invocation & Neural Execution' },
                      { label: 'Artifact Compilation & Output Generation' },
                    ],
                    tools: (activeRun?.toolsInvoked && activeRun.toolsInvoked.length > 0) 
                      ? activeRun.toolsInvoked 
                      : [
                          { name: 'neural_reasoning_core' },
                          { name: 'python_workspace_sandbox' },
                          { name: 'document_synthesizer' }
                        ],
                    iterations: pollData.iterations || 1,
                    spendUsd: pollData.spend_usd,
                  };

                  setActiveRun(p => p ? {
                    ...p,
                    percent: 100,
                    statusMessage: '✓ Task executed successfully!',
                    steps: p.steps.map(s => ({ ...s, status: 'completed' })),
                    currentTool: p.currentTool ? { ...p.currentTool, status: 'Completed' } : null,
                  } : p);

                  // Trigger Desktop Notification + Audio Chime + Tab Flash
                  notifyTaskComplete(textToSend, totalDuration, runId);

                  completed = true;
                  break;
                } else if (status === 'failed' || status === 'error') {
                  eventStreamActive = false;
                  aiText = pollData.error || pollData.message || 'The task encountered an error.';
                  completed = true;
                  break;
                }
              }
            } catch (pollErr) {}
          }
          if (!completed) {
            aiText = 'The task is still running in the background. Your files and outputs will appear when complete.';
          }
        }
      }
    } catch (err) {
      aiText = 'Could not connect to the Digital Twin backend. Please check your connection.';
    }

    clearInterval(timerInterval);
    setIsThinking(false);
    setActiveRun(null);

    const aiMessage = { 
      id: aiMsgId, 
      sender: 'twin', 
      text: aiText, 
      files: aiFiles, 
      sessionId: currentSessionId,
      works: completedWorksData || {
        duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
        stepsCount: 4,
        steps: [
          { label: 'Prompt Ingestion & Context Mapping' },
          { label: 'Agent Reasoning & Tool Selection' },
          { label: 'Tool Invocation & Neural Execution' },
          { label: 'Artifact Compilation & Output Generation' },
        ],
        tools: [
          { name: 'neural_reasoning_core' },
          { name: 'python_workspace_sandbox' }
        ],
        iterations: 1,
      }
    };

    setMessages(prev => {
      // Avoid duplicate AI message additions
      if (prev.some(m => m.id === aiMessage.id)) {
        return prev;
      }
      const updated = [...prev, aiMessage];
      saveChatSession({
        id: currentSessionId,
        title: updated.find(m => m.sender === 'user')?.text || textToSend,
        messages: updated
      }, 'twin');
      return updated;
    });
  };

  const handleMicPress = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleGoBack = () => {
    navigate('/digital-twin');
  };

  return (
    <div className="twin-chat-container">
      {/* Soft Twinkling Stars Background across complete screen */}
      <div className="stars-overlay">
        {stars.map((s) => (
          <div
            key={s.id}
            className={`star ${s.isBright ? 'star-bright' : ''} ${s.isCyan ? 'star-cyan' : ''}`}
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDuration: s.duration,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* --- DESKTOP SIDEBAR PANEL --- */}
      <aside className="twin-sidebar">
        <div className="sidebar-header">
          {/* Logo & Header Title */}
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <img src="/logo_in_white.svg" alt="Next Archer Logo" />
            </div>
            <div>
              <div className="sidebar-title">Next Archer</div>
              <div className="sidebar-subtitle">DESKTOP WORKSPACE</div>
            </div>
          </div>

          {/* New Chat Button */}
          <button className="new-chat-btn" onClick={handleNewChatSession}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>New Chat</span>
          </button>

          {/* Recent Chats Section */}
          <div className="recents-section">
            <div className="recents-title">RECENT CHATS</div>
            <div className="recents-list">
              {recentSessions.length > 0 ? (
                recentSessions.map((item) => (
                  <div
                    key={item.id}
                    className="recent-chat-item"
                    onClick={() => handleSelectSession(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <MessageSquare size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                    <div className="recent-chat-info">
                      <div className="recent-chat-name">{item.title}</div>
                      <div className="recent-chat-time">{item.time || 'Recent'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                  No past sessions saved.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        {!isGuest && (
          <div className="sidebar-footer">
            <div className="user-avatar-placeholder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="user-meta">
              <div className="user-name">{userProfileName} User</div>
              <div className="user-tier">Pro Plan • Active</div>
            </div>
          </div>
        )}
      </aside>

      {/* --- RIGHT CHAT AREA CONTAINER --- */}
      <div className="twin-chat-main">
        {/* Floating Header */}
        <header className="twin-chat-header">
          {/* Left: Back Arrow / Hamburger & Greeting */}
          <div className="header-left">
            {isSmallScreen && (
              <button className="back-btn" onClick={() => setShowMobileDrawer(true)}>
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="header-greeting">
                Hey <span>{userProfileName}</span>
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <p className="header-subtitle">Chatting with {twinName}</p>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="header-right">
            <button className="header-icon-btn" title="User Profile" onClick={() => navigate('/soul-matrix')}>
              <ProfileIconSvg />
            </button>
          </div>
        </header>

        {/* Scrollable Messages Panel */}
        <main className="messages-scroll-area">
          {/* Proactive Pre-Flight Notification Permission Prompt */}
          {notifPermission === 'default' && showTopNotifBanner && (
            <div className="twin-top-notif-banner">
              <div className="twin-top-notif-content">
                <div className="twin-top-notif-icon-circle">
                  <BellRing size={16} color="#00e5ff" />
                </div>
                <div className="twin-top-notif-text">
                  <strong>Enable Background Task Alerts</strong>
                  <span>Twin research, coding, and report builds can take 2–5+ minutes. Enable notifications so you can switch tabs freely and get alerted when done!</span>
                </div>
              </div>
              <div className="twin-top-notif-actions">
                <button 
                  type="button" 
                  className="twin-top-notif-enable-btn"
                  onClick={handleRequestNotification}
                >
                  <Bell size={13} />
                  <span>Allow Alerts</span>
                </button>
                <button 
                  type="button" 
                  className="twin-top-notif-close-btn"
                  onClick={() => setShowTopNotifBanner(false)}
                  title="Dismiss banner"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.type === 'badge') {
              return (
                <div key={msg.id} className="streak-badge-container">
                  <div className="streak-badge">
                    <Flame size={14} color="#f59e0b" fill="#f59e0b" style={{ marginRight: '5px' }} />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isTwin = msg.sender === 'twin' || msg.sender === 'ai' || msg.sender === 'assistant';
            return (
              <div key={msg.id} className={`message-row ${isTwin ? 'row-left' : 'row-right'}`}>
                {/* Twin Avatar Logo - Custom User Gallery Photo or Sacred CPU Icon */}
                {isTwin && (
                  <div className="twin-avatar-circle" style={{ overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050510' }}>
                    {twinAvatarPhoto ? (
                      <img src={twinAvatarPhoto} alt="Digital Twin Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Cpu size={16} color="#00ffcc" />
                    )}
                  </div>
                )}

                {/* Message Bubble Box */}
                <div className={`message-bubble ${isTwin ? 'bubble-twin' : 'bubble-user'}`}>
                  {/* Completed Works & Tools Invoked Accordion */}
                  {isTwin && msg.works && (
                    <CompletedWorksSummary works={msg.works} />
                  )}

                  {isTwin ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                  ) : (
                    msg.text
                  )}

                  {/* File Download Cards */}
                  {isTwin && msg.files && msg.files.length > 0 && (
                    <div className="file-download-cards">
                      {msg.files.map((file, idx) => {
                        const fileName = typeof file === 'string' ? file : (file.name || file.filename || `file_${idx}`);
                        const fileSize = typeof file === 'object' ? file.size : null;
                        const downloadUrl = (typeof file === 'object' && file.download_url)
                          ? `${TWIN_API_BASE}${file.download_url}`
                          : `${TWIN_API_BASE}/sessions/${msg.sessionId || currentSessionId}/files/${encodeURIComponent(fileName)}`;
                        return (
                          <a
                            key={idx}
                            href={downloadUrl}
                            onClick={(e) => handleFileDownload(e, downloadUrl, fileName)}
                            className="file-download-card"
                          >
                            <FileText size={18} className="file-icon" />
                            <div className="file-info">
                              <span className="file-name">{fileName}</span>
                              {fileSize && <span className="file-size">{fileSize}</span>}
                            </div>
                            <Download size={16} className="download-icon" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* User Avatar - custom sunflower SVG */}
                {!isTwin && <UserAvatar />}
              </div>
            );
          })}

          {/* Live Progress Bar & Tool Calling Box during Agent Execution */}
          {isThinking && (
            <div className="message-row row-left">
              <div className="twin-avatar-circle" style={{ overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050510' }}>
                {twinAvatarPhoto ? (
                  <img src={twinAvatarPhoto} alt="Twin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Cpu size={16} color="#00ffcc" />
                )}
              </div>
              <LiveProgressCard 
                activeRun={activeRun} 
                showLogs={showLiveLogs} 
                setShowLogs={setShowLiveLogs} 
                notifPermission={notifPermission}
                onRequestNotif={handleRequestNotification}
              />
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Input Bar Section */}
        <footer className="input-footer">
          <form className="input-capsule" onSubmit={handleSend}>
            <input
              type="text"
              className="input-field"
              placeholder={isThinking ? "Digital Twin is synthesizing your task..." : "Message..."}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={inputText}
              disabled={isThinking}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="button"
              className="mic-btn"
              onClick={handleMicPress}
              disabled={isThinking}
              style={isListening ? { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '18px' } : {}}
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              className="send-btn"
              disabled={isThinking || !inputText.trim()}
              style={{
                background: inputText.trim() && !isThinking ? 'linear-gradient(135deg, #00e5ff, #a855f7)' : 'rgba(255, 255, 255, 0.08)',
                color: inputText.trim() && !isThinking ? '#000000' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() && !isThinking ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              {isThinking ? <Loader2 size={16} className="spinner-icon" /> : <Send size={16} />}
            </button>
          </form>

          {/* Grounding Footer */}
          <div className="grounding-text-container">
            <div className="grounding-text">
              I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS
            </div>
          </div>
        </footer>
      </div>

      {/* --- MOBILE NAVIGATION GLASS DRAWER (< 960px) OPENING ON LEFT SIDE --- */}
      {showMobileDrawer && (
        <div className="twin-drawer-overlay">
          <div className="twin-drawer-content">
            <div className="twin-drawer-header">
              <div className="twin-drawer-brand">
                <img src="/logo_in_white.svg" alt="Logo" className="twin-drawer-logo" />
                <span className="twin-drawer-title">Next Archer</span>
              </div>
              <button className="twin-drawer-close" onClick={() => setShowMobileDrawer(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="twin-drawer-actions">
              <button
                className="twin-drawer-btn"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setMessages([{ id: '1', sender: 'twin', text: 'Welcome to your Digital Twin. How can I assist you today?' }]);
                }}
              >
                <PlusCircle size={18} color="#00d4ff" />
                <span>New Chat</span>
              </button>

              <button
                className="twin-drawer-btn"
                onClick={() => {
                  setShowMobileDrawer(false);
                  navigate('/twin-chat');
                }}
              >
                <Cpu size={18} color="#a855f7" />
                <span>Chat-TWIN</span>
              </button>

              <button
                className="twin-drawer-btn"
                onClick={() => {
                  setShowMobileDrawer(false);
                  navigate('/soul-matrix');
                }}
              >
                <User size={18} color="#ffffff" />
                <span>View-Life on DashBoard</span>
              </button>

              <button
                className="twin-drawer-btn"
                onClick={() => {
                  setShowMobileDrawer(false);
                  navigate('/healing');
                }}
              >
                <Heart size={18} color="#00ffcc" />
                <span>Act-Heal Me</span>
              </button>
            </div>
            
            {/* Recent Chats Section in Mobile Drawer */}
            <div className="recents-section" style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '16px' }}>
              <div className="recents-title">RECENT CHATS</div>
              <div className="recents-list">
                {recentSessions.length > 0 ? (
                  recentSessions.map((item) => (
                    <div
                      key={item.id}
                      className="recent-chat-item"
                      onClick={() => {
                        setShowMobileDrawer(false);
                        if (!item || !item.id) return;
                        setCurrentSessionId(item.id);
                        let msgs = item.messages;
                        if (msgs && msgs.length > 0) {
                          setMessages(msgs);
                        } else {
                          getChatMessagesForSession(item.id).then(fetchedMsgs => {
                            if (fetchedMsgs && fetchedMsgs.length > 0) {
                              setMessages(fetchedMsgs);
                            }
                          });
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <MessageSquare size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                      <div className="recent-chat-info">
                        <div className="recent-chat-name">{item.title}</div>
                        <div className="recent-chat-time">{item.time || 'Recent'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                    No past sessions saved.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="twin-drawer-backdrop" onClick={() => setShowMobileDrawer(false)} />
        </div>
      )}

      {/* Notification Permission Request Modal (At First) */}
      <Modal isOpen={showNotifModal} onClose={() => {
        setShowNotifModal(false);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('@twin_notif_modal_prompted', 'true');
        }
      }} maxWidth={440}>
        <div style={{ textAlign: 'center', padding: '12px 6px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1.5px solid rgba(0, 229, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 24px rgba(0, 229, 255, 0.25)'
          }}>
            <BellRing size={26} color="#00e5ff" />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            Enable Completion Notifications?
          </h2>

          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.55', marginBottom: '22px' }}>
            Twin Chat tasks (deep reasoning, multi-step sandbox coding, and document builds) can take <strong style={{ color: '#00e5ff' }}>2 to 5+ minutes</strong>. 
            Enable notifications so you can freely switch tabs or work elsewhere and get notified the moment the model finishes!
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('@twin_notif_modal_prompted', 'true');
                }
                setShowNotifModal(false);
              }}
            >
              Maybe Later
            </button>

            <button
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #00e5ff, #a855f7)',
                border: 'none',
                color: '#000000',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)',
              }}
              onClick={async () => {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('@twin_notif_modal_prompted', 'true');
                }
                const perm = await requestNotificationPermission();
                setNotifPermission(perm);
                setShowNotifModal(false);
                setShowTopNotifBanner(false);
                if (perm === 'granted') {
                  playTaskCompleteChime();
                }
              }}
            >
              Enable Notifications
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
