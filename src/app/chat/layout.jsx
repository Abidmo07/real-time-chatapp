"use client";

import React, { createContext, useEffect, useState } from 'react';
import { FaSearch, FaEllipsisV, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';

export const SelectedUserContext = createContext();

export default function ChatLayout({ children }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searched, setSearched] = useState("");
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [me,setMe]=useState({});
    const router = useRouter();


    // Fetch other users
    useEffect(() => {

        const fetchOtherUsers = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            console.log(user.user_metadata.name);
            setMe(user.user_metadata);
            
            if (userError || !user) return console.error(userError?.message || 'No user');


            const { data, error } = await supabase
                .from('users')
                .select('*')
                .neq('id', user.id);
            if (error) return console.error(error.message);

            setUsers(data);
            setSearchedUsers(data);
        };
        fetchOtherUsers();
        let interval = setInterval(fetchOtherUsers, 10000); // Fetch users every 10 seconds instead of 30
        return () => clearInterval(interval);

    }, []);



    // Logout function
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout failed:", error.message);
        } else {
            router.push("/auth/register");

        }
    };
    useEffect(() => {
        if (!searched || searched.trim() === "") {
            setSearchedUsers(users);
        }
        const filtred = users.filter((user) => user.full_name?.toLowerCase().includes(searched.toLowerCase()));
        setSearchedUsers(filtred);
    }, [searched])
    useEffect(() => {
        const updateLastSeen = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) return console.error(userError?.message || 'No user');
            await supabase.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id);
        }
        updateLastSeen();
        let intervale = setInterval(updateLastSeen, 5000); // Update every 5 seconds instead of 2
        return () => clearInterval(intervale);
    }, [])

    const isOnline = (lastSeenAt) => {
        if (!lastSeenAt) return false;
        const diff = Date.now() - new Date(lastSeenAt).getTime();
        return diff < 15000; // Consider online if last seen within 15 seconds (3x the update interval)
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Sidebar */}
            <aside className="w-1/3 lg:w-1/4 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            borzChat
                        </h1>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-11 pr-4 py-3 bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            onChange={(e) => setSearched(e.target.value)}
                            value={searched}
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {searchedUsers.map((user) => (
                            <div
                                onClick={() => setSelectedUser(user)}
                                key={user.id}
                                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/10 group ${
                                    selectedUser?.id === user.id ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5'
                                }`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                        {user.full_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                                        isOnline(user.last_seen_at) ? 'bg-green-400' : 'bg-gray-500'
                                    } rounded-full border-2 border-slate-900`}></span>
                                </div>
                                <div className="flex-1 ml-3 min-w-0">
                                    <h4 className="text-white font-medium truncate">{user.full_name}</h4>
                                    <p className={`text-sm truncate ${
                                        isOnline(user.last_seen_at) ? 'text-green-400' : 'text-gray-400'
                                    }`}>
                                        {isOnline(user.last_seen_at) ? "Active now" : "Offline"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {me.full_name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-white font-medium truncate">{me.full_name}</p>
                                <p className="text-green-400 text-xs">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                            title="Logout"
                        >
                            <FaSignOutAlt className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Chat Panel */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 sticky top-0 z-20">
                    <div className="flex items-center">
                        {selectedUser ? (
                            <>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                        {selectedUser.full_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                                        isOnline(selectedUser.last_seen_at) ? 'bg-green-400' : 'bg-gray-500'
                                    } rounded-full border-2 border-slate-900`}></span>
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-white">{selectedUser.full_name}</h2>
                                    <span className={`text-sm ${
                                        isOnline(selectedUser.last_seen_at) ? 'text-green-400' : 'text-gray-400'
                                    }`}>
                                        {isOnline(selectedUser.last_seen_at) ? "Active now" : "Offline"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                                    <FaUser className="text-gray-300 text-lg" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-white">Welcome to borzChat</h2>
                                    <span className="text-sm text-gray-400">Select a conversation to start messaging</span>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Chat Content */}
                <main className="flex flex-col flex-1 bg-gradient-to-b from-slate-900/50 to-slate-900 p-6 overflow-y-auto">
                    <SelectedUserContext.Provider value={{ selectedUser, setSelectedUser }}>
                        {children}
                    </SelectedUserContext.Provider>
                </main>
            </div>
        </div>
    );
}