'use client';
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase';

export default function UserList({ onSelect, currentUserId }) {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        supabase.from("profiles").select('id,full_name,avatar_url').neq('id', currentUserId).then((data) => setUsers(data))
    }, [currentUserId])
    return (
        <>
          <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
  {users.map((u) => (
    <div
      key={u.id}
      onClick={() => onSelect(u)}
      className="flex items-center p-4 hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
    >
      {u.avatar_url ? (
        <img
          src={u.avatar_url}
          alt={`${u.full_name} avatar`}
          className="w-11 h-11 rounded-full object-cover border-2 border-green-500"
        />
      ) : (
        <div className="w-11 h-11 bg-green-100 rounded-full border-2 border-green-500" />
      )}
      <div className="ml-4">
        <p className="text-gray-900 dark:text-white font-semibold">{u.full_name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tap to chat</p>
      </div>
    </div>
  ))}
</div>

        </>
    )
}
