import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export function CommentsSection() {
  const { user, signIn } = useAuth();
  const [commentText, setCommentText] = useState("");

  return (
    <div className="mt-12 pt-10 border-t border-gray-100 dark:border-slate-800">
      <h3 className="font-serif text-2xl font-bold text-[#222] dark:text-slate-100 mb-8">
        Discussion
      </h3>

      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {user && user.photoURL ? (
            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          {!user ? (
            <div 
              onClick={signIn}
              className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/30 text-gray-400 cursor-text hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer text-[15px] font-sans"
            >
              Sign in to write a comment...
            </div>
          ) : (
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/30 text-[#333] dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-sans text-[15px] resize-none min-h-[100px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
