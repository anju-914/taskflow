"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, ChevronDown } from "lucide-react";

export function Navbar() {
  const { profile, user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  const email = profile?.email || user?.email || "";

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-navy-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow shadow-gold-400/30">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-navy-900"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white">
              TaskFlow
            </span>
          </div>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-gold-400/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center ring-2 ring-gold-400/30">
                  <User size={16} className="text-gold-400" />
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-tight">
                  {displayName}
                </p>
                <p className="text-xs text-white/40 leading-tight truncate max-w-[140px]">
                  {email}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-white/40 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 glass-card py-1 z-50 shadow-xl shadow-black/40">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-medium text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-white/40 truncate">{email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}