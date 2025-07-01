"use client";

import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperclip, FaSmile, FaPaperPlane } from 'react-icons/fa';
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
  let subscription = null;

  const setup = async () => {
    // Clear messages when no user is selected
    if (!selectedUser?.selectedUser) {
      setMessages([]);
      return;
    }

    const { data: current, error } = await supabase.auth.getUser();
    if (error || !current) return console.error("error", error);
    setCurrentUser(current);

    const currentUserId = current.user.id;
    const selectedUserId = selectedUser.selectedUser.id;

    // Load messages
    const { data: messages, error: msgerror } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at');

    if (msgerror) return console.error("error", msgerror);
    setMessages(messages || []);

    // Create a unique channel name to avoid conflicts
    const channelName = `chat-${Math.min(currentUserId, selectedUserId)}-${Math.max(currentUserId, selectedUserId)}`;
    
    // Real-time subscription
    subscription = supabase
      .channel(channelName)
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
}, [selectedUser?.selectedUser?.id]); // Only depend on the selected user ID


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

  if (!selectedUser?.selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">Start a conversation</h3>
        <p className="text-gray-400 max-w-md">
          Select a friend from the sidebar to begin chatting. Your messages are end-to-end encrypted and secure.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No messages yet</h4>
            <p className="text-gray-400 text-sm">
              Send a message to start the conversation with {selectedUser.selectedUser.full_name}
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOutgoing = msg.sender_id === currentUser.user.id;
            const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex items-end ${isOutgoing ? 'justify-end' : 'justify-start'} group`}
              >
                {!isOutgoing && (
                  <div className={`w-8 h-8 mr-3 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                    {showAvatar && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {selectedUser.selectedUser.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`max-w-[75%] ${isOutgoing ? 'order-1' : 'order-2'}`}>
                  <div
                    className={`
                      px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200
                      ${isOutgoing 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md ml-auto' 
                        : 'bg-white/10 border border-white/20 text-white rounded-bl-md'
                      }
                      group-hover:shadow-xl group-hover:scale-[1.02]
                    `}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center mt-2 space-x-1 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-xs ${isOutgoing ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isOutgoing && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                          <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isOutgoing && (
                  <div className={`w-8 h-8 ml-3 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                    {showAvatar && (
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {currentUser.user?.user_metadata?.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
        <div ref={endofMessage} />
      </div>

      {/* Input Box */}
      <form 
        onSubmit={sendMessage} 
        className="border-t border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4"
      >
        <div className="flex items-center space-x-3 bg-white/5 rounded-2xl border border-white/10 px-4 py-2 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <button 
            type="button"
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 text-gray-400 hover:text-blue-400"
            title="Attach file"
          >
            <FaPaperclip className="h-4 w-4" />
          </button>
          
          <input
            type="text"
            placeholder={`Message ${selectedUser.selectedUser.full_name}...`}
            className="flex-1 px-2 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />
          
          <button 
            type="button"
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 text-gray-400 hover:text-yellow-400"
            title="Add emoji"
          >
            <FaSmile className="h-4 w-4" />
          </button>
          
          <motion.button
            type="submit"
            disabled={!message.trim()}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className={`
              p-3 rounded-full transition-all duration-200 flex items-center justify-center
              ${message.trim() 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-blue-500/25' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
            title="Send message"
          >
            <FaPaperPlane className="h-4 w-4" />
          </motion.button>
        </div>
        
        {/* Typing indicator placeholder */}
        <div className="flex items-center mt-2 px-2">
          <span className="text-xs text-gray-500">
            {/* This could be used for typing indicators in the future */}
          </span>
        </div>
      </form>
    </div>
  );
}