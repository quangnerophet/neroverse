"use client";

import { useAuth } from "@/lib/AuthContext";

export function AuthButton() {
  const { user, tier, displayName, loading, signIn, signOutUser } = useAuth();

  if (loading) {
    return (
      <div className="w-24 h-8 rounded-full border border-gray-200 dark:border-slate-700 animate-pulse bg-gray-100 dark:bg-slate-800" />
    );
  }

  /* ── NOT LOGGED IN ─────────────────────────────────────── */
  if (!user) {
    return (
      <button
        onClick={signIn}
        className="
          flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest
          px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700
          text-gray-500 dark:text-slate-400
          hover:border-gray-400 dark:hover:border-slate-500
          hover:text-[#333] dark:hover:text-slate-200
          transition-all duration-200
        "
      >
        <GoogleIcon />
        Login
      </button>
    );
  }

  /* ── TIER BADGE CONFIG ─────────────────────────────────── */
  const tierBadge =
    tier === "vip"
      ? { label: "VIP", className: "bg-purple-500 text-white" }
      : tier === "premium"
      ? { label: "PRO", className: "bg-amber-500 text-white" }
      : null;

  const shownName = displayName || user.displayName || user.email?.split("@")[0] || "User";

  /* ── LOGGED IN ─────────────────────────────────────────── */
  return (
    <div className="relative group">
      {/* Trigger button */}
      <button className="flex items-center gap-2.5 group/btn" aria-label="Account menu">
        {/* Name + tier badge block */}
        <div className="relative">
          {/* Tier badge — floats top-right of name */}
          {tierBadge && (
            <span
              className={`
                absolute -top-2.5 -right-1 z-10
                font-sans text-[8px] font-bold uppercase tracking-wider
                px-1.5 py-0.5 rounded-full leading-none
                ${tierBadge.className}
                shadow-sm
              `}
            >
              {tierBadge.label}
            </span>
          )}

          {/* Name pill */}
          <span
            className="
              block font-sans text-[12px] font-medium
              text-[#333] dark:text-slate-200
              border border-gray-200 dark:border-slate-700
              rounded-full px-4 py-1.5 pr-5
              group-hover/btn:border-gray-400 dark:group-hover/btn:border-slate-500
              transition-all duration-200 max-w-[140px] truncate
            "
          >
            {shownName}
          </span>
        </div>

        {/* Chevron */}
        <svg
          className="w-3 h-3 text-gray-400 dark:text-slate-600 transition-transform duration-200 group-hover:rotate-180 flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className="
          absolute right-0 top-full mt-3 w-52
          bg-white dark:bg-slate-900
          border border-gray-100 dark:border-slate-700
          rounded-2xl shadow-xl
          opacity-0 invisible pointer-events-none
          group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
          transition-all duration-200 translate-y-1 group-hover:translate-y-0
          z-50 overflow-hidden
        "
      >
        {/* User info row */}
        <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={shownName}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center font-sans text-xs text-gray-500 flex-shrink-0">
                {shownName[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-sans text-xs font-semibold text-[#333] dark:text-slate-100 truncate">
                {shownName}
              </p>
              <p className="font-sans text-[10px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Tier row */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Gói
          </span>
          {tier === "vip" ? (
            <span className="font-sans text-[11px] font-bold text-purple-600 dark:text-purple-400">👑 VIP</span>
          ) : tier === "premium" ? (
            <span className="font-sans text-[11px] font-bold text-amber-600 dark:text-amber-400">🔒 Premium</span>
          ) : (
            <span className="font-sans text-[11px] text-gray-400 dark:text-slate-500">✓ Free</span>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={signOutUser}
          className="
            w-full text-left px-4 py-3 font-sans text-[11px]
            text-gray-400 dark:text-slate-500
            hover:text-red-400 dark:hover:text-red-400
            hover:bg-gray-50 dark:hover:bg-slate-800/50
            transition-colors
          "
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
