"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbzv_G-W5oBUjiNdN4V00eSPhAN6dwkQlAyfm4Gz4GyjufHQuxWTv5InOwD23SIXv_rt/exec";

type FormState = "idle" | "submitting" | "success" | "error";

const DISCOUNTS = ["GIẢM 10%", "GIẢM 20%", "GIẢM 30%", "GIẢM 50%", "GIẢM 70%", "XẢ HÀNG", "HÀNG HIỆU"];

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
    <main className="flex flex-col min-h-dvh bg-[#dc2626] relative overflow-hidden">
      {/* Sunburst on full page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="sunburst absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-20 bg-[#dc2626] pt-4 pb-2">
        <div className="flex items-center justify-center px-4">
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

      {/* ===== HERO: BLACK CARD (like campaign) ===== */}
      <section className="relative z-10 px-5 pt-4 pb-2">
        <div className="mx-auto max-w-sm bg-black rounded-3xl p-6 text-center shadow-2xl shadow-black/40">
          {/* Brand */}
          <h1 className="text-2xl font-black text-white tracking-tight mb-0.5">
            MẮT VIỆT{" "}
            <span className="text-[#dc2626] bg-white px-2 py-0.5 rounded-md text-xl ml-1">
              OUTLET
            </span>
          </h1>
          <p className="text-white/50 text-xs mb-4">
            119 Nguyễn Trãi, P. Bến Thành, TP. HCM
          </p>

          {/* Main message */}
          <p className="text-white/70 text-sm font-semibold uppercase tracking-wide mb-2">
            Xả hàng mắt kính hàng hiệu
          </p>

          {/* Big 70%++ */}
          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className="text-7xl font-black text-white leading-none">70</span>
            <div className="flex flex-col items-start">
              <span className="text-3xl font-black text-[#f5c518] leading-none">%</span>
              <span className="text-lg font-black text-[#f5c518] leading-none -mt-1">++</span>
            </div>
          </div>

          {/* Voucher info */}
          <div className="bg-white/10 rounded-xl px-4 py-2.5">
            <p className="text-white text-sm font-bold">
              Nhận thêm voucher giảm <span className="text-[#f5c518]">10%</span>
            </p>
            <p className="text-white/50 text-xs">cho mỗi đơn hàng tại Outlet</p>
          </div>
        </div>
      </section>

      {/* ===== WHITE TICKER ===== */}
      <div className="relative z-10 bg-white py-2 my-3 overflow-hidden">
        <div className="ticker-scroll flex whitespace-nowrap">
          {[...DISCOUNTS, ...DISCOUNTS].map((d, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-3 text-[#dc2626] font-black text-sm"
            >
              {d}
              <span className="mx-3 w-1 h-1 rounded-full bg-[#dc2626]/30" />
            </span>
          ))}
        </div>
      </div>

      {/* ===== FORM SECTION ===== */}
      <section className="relative z-10 px-5 pt-2 pb-4 flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-4 animate-fade-in-up">
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">
              Nhận Voucher Ưu Đãi
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Đăng ký để nhận voucher giảm thêm <span className="text-white font-bold">10%</span> qua SMS
            </p>
          </div>

          {formState === "success" ? (
            <div className="animate-fade-in-up bg-black rounded-2xl p-6 text-center shadow-xl shadow-black/30">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#f5c518] flex items-center justify-center">
                <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Đăng Ký Thành Công!</h2>
              <p className="text-white/50 text-sm mb-4">{message}</p>
              {voucherCode && (
                <div className="bg-white/10 rounded-xl p-4 mb-3">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Mã Voucher của bạn</p>
                  <p className="text-2xl font-black text-[#f5c518] tracking-widest">{voucherCode}</p>
                </div>
              )}
              <p className="text-xs text-white/40">Voucher giảm 10% đã được gửi qua SMS</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in-up animate-delay-200">
              <input
                type="text"
                placeholder="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/50 text-sm focus:border-white/50 focus:bg-white/20 transition-colors disabled:opacity-50"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/50 text-sm focus:border-white/50 focus:bg-white/20 transition-colors disabled:opacity-50"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={formState === "submitting"}
                className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/50 text-sm focus:border-white/50 focus:bg-white/20 transition-colors disabled:opacity-50"
              />

              {formState === "error" && message && (
                <div className="bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-xs">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={formState === "submitting"}
                className="pulse-btn w-full bg-black text-white font-bold text-sm py-4 rounded-xl transition-all hover:bg-black/80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none mt-1"
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

              <p className="text-[10px] text-white/40 text-center leading-relaxed pt-1">
                Bằng việc đăng ký, bạn đồng ý nhận thông tin ưu đãi từ Mắt Việt qua SMS và email.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 mt-auto bg-black/20">
        <div className="mx-auto max-w-sm px-4 py-4">
          <div className="text-center space-y-0.5">
            <p className="text-xs text-white/70 font-medium">
              Mắt Việt Outlet &mdash; 119 Nguyễn Trãi
            </p>
            <p className="text-[10px] text-white/40">
              Chuỗi bán lẻ kính mắt chính hãng từ năm 1989
            </p>
            <p className="text-[10px] text-white/30">
              &copy; {new Date().getFullYear()} Mắt Việt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
