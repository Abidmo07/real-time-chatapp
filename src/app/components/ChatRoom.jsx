"use client";
import { ArrowLeft, MoreVertical, Paperclip, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';

export default function ChatRoom() {
  const [user, setUser] = useState({});
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const router = useRouter()
  const end = useRef();
  //get the auth user
/*   useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log(data);
      setUser(data.user)
    })
  }, []); */

  //fetch all messages per chat
/*   useEffect(() => {
    if (!chat) {
      return;
    }
    supabase.from('messages').select("*").eq("chat_id", chat.id).order('created_at').then((data) => setMsgs(data))
  }, [chat]) */

  //send message 
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chat) return;
    await supabase.from("messages").insert([
      {
        chat_id: chat.id,
        sender_id: chat.sender_id,
        content: input
      }

    ]);
    setInput('');

  }
  //realTime messaging
/*   useEffect(() => {
    if (!chat) return;
    const channel = supabase.channel(`chat:${chat.id}`).on('postgres_changes', { event: 'insert', shema: 'public', table: 'messages', fileter: `chat_id=eq.${chat.id}` }, (payload) => {

      setMsgs(prev => [...prev, payload.new]);
      end.current?.scrollIntoView({ behavior: 'smooth' });
    })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [chat]) */

  const handleLogout = () => {
    supabase.auth.signOut();
    router.push('/')

  }

/*   useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/"); // redirect to login
      } else {
        setSession(session);
      }
    });
  }, []); */
  return (
    <>
      chat
    </>
  )
}
