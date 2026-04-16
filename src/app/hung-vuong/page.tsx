"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbydUC8f45a15Rmp7G7aa1m0f2a9PP7UbCRa0Y7SDD6Infk8Vqrs1KRpaBLyW9mw-qb2/exec";

type FormState = "idle" | "submitting" | "success" | "error";

export default function HungVuongPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setMessage("Vui lòng điền đầy đủ thông tin.");
      setFormState("error");
      return;
    }

    const phoneClean = phone.replace(/\s/g, "");
    if (!/^(0|\+84)\d{9,10}$/.test(phoneClean)) {
      setMessage("Số điện thoại không hợp lệ.");
      setFormState("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Email không hợp lệ.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setMessage("");

    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({
          hoTen: name.trim(),
          sdt: phoneClean,
          email: email.trim(),
        }),
        headers: { "Content-Type": "text/plain" },
        redirect: "follow",
      });

      const data = await res.json();

      if (data.status === "success") {
        setFormState("success");
        setMessage(data.message);
      } else {
        setFormState("error");
        setMessage(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch {
      setFormState("error");
      setMessage("Không thể kết nối server. Vui lòng thử lại sau.");
    }
  }

  return (
    <main className="flex flex-col min-h-dvh bg-[#fde047] relative overflow-hidden">
      {/* Full-page sunburst */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="sunburst-navy absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full" />
      </div>

      {/* ===== HEADER - LOGO ===== */}
      <header className="relative z-20 pt-5 pb-2">
        <div className="flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl px-5 py-2 shadow-lg shadow-black/10">
            <Image
              src="/logo.png"
              alt="Mắt Việt"
              width={130}
              height={44}
              className="h-9 w-auto"
              priority
            />
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative z-10 px-4 pt-2 pb-4 text-center">
        {/* GRAND OPENING */}
        <h1 className="text-outline-navy text-[44px] sm:text-[52px] font-black tracking-tight leading-none mb-2">
          GRAND OPENING
        </h1>

        {/* Date */}
        <p className="text-[#1e3a8a] text-lg font-bold tracking-wide mb-4">
          17.04 &mdash; 03.05.2026
        </p>

        {/* 15% OFF block */}
        <div className="relative inline-flex items-center justify-center gap-2 mb-5">
          <span className="text-percent-hero text-[110px] sm:text-[130px] font-black leading-none">
            15
          </span>
          <div className="flex flex-col items-start gap-2">
            <span className="text-percent-hero text-5xl font-black leading-none">%</span>
            {/* OFF red badge */}
            <span className="off-badge bg-[#dc2626] text-white font-black text-xl px-3 py-1 rounded-sm shadow-lg shadow-black/20">
              OFF
            </span>
          </div>
        </div>

        {/* TẤT CẢ SẢN PHẨM navy pill */}
        <div className="mx-auto max-w-xs bg-[#1e3a8a] text-[#fde047] font-black text-lg tracking-wide py-3 px-6 rounded-full shadow-xl shadow-black/20 mb-4">
          TẤT CẢ SẢN PHẨM
        </div>

        {/* Fine print */}
        <div className="text-[#1e3a8a] text-[10px] italic leading-relaxed max-w-xs mx-auto space-y-0.5">
          <p>
            *Áp dụng cho gọng kính, kính mát và tròng kính nguyên giá, ngoại trừ
            các thương hiệu Miu Miu, Lindberg, Cartier, Prada, Maui Jim, Flyer
            Kids, kính áp tròng và phụ kiện
          </p>
          <p className="font-semibold">
            **Chỉ áp dụng cửa hàng Mắt Việt Hùng Vương
          </p>
        </div>
      </section>

      {/* ===== STORE INFO BANNER ===== */}
      <section className="relative z-10 bg-[#fde047] px-4 py-4 border-y-2 border-[#1e3a8a]/10">
        <div className="text-center">
          <h2 className="text-[#1e3a8a] font-black text-xl sm:text-2xl tracking-tight leading-tight mb-1">
            CỬA HÀNG MẮT VIỆT HÙNG VƯƠNG
          </h2>
          <p className="text-[#1e3a8a]/80 text-xs font-semibold tracking-wide">
            TẦNG 1 HÙNG VƯƠNG PLAZA, SỐ 126 HỒNG BÀNG, P. CHỢ LỚN, TP.HCM
          </p>
        </div>
      </section>

      {/* ===== FORM SECTION ===== */}
      <section className="relative z-10 px-5 pt-5 pb-4 flex-1 flex flex-col bg-gradient-to-b from-[#fde047] to-[#fcd34d]">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-4 animate-fade-in-up">
            <h3 className="text-[#1e3a8a] text-xl font-black tracking-tight mb-1">
              Đăng Ký Nhận Thông Tin
            </h3>
            <p className="text-[#1e3a8a]/70 text-sm leading-relaxed">
              Để không bỏ lỡ ưu đãi Grand Opening
            </p>
          </div>

          {formState === "success" ? (
            <div className="animate-fade-in-up bg-[#1e3a8a] rounded-2xl p-6 text-center shadow-xl shadow-black/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#fde047] flex items-center justify-center">
                <svg className="w-7 h-7 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Đăng Ký Thành Công!</h2>
              <p className="text-white/70 text-sm mb-3">{message}</p>
              <div className="bg-white/10 rounded-xl p-3 mt-3">
                <p className="text-[#fde047] text-xs font-bold uppercase tracking-wider mb-0.5">Hẹn gặp tại</p>
                <p className="text-white text-sm font-semibold">
                  Mắt Việt Hùng Vương
                </p>
                <p className="text-white/60 text-xs mt-1">
                  Tầng 1 Hùng Vương Plaza &mdash; 17.04.2026
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in-up animate-delay-200">
              <input
                type="text"
                placeholder="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-white border-2 border-[#1e3a8a]/20 rounded-xl px-4 py-3.5 text-[#1e3a8a] placeholder:text-[#1e3a8a]/40 text-sm font-medium focus:border-[#1e3a8a] transition-colors disabled:opacity-50"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-white border-2 border-[#1e3a8a]/20 rounded-xl px-4 py-3.5 text-[#1e3a8a] placeholder:text-[#1e3a8a]/40 text-sm font-medium focus:border-[#1e3a8a] transition-colors disabled:opacity-50"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-white border-2 border-[#1e3a8a]/20 rounded-xl px-4 py-3.5 text-[#1e3a8a] placeholder:text-[#1e3a8a]/40 text-sm font-medium focus:border-[#1e3a8a] transition-colors disabled:opacity-50"
              />

              {formState === "error" && message && (
                <div className="bg-[#dc2626] rounded-xl px-4 py-3 text-white text-xs font-medium">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={formState === "submitting"}
                className="pulse-navy w-full bg-[#1e3a8a] hover:bg-[#172554] text-[#fde047] font-black text-base py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none mt-1 tracking-wide"
              >
                {formState === "submitting" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  "ĐĂNG KÝ NGAY"
                )}
              </button>

              <p className="text-[10px] text-[#1e3a8a]/60 text-center leading-relaxed pt-1">
                Bằng việc đăng ký, bạn đồng ý nhận thông tin ưu đãi từ Mắt Việt.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 mt-auto bg-[#1e3a8a] text-white">
        <div className="mx-auto max-w-sm px-4 py-5">
          <div className="flex items-center justify-around text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#fde047] flex items-center justify-center text-[#1e3a8a] font-black text-[10px]">
                W
              </span>
              <span>matviet.vn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#fde047] flex items-center justify-center text-[#1e3a8a] font-black text-[10px]">
                ☎
              </span>
              <span>1900 6081</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#fde047] flex items-center justify-center text-[#1e3a8a] font-black text-[10px]">
                f
              </span>
              <span>matviet.vn</span>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/50 mt-3">
            &copy; {new Date().getFullYear()} Mắt Việt. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
