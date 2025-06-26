"use client";

import React, { createContext, useEffect, useState } from 'react';
import { FaSearch, FaEllipsisV, FaTimes } from 'react-icons/fa';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';

export const SelectedUserContext = createContext();

export default function ChatLayout({ children }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searched,setSearched]=useState("");
    const [searchedUsers,setSearchedUsers]=useState([])
    const router=useRouter();


    // Fetch other users
    useEffect(() => {
        let interval
        const fetchOtherUsers = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) return console.error(userError?.message || 'No user');


            const { data, error } = await supabase
                .from('users')
                .select('*')
                .neq('id', user.id);
            if (error) return console.error(error.message);

            setUsers(data);
            setSearchedUsers(data);
        };

        interval=setInterval(fetchOtherUsers,10000)
        return ()=>clearInterval(interval)

    }, []);
    useEffect(()=>{

    })

    // Logout function
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout failed:", error.message);
        } else {
            router.push("/auth/register");

        }
    };
    useEffect(()=>{
      if(!searched || searched.trim()===""){
        setSearchedUsers(users);
      }
      const filtred=users.filter((user)=>user.full_name?.toLowerCase().includes(searched.toLowerCase()));
      setSearchedUsers(filtred);
    },[searched])

    useEffect(()=>{
      // for tracking online users
      let interval;
            const updateLastSeen=async()=>{
               const { data: { user } } = await supabase.auth.getUser();
               if(!user) return;
              await supabase.from("users").update({last_seen_at: new Date().toISOString()}).eq('id',user.id)
            }
            updateLastSeen();
           interval= setInterval(updateLastSeen,30000)
           return ()=>clearInterval(interval)
    },[])
    const isOnline=(lastSeenAt)=>{
        const diff=Date.now()-new Date(lastSeenAt).getTime();
        return diff<40000

    }

    return (
        <div className="flex h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900">
            {/* Sidebar */}
            <aside className="w-1/3 lg:w-1/4 bg-gray-850 shadow-2xl p-8 flex flex-col">
                <h1 className="text-3xl font-extrabold text-white mb-8">borzChat</h1>
                <div className="relative mb-6">
                    <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search friends..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e)=>setSearched(e.target.value)}
                        value={searched}
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-4">
                        {searchedUsers.map((user) => (
                            <li
                                onClick={() => setSelectedUser(user)}
                                key={user.id}
                                className="flex items-center p-3 bg-gray-800 rounded-2xl hover:bg-gray-700 cursor-pointer transition"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-500 rounded-full mr-4"></div>
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold">{user.full_name}</h4>
                                    <p className="text-gray-400 text-sm truncate">In a meeting...</p>
                                </div>
                                <span className={`w-3 h-3 ${isOnline(user.last_seen_at)?'bg-green-500':'bg-red-500'}  rounded-full`}></span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Main Chat Panel */}
            <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between bg-gray-850 shadow-sm px-8 py-4 sticky top-0 z-20">
                    <div className="flex items-center">
                        <div className="w-14 h-14 bg-gray-700 rounded-full mr-6" />
                        {selectedUser ? (
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedUser.full_name}</h2>
                                <span className="text-sm text-gray-400">{isOnline(selectedUser.last_seen_at)?"online":"offline"}</span>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold text-white">Chat Room</h2>
                                <span className="text-sm text-gray-400">Select a friend to start</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-gray-700 rounded-full transition">
                            <FaEllipsisV className="h-5 w-5 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-full transition">
                            <FaTimes className="h-5 w-5 text-gray-400" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Chat Content */}
                <main className="flex flex-col flex-1 bg-gray-900 p-6 overflow-y-auto space-y-6">
                    <SelectedUserContext.Provider value={{ selectedUser, setSelectedUser }}>
                        {children}
                    </SelectedUserContext.Provider>
                </main>
            </div>
        </div>
    );
}
