import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";

const ChatContainer = () => {

  // getting all these from chatStore - zustand.
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages, deleteMessage } = useChatStore();
  const { authUser } = useAuthStore();

  // to make scroll
  const messageEndRef = useRef(null);

  // running intially.
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // scroll to last when triggers a message.
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // deleting message.
  const handleDeleteMessage = (messageId) => {
    deleteMessage(messageId);
  };

  // loading screen.
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message._id} className={`chat group ${ message.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
            <div className="chat-image avatar">
              <div className="w-10 h-10 rounded-full">
                <img src={ message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"} alt="profile pic" className="w-full h-full object-cover rounded-full"/>
              </div>
            </div>
            <div className="chat-bubble rounded-xl flex flex-col relative p-4 bg-base-200 text-base-content">
              {message.image && (
                <img src={message.image} alt="Attachment" className="max-w-[200px] w-full rounded-md mb-2"/>
              )}
              {message.text && <p className="break-words">{message.text}</p>}

              {/* Delete button */}
              <button className={`absolute ${message.senderId === authUser._id ? "flex" : "hidden"} -top-2 -right-[7px] opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full text-xs transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50`} onClick={() => handleDeleteMessage(message._id)} aria-label="Delete message">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

            </div>
            <div className="chat-footer opacity-50 text-xs mt-1">
              {formatMessageTime(message.createdAt)}
            </div>
          </div>
        ))}

        {/* Div To Implement a scroll */}
        <div ref={messageEndRef} />
      </div>

      {/* Text Box */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;

