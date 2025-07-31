import React, { useEffect } from "react";
import { View } from "@tarojs/components";

const ModalDialog = ({ isOpen, onClose, title, children }) => {
  // 按 ESC 关闭模态框
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <View
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // 点击遮罩层关闭
    >
      <View
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4"
        onClick={(e) => e.stopPropagation()} // 阻止冒泡，避免点击内容时关闭
      >
        {/* 标题和关闭按钮 */}
        <View className="flex justify-between items-center mb-4">
          <View className="text-xl font-bold text-gray-800">{title}</View>
          <View
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </View>
        </View>

        {/* 内容区域 */}
        <View className="text-gray-600">{children}</View>

        {/* 底部按钮（可选） */}
        <View className="mt-6 flex justify-end space-x-3">
          <View
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            取消
          </View>
          <View
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            确认
          </View>
        </View>
      </View>
    </View>
  );
};

export default ModalDialog;