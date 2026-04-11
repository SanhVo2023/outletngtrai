"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbx5v2PxjACmodCPXun893mlkML-UFq0_mHxJr7ImIutbj09KVQaJWRS2Ir23MHKQjkt6A/exec";

type FormState = "idle" | "submitting" | "success" | "error";

const DISCOUNTS = ["-10%", "-15%", "-20%", "-30%", "-40%", "-50%", "-60%", "-70%", "-80%"];

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [voucherCode, setVoucherCode] = useState("");

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
        setVoucherCode(data.voucherCode || "");
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
    <main className="flex flex-col min-h-dvh bg-[#0a0a0a] relative overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="relative z-20 bg-black border-b border-white/5">
        <div className="flex items-center justify-center py-3 px-4">
          <Image
            src="/logo.png"
            alt="Mắt Việt"
            width={130}
            height={44}
            className="h-9 w-auto"
            priority
          />
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative z-10 overflow-hidden">
        <div className="relative bg-gradient-to-b from-black via-[#0a0a0a] to-[#0a0a0a] py-10 px-4">
          {/* Sunburst rays */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="sunburst absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" />
            <div className="sunburst-red absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" />
          </div>

          {/* Subtle red glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[radial-gradient(ellipse,rgba(220,38,38,0.1),transparent_70%)] pointer-events-none" />

          <div className="relative text-center">
            {/* Ghost SALE text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
              <span className="sale-text-stroke text-[120px] font-black tracking-tighter leading-none">
                SALE
              </span>
            </div>

            <div className="relative z-10 py-4">
              {/* Outlet badge */}
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
                  Outlet Nguyễn Trãi
                </span>
              </div>

              {/* OUTLET SALE */}
              <h1 className="text-5xl font-black text-white tracking-tight mb-1">
                <span className="text-[#dc2626]">OUTLET</span> SALE
              </h1>

              {/* 50%++ */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-white/20" />
                <span className="text-2xl font-black text-[#f5c518]">
                  UP TO 50%
                  <span className="text-[#dc2626]">++</span>
                </span>
                <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-white/20" />
              </div>

              <p className="text-sm text-white/40">
                Kính mắt chính hãng &mdash; Giá Outlet cực sốc
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-[#f5c518]/10 border border-[#f5c518]/20 rounded-lg px-4 py-2">
                <span className="text-[#f5c518] text-sm font-bold">Voucher giảm thêm $10</span>
                <span className="text-white/40 text-xs">cho mỗi đơn hàng tại Outlet</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RED DISCOUNT TICKER ===== */}
        <div className="relative bg-[#dc2626] py-2.5 overflow-hidden">
          <div className="ticker-scroll flex whitespace-nowrap">
            {[...DISCOUNTS, ...DISCOUNTS].map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center mx-4 text-white font-black text-lg"
              >
                <span className="text-2xl">{d}</span>
                <span className="mx-4 w-1.5 h-1.5 rounded-full bg-white/40" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FORM SECTION ===== */}
      <section className="relative z-10 px-4 pt-6 pb-4 flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-5 animate-fade-in-up">
            <h2 className="text-xl font-bold tracking-tight text-white mb-1.5">
              Nhận Voucher{" "}
              <span className="text-[#dc2626]">Ưu Đãi Độc Quyền</span>
            </h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Đăng ký để nhận voucher giảm thêm <span className="text-[#f5c518] font-semibold">$10</span> cho mỗi đơn hàng tại Outlet qua SMS
            </p>
          </div>

          {formState === "success" ? (
            <div className="animate-fade-in-up bg-[#111] rounded-2xl border border-[#f5c518]/30 p-6 text-center shadow-lg shadow-black/30">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f5c518] flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Đăng Ký Thành Công!</h2>
              <p className="text-white/40 text-sm mb-4">{message}</p>
              {voucherCode && (
                <div className="bg-black rounded-xl border border-[#f5c518]/20 p-4 mb-3">
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Mã Voucher của bạn</p>
                  <p className="text-2xl font-black text-[#f5c518] tracking-widest">{voucherCode}</p>
                </div>
              )}
              <p className="text-xs text-white/30">Mã voucher giảm thêm $10 cho mỗi đơn hàng đã được gửi qua SMS</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in-up animate-delay-200">
              <input
                type="text"
                placeholder="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-[#141414] border border-white/8 rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:border-[#dc2626]/50 transition-colors disabled:opacity-50"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-[#141414] border border-white/8 rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:border-[#dc2626]/50 transition-colors disabled:opacity-50"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-[#141414] border border-white/8 rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:border-[#dc2626]/50 transition-colors disabled:opacity-50"
              />

              {formState === "error" && message && (
                <div className="bg-red-950/40 border border-red-800/30 rounded-xl px-4 py-3 text-red-400 text-xs">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={formState === "submitting"}
                className="pulse-yellow w-full bg-[#f5c518] hover:bg-[#ffd84d] text-black font-bold text-sm py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none mt-1"
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
                  "NHẬN VOUCHER NGAY"
                )}
              </button>

              <p className="text-[10px] text-white/20 text-center leading-relaxed pt-1">
                Bằng việc đăng ký, bạn đồng ý nhận thông tin ưu đãi từ Mắt Việt qua SMS và email.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 mt-auto bg-black border-t border-white/5">
        <div className="mx-auto max-w-md px-4 py-5">
          <div className="text-center space-y-1">
            <p className="text-xs text-white/40 font-medium">
              Mắt Việt Outlet &mdash; Nguyễn Trãi
            </p>
            <p className="text-[10px] text-white/20">
              Chuỗi bán lẻ kính mắt chính hãng từ năm 1989
            </p>
            <p className="text-[10px] text-white/15">
              &copy; {new Date().getFullYear()} Mắt Việt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
