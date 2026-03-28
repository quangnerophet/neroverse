"use client";

import { useState } from "react";
import { useStore } from "@/lib/StoreProvider";
import { useAuth } from "@/lib/AuthContext";

export function PricingModal() {
  const { isPricingModalOpen, setPricingModalOpen, siteSettings } = useStore();
  const { tier, user, signIn } = useAuth();

  if (!isPricingModalOpen) return null;

  // Try to find the Instagram link from settings, fallback to a sensible default if not found
  const igLinkObj = siteSettings?.footerLinks?.find(
    (link) => link.label.toLowerCase().includes("instagram") || link.label.toLowerCase().includes("ig")
  );
  const igLink = igLinkObj?.url || "https://instagram.com/quangnerophet";
    // Note: To handle upgrade logic we now pass igLink to the UpgradeButton below.
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100]" 
        onClick={() => setPricingModalOpen(false)}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <div className="bg-white dark:bg-[#0f111a] w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto pointer-events-auto relative flex flex-col items-center p-6 md:p-12 border border-gray-100 dark:border-slate-800 scrollbar-hide">
          
          <button 
            onClick={() => setPricingModalOpen(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            ✕
          </button>

          <div className="text-center max-w-lg mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-[#222] dark:text-slate-100 mb-3">Bảng Giá & Thẻ Thành Viên</h2>
            <p className="font-sans text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Trở thành độc giả gắn kết và nhận truy cập toàn bộ nội dung chuyên sâu, công cụ quản lý, và tương tác riêng tư.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* FREE CARD */}
            <div className={`p-8 rounded-2xl border-2 flex flex-col ${tier === 'free' ? 'border-gray-900 dark:border-slate-600' : 'border-gray-100 dark:border-slate-800'} transition-opacity ${tier && tier !== 'free' ? 'opacity-50' : ''}`}>
              <h3 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">Tiêu chuẩn</h3>
              <div className="font-serif text-2xl text-[#333] dark:text-slate-100 mb-5">Basic</div>
              <div className="flex items-baseline gap-1.5 mb-6 border-b border-gray-100 dark:border-slate-800 pb-6">
                <span className="font-serif text-4xl text-[#111] dark:text-white">0đ</span>
                <span className="font-sans text-[10px] text-gray-400 uppercase tracking-widest">/ tháng</span>
              </div>
              
              <ul className="flex-grow flex flex-col gap-4 font-sans text-sm text-gray-600 dark:text-slate-300 mb-8 list-none p-0">
                <li className="flex gap-3"><span className="text-gray-400">✓</span> Đọc các bài micro-blog cơ bản.</li>
                <li className="flex gap-3"><span className="text-gray-400">✓</span> Nhận bản tin Newsletter định kỳ.</li>
              </ul>
              
              <button 
                disabled={tier === 'free' || !user}
                onClick={user ? undefined : signIn}
                className="w-full py-4 rounded-full font-sans text-xs uppercase tracking-widest bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-50 transition-colors hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                {!user ? "Đăng nhập để xem" : tier === 'free' ? "Đang sử dụng" : "Gói cơ bản"}
              </button>
            </div>

            {/* PREMIUM CARD */}
            <div className={`p-8 rounded-2xl border-2 flex flex-col relative ${tier === 'premium' ? 'border-amber-400' : 'border-gray-100 dark:border-slate-800'}`}>
              <h3 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500 mb-1">Chuyên sâu</h3>
              <div className="font-serif text-2xl text-[#333] dark:text-slate-100 mb-5">Premium</div>
              <div className="flex items-baseline gap-1.5 mb-6 border-b border-gray-100 dark:border-slate-800 pb-6">
                <span className="font-serif text-4xl text-[#111] dark:text-white">30k</span>
                <span className="font-sans text-[10px] text-amber-500 uppercase tracking-widest">/ tháng</span>
              </div>
              
              <ul className="flex-grow flex flex-col gap-4 font-sans text-sm text-gray-600 dark:text-slate-300 mb-8 list-none p-0">
                <li className="flex gap-3"><span className="text-amber-400 font-bold">✓</span> Bao gồm tất cả đặc quyền Basic.</li>
                <li className="flex gap-3"><span className="text-amber-400 font-bold">✓</span> Mở khóa toàn bộ bài Deep-dive.</li>
                <li className="flex gap-3"><span className="text-amber-400 font-bold">✓</span> Tải các Template & Framework quản lý.</li>
                <li className="flex gap-3"><span className="text-amber-400 font-bold">✓</span> Bookmark: Lưu trữ danh sách bài viết để đọc sau.</li>
              </ul>
              
              {tier === 'premium' ? (
                <button disabled className="w-full py-4 rounded-full font-sans text-xs uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800 cursor-default">
                  Đang sử dụng
                </button>
              ) : (
                <UpgradeButton igLink={igLink} ctaText="Nâng cấp Premium" isPro={true} user={user} signIn={signIn} />
              )}
            </div>

            {/* VIP CARD */}
            <div className={`p-8 rounded-2xl border flex flex-col relative bg-purple-50/50 dark:bg-purple-900/10 ${tier === 'vip' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)] shadow-purple-500/20' : 'border-purple-200 dark:border-purple-800/50'}`}>
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-purple-600 text-white font-sans text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full font-bold">
                RECOMMENDED
              </div>

              <h3 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-500 mb-1">Đặc quyền & Tương tác</h3>
              <div className="font-serif text-2xl text-purple-900 dark:text-purple-100 mb-5">VIP</div>
              <div className="flex items-baseline gap-1.5 mb-6 border-b border-purple-200 dark:border-purple-800/50 pb-6">
                <span className="font-serif text-4xl text-purple-900 dark:text-white">60k</span>
                <span className="font-sans text-[10px] text-purple-500 uppercase tracking-widest">/ tháng</span>
              </div>
              
              <ul className="flex-grow flex flex-col gap-4 font-sans text-sm text-gray-700 dark:text-slate-200 mb-8 list-none p-0">
                <li className="flex gap-3"><span className="text-purple-500 font-bold">✓</span> Bao gồm tất cả đặc quyền Premium.</li>
                <li className="flex gap-3"><span className="text-purple-500 font-bold">✓</span> Đọc chủ động: Save & Highlight trích dẫn không giới hạn.</li>
                <li className="flex gap-3"><span className="text-purple-500 font-bold">✓</span> Micro-strategies thực chiến & Q&A gỡ rối trực tiếp cùng Nero.</li>
                <li className="flex gap-3"><span className="text-purple-500 font-bold">✓</span> Early Access (Đọc trước bài viết/tính năng mới).</li>
              </ul>
              
              {tier === 'vip' ? (
                <button disabled className="w-full py-4 rounded-full font-sans text-xs uppercase tracking-widest bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 cursor-default">
                  Đang sử dụng
                </button>
              ) : (
                <UpgradeButton igLink={igLink} ctaText="Trở thành VIP" isPro={false} user={user} signIn={signIn} />
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UpgradeButton({ igLink, ctaText, isPro, user, signIn }: { igLink: string; ctaText: string; isPro: boolean; user: any; signIn: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="absolute inset-x-0 bottom-0 top-auto md:inset-0 z-20 bg-white/95 dark:bg-[#0f111a]/95 backdrop-blur-xl rounded-b-2xl md:rounded-2xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-300">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          ✕
        </button>
        <div className="flex-grow flex flex-col justify-center max-w-[90%] md:max-w-none">
          <h4 className="font-serif text-xl text-amber-600 dark:text-amber-500 mb-3 block">Hướng dẫn kích hoạt gói</h4>
          <p className="font-sans text-[13px] leading-relaxed text-gray-600 dark:text-slate-300 mb-6 border-l-[3px] pl-4 border-amber-300 dark:border-amber-700/50">
            Hiện tại hệ thống đang nâng cấp cổng thanh toán. Để kích hoạt gói, bạn vui lòng nhắn tin trực tiếp cho Nero qua Instagram.
            <br/><br/>
            <span className="font-semibold text-gray-900 dark:text-white">Lưu ý quan trọng:</span> Nhớ gửi kèm địa chỉ <span className="underline pr-1 bg-amber-100 dark:bg-amber-900/30 font-medium">{user?.email || "Email của bạn"}</span> để được cấp quyền ngay nhé!
          </p>
        </div>
        <a 
          href={igLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center py-4 rounded-full font-sans text-xs font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] shadow-xl shadow-black/10 dark:shadow-white/10 transition-transform mt-auto"
        >
          Đến Instagram của Nero →
        </a>
      </div>
    );
  }

  const baseClasses = "w-full py-4 rounded-full font-sans text-xs uppercase tracking-widest transition-all duration-300";
  const proClasses = "bg-amber-400 text-[#222] hover:bg-amber-500 font-bold shadow-lg shadow-amber-400/20";
  const vipClasses = "bg-purple-600 text-white hover:bg-purple-700 font-bold shadow-lg shadow-purple-600/20";

  return (
    <button 
      onClick={() => {
        if (!user) {
          signIn();
        } else {
          setIsOpen(true);
        }
      }}
      className={`${baseClasses} ${isPro ? proClasses : vipClasses}`}
    >
      {ctaText}
    </button>
  );
}

