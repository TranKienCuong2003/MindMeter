import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { authFetch } from "../authFetch";

export default function AdviceSentPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await authFetch("/api/expert/messages/sent");
        if (!res.ok)
          throw new Error("Không thể tải dữ liệu lời khuyên đã gửi!");
        const data = await res.json();
        setMessages(data);
      } catch (e) {
        setError(e.message || "Lỗi không xác định!");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-100 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-10">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-3xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-300">
          {t("adviceSentTitle") || "Danh sách lời khuyên đã gửi"}
        </h1>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-300">
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-300">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-300">
            {t("adviceSentPlaceholder") ||
              "Tính năng này sẽ hiển thị tất cả các lời khuyên mà bạn đã gửi cho học sinh/sinh viên."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left mt-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-blue-700 dark:text-blue-200 font-bold">
                    Nội dung
                  </th>
                  <th className="px-4 py-2 text-blue-700 dark:text-blue-200 font-bold">
                    Người nhận
                  </th>
                  <th className="px-4 py-2 text-blue-700 dark:text-blue-200 font-bold">
                    Thời gian gửi
                  </th>
                  <th className="px-4 py-2 text-blue-700 dark:text-blue-200 font-bold">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className="hover:bg-blue-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-2 break-words max-w-xs">
                      {msg.message}
                    </td>
                    <td className="px-4 py-2">{msg.receiverId || "-"}</td>
                    <td className="px-4 py-2">
                      {msg.sentAt ? new Date(msg.sentAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {msg.isRead ? (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          Đã đọc
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                          Chưa đọc
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
