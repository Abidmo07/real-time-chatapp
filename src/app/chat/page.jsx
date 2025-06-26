"use client";

import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperclip, FaSmile } from 'react-icons/fa';
import { SelectedUserContext } from './layout';
import { supabase } from '../supabase';

export default function ChatRoom() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([])
  const [currentUser, setCurrentUser] = useState({})
  const endofMessage=useRef(null)
  useEffect(() => {
  if (endofMessage.current) {
    endofMessage.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [messages]);


  const selectedUser = useContext(SelectedUserContext);
useEffect(() => {
  let subscription;

  const setup = async () => {
    const { data: current, error } = await supabase.auth.getUser();
    if (error || !current) return console.error("error", error);
    setCurrentUser(current);

    const currentUserId = current.user.id;
    const selectedUserId = selectedUser?.selectedUser?.id;
    if (!selectedUserId) return;

    // Load messages
    const { data: messages, error: msgerror } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at');

    if (msgerror) return console.error("error", msgerror);
    setMessages(messages);

    // Real-time subscription
    subscription = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new;
          const isChatBetween =
            (msg.sender_id === currentUserId && msg.receiver_id === selectedUserId) ||
            (msg.receiver_id === currentUserId && msg.sender_id === selectedUserId);

          if (isChatBetween) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();
  };

  setup();

  return () => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  };
}, [selectedUser]);


  const sendMessage = async (e) => {
    e.preventDefault();
    if(!message || message.trim()==="") return;
    const { data, error: sendError } = await supabase.from('messages').insert({
      sender_id: currentUser.user.id,
      receiver_id: selectedUser.selectedUser.id,
      content: message
    })
    setMessage('');
    if (sendError) return console.log("error", sendError)

  }
  return (
    <div className="flex flex-col h-full">
      {/* Messages List (static design) */}
     <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      
  {messages.map((msg) =>
    msg.sender_id !== currentUser.user.id ? (
      // Incoming message
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mr-3 flex-shrink-0" />
        <div className="max-w-[70%] bg-gray-950 text-gray-200 px-4 py-3 rounded-2xl shadow-lg rounded-bl-none">
          <p>{msg.content}</p>
          <span className="block mt-2 text-xs text-gray-500">
            {new Date(msg.created_at).toLocaleTimeString()}
          </span>
        </div>
      </motion.div>
    ) : (
      // Outgoing message
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-end"
      >
        <div className="max-w-[70%] bg-blue-700 text-white px-4 py-3 rounded-2xl shadow-lg rounded-br-none text-right">
          <p>{msg.content}</p>
          <span className="block mt-2 text-xs text-gray-300">
            {new Date(msg.created_at).toLocaleTimeString()}
          </span>
        </div>
        <div className="w-8 h-8 bg-gray-700 rounded-full ml-3 flex-shrink-0" />
      </motion.div>
    )
  )}
  <div ref={endofMessage} />
</div>

      {/* Input Box (static design) */}
      <form onSubmit={sendMessage} className="border-t border-gray-700 bg-gray-850 px-4 py-3 flex items-center space-x-3">
        <button className="p-2 hover:bg-gray-700 rounded-full transition">
          <FaPaperclip className="h-5 w-5 text-gray-400" />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button className="p-2 hover:bg-gray-700 rounded-full transition">
          <FaSmile className="h-5 w-5 text-gray-400" />
        </button>
        <motion.button
          type='submite'
          whileTap={{ scale: 0.9 }}
          className="bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-800 transition"
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}
