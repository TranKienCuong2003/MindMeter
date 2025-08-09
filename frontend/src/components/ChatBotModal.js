import React, { useState, useRef, useEffect, useContext } from "react";
import {
  FaRobot,
  FaUserCircle,
  FaPaperPlane,
  FaTrash,
  FaEllipsisV,
  FaDownload,
  FaRegLightbulb,
  FaRegCommentDots,
  FaRegQuestionCircle,
  FaEye,
  FaEyeSlash,
  FaRegSmile,
} from "react-icons/fa";
import { ThemeContext } from "../App";
import { useTranslation } from "react-i18next";
import { authFetch } from "../authFetch";

const CHAT_HISTORY_KEY = "mindmeter_chat_history";

// TypewriterMessage: Hiển thị từng ký tự một cho tin nhắn bot
function TypewriterMessage({ text, speed = 30, onDone }) {
  const safeText = typeof text === "string" ? text : "";
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    let cancelled = false;
    function type() {
      if (cancelled) return;
      if (i < safeText.length) {
        setDisplayed(safeText.slice(0, i + 1));
        i++;
        setTimeout(type, speed);
      } else {
        setDone(true);
        if (onDone) onDone();
      }
    }
    type();
    return () => {
      cancelled = true;
    };
  }, [safeText, speed, onDone]);

  // Hiệu ứng nhấp nháy con trỏ
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setShowCursor((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, [done]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayed]);

  return (
    <span ref={scrollRef}>
      {displayed}
      {!done && <span style={{ opacity: showCursor ? 1 : 0 }}>|</span>}
    </span>
  );
}

const ChatBotModal = ({ open, onClose, user }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        sender: "bot",
        text: t("chatbot.welcome"),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showBotAvatar, setShowBotAvatar] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext) || {
    theme: "light",
    setTheme: () => {},
  };
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [botMessageDone, setBotMessageDone] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Thêm hàm xoá lịch sử chat
  const clearHistory = () => {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    setMessages([
      {
        sender: "bot",
        text: t("chatbot.welcome"),
      },
    ]);
  };

  // Download chat history as txt or json
  const downloadHistory = (type = "txt") => {
    let content = "";
    if (type === "json") {
      content = JSON.stringify(messages, null, 2);
    } else {
      content = messages
        .map((m) => `${m.sender === "user" ? "Bạn" : "Bot"}: ${m.text}`)
        .join("\n");
    }
    const blob = new Blob([content], {
      type: type === "json" ? "application/json" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindmeter_chat_history.${type}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    setShowMenu(false);
  };

  // Feedback modal submit (dummy)
  const [feedback, setFeedback] = useState("");
  const handleFeedbackSubmit = async () => {
    try {
      setFeedbackLoading(true);
      await authFetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, email: user?.email || "" }),
      });
      setShowFeedback(false);
      setFeedback("");
      setShowThankYou(true);
    } catch (e) {
      alert("Gửi phản hồi thất bại!");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Giới hạn lượt dùng chatbot mỗi ngày
  const MAX_FREE_CHATBOT_USES_PER_DAY = 5;
  const CHATBOT_USAGE_KEY = "mindmeter_chatbot_usage";

  // Kiểm tra quyền gói dịch vụ
  const userPlan = user && user.plan ? user.plan.toUpperCase() : "FREE";
  const isUnlimited = userPlan === "PLUS" || userPlan === "PRO";

  function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }

  function getChatbotUsage() {
    const raw = localStorage.getItem(CHATBOT_USAGE_KEY);
    if (!raw) return { date: getTodayKey(), count: 0 };
    try {
      const data = JSON.parse(raw);
      if (data.date !== getTodayKey()) return { date: getTodayKey(), count: 0 };
      return data;
    } catch {
      return { date: getTodayKey(), count: 0 };
    }
  }

  function setChatbotUsage(count) {
    localStorage.setItem(
      CHATBOT_USAGE_KEY,
      JSON.stringify({ date: getTodayKey(), count })
    );
  }

  useEffect(() => {
    if (open) setInput("");
    // Khi mở modal, nếu localStorage có lịch sử thì load lại
    if (open) {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {}
      }
      // Nếu đã có tin nhắn bot cuối cùng và không loading, set botMessageDone = true
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender === "bot" && !loading) {
        setBotMessageDone(true);
      }
    }
  }, [open]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // Lưu lịch sử chat mỗi khi messages thay đổi
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // Đồng bộ tin nhắn đầu tiên với ngôn ngữ hiện tại
  useEffect(() => {
    if (
      messages.length === 1 &&
      messages[0].sender === "bot" &&
      messages[0].text !== t("chatbot.welcome")
    ) {
      setMessages([
        {
          sender: "bot",
          text: t("chatbot.welcome"),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // Nếu không phải gói Plus/Pro thì kiểm tra giới hạn
    if (!isUnlimited) {
      const usage = getChatbotUsage();
      if (usage.count >= MAX_FREE_CHATBOT_USES_PER_DAY) {
        setShowLimitModal(true);
        return;
      }
      setChatbotUsage(usage.count + 1);
    }
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setBotMessageDone(false); // Reset trạng thái khi gửi tin nhắn mới
    try {
      const token = localStorage.getItem("token");
      const res = await authFetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xin lỗi, tôi không thể trả lời lúc này." },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black bg-opacity-30 dark:bg-opacity-50">
      <div
        className="w-full max-w-md m-4 bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[70vh] backdrop-blur-xl"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-t-3xl relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center border-4 border-white/60 shadow-lg">
              <FaRobot className="text-3xl text-white drop-shadow" />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-wide">
                MindMeter Chatbot
              </div>
              <div className="text-xs text-indigo-100 font-medium">
                {t("chatbot.subtitle")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-indigo-100 hover:text-white text-2xl font-bold p-2 rounded-full hover:bg-indigo-400 transition shadow-md"
              title="Đóng"
            >
              ×
            </button>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-br from-white/80 via-indigo-50/80 to-purple-50/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80 rounded-b-3xl custom-scrollbar">
          {messages.map((msg, idx) => {
            // Áp dụng typewriter cho mọi tin nhắn bot mới nhất (kể cả tin nhắn đầu tiên)
            const isLastBotMsg =
              msg.sender === "bot" && idx === messages.length - 1 && !loading;
            return (
              <div
                key={idx}
                className={`flex items-end ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {msg.sender === "bot" && showBotAvatar && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center border-2 border-white shadow mr-2">
                    <FaRobot className="text-xl text-white" />
                  </div>
                )}
                <div
                  className={`px-5 py-3 rounded-2xl max-w-[75%] text-base whitespace-pre-line shadow-md transition-all duration-200 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-br-md ml-2"
                      : "bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-bl-md"
                  }`}
                  style={{ boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10)" }}
                >
                  {isLastBotMsg ? (
                    botMessageDone ? (
                      msg.text
                    ) : (
                      <TypewriterMessage
                        text={msg.text || ""}
                        speed={30}
                        onDone={() => setBotMessageDone(true)}
                      />
                    )
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.sender === "user" && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center border-2 border-white shadow ml-2">
                    <FaUserCircle className="text-xl text-white" />
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex items-end justify-start animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center border-2 border-white shadow mr-2 animate-bounce">
                <FaRobot className="text-xl text-white" />
              </div>
              <div className="px-5 py-3 rounded-2xl max-w-[75%] text-base bg-white/90 dark:bg-gray-800/90 text-gray-400 italic shadow-md rounded-bl-md">
                Đang trả lời...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 rounded-b-3xl">
          <div className="flex items-center gap-3">
            {/* Menu button moved here */}
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-800 transition shadow-md"
                title="Tùy chọn"
              >
                <FaEllipsisV />
              </button>
              {showMenu && (
                <div className="absolute left-0 bottom-12 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in py-2">
                  <button
                    onClick={() => downloadHistory("txt")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    <FaDownload className="text-blue-500" />
                    {t("chatbot.downloadTxt")}
                  </button>
                  <button
                    onClick={() => downloadHistory("json")}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    <FaDownload className="text-green-500" />
                    {t("chatbot.downloadJson")}
                  </button>
                  <button
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    <FaRegLightbulb className="text-yellow-400" />
                    {t("chatbot.toggleTheme")}
                  </button>
                  <button
                    onClick={() => {
                      setShowFeedback(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    <FaRegCommentDots className="text-pink-500" />
                    {t("chatbot.feedback")}
                  </button>
                  <button
                    onClick={() => {
                      setShowGuide(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    <FaRegQuestionCircle className="text-indigo-500" />
                    {t("chatbot.guide")}
                  </button>
                  <button
                    onClick={() => {
                      setShowBotAvatar((v) => !v);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    {showBotAvatar ? (
                      <FaEyeSlash className="text-gray-500" />
                    ) : (
                      <FaEye className="text-gray-500" />
                    )}
                    {showBotAvatar
                      ? t("chatbot.hideAvatar")
                      : t("chatbot.showAvatar")}
                  </button>
                  <button
                    onClick={() => {
                      clearHistory();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    <FaTrash className="text-red-500" />
                    {t("chatbot.clearHistory")}
                  </button>
                </div>
              )}
            </div>
            <textarea
              className="flex-1 resize-none rounded-full border border-gray-300 dark:border-gray-600 px-5 py-3 text-base bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md transition-all"
              rows={1}
              placeholder={t("chatbot.inputPlaceholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ minHeight: 44 }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-4 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center text-2xl shadow-lg focus:outline-none"
              title="Gửi"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-200 flex items-center gap-2">
                <FaRegCommentDots /> {t("chatbot.feedback")}
              </div>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
              rows={4}
              placeholder={t("chatbot.feedbackInputPlaceholder")}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <button
              onClick={handleFeedbackSubmit}
              disabled={!feedback.trim() || feedbackLoading}
              className="bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50"
            >
              {feedbackLoading ? "Đang gửi..." : t("chatbot.feedbackSubmit")}
            </button>
          </div>
        </div>
      )}
      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center animate-fade-in">
            <div className="text-2xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2">
              <FaRegSmile className="inline text-3xl" />
              {t("chatbot.thankYou")}
            </div>
            <div className="text-gray-700 dark:text-gray-200 mb-4">
              {t("chatbot.thankYouMessage")}
            </div>
            <button
              onClick={() => setShowThankYou(false)}
              className="bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2 rounded-full font-semibold"
            >
              {t("chatbot.thankYouClose")}
            </button>
          </div>
        </div>
      )}
      {/* User Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-200 flex items-center gap-2">
                <FaRegQuestionCircle /> {t("chatbot.guide")}
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="text-base text-gray-700 dark:text-gray-200 space-y-2">
              <p>• {t("chatbot.guideStep1")}</p>
              <p>• {t("chatbot.guideStep2")}</p>
              <p>• {t("chatbot.guideStep3")}</p>
              <p>• {t("chatbot.guideStep4")}</p>
            </div>
          </div>
        </div>
      )}
      {/* Thêm modal khi hết lượt */}
      {showLimitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in text-center">
            <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              {t("chatbot.limitTitle")}
            </div>
            <div className="text-gray-700 dark:text-gray-200 mb-6">
              {t("chatbot.limitDesc")}
            </div>
            <button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
              onClick={() => {
                setShowLimitModal(false);
                window.location.href = "/pricing";
              }}
            >
              {t("chatbot.limitBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotModal;
