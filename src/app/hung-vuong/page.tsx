"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycby5xRTHaom7RbmUtQMbyqYeQCqpF8lovDCpqsWT_pPAbvVNCwaaO092Op4eBlXxUWnS/exec";

type FormState = "idle" | "submitting" | "ready" | "spinning" | "result" | "error";

type Gift = {
  slot: number;
  name: string;
  short: string;
  code: string;
  image: string;   // placeholder icon for wheel segment
  banner: string;  // full "winning" banner shown on result screen
  segmentColor: string;
  textColor: string;
};

// 7 gift slots matching the GAS Gifts sheet
const GIFTS: Gift[] = [
  { slot: 1, name: "Giá đỡ điện thoại mascot Mắt Việt", short: "Giá đỡ\nđiện thoại", code: "GIADODT",        image: "/gifts/gift-1.png", banner: "/gifts/banners/gia-do-dien-thoai.jpg",     segmentColor: "#1e3a8a", textColor: "#fde047" },
  { slot: 2, name: "Quạt xếp cầm tay",                  short: "Quạt xếp\ncầm tay",  code: "QUATXEPCAMTAY", image: "/gifts/gift-2.png", banner: "/gifts/banners/quat-cam-tay.jpg",          segmentColor: "#dc2626", textColor: "#ffffff" },
  { slot: 3, name: "Phụ kiện đính kèm khăn",            short: "Phụ kiện\nkèm khăn", code: "MOCTREOMATVIET",image: "/gifts/gift-3.png", banner: "/gifts/banners/phu-kien-dinh-kem-khan.jpg",segmentColor: "#fde047", textColor: "#1e3a8a" },
  { slot: 4, name: "Quai treo ly Mắt Việt",             short: "Quai treo\nly",      code: "QUAITREOLYMV",  image: "/gifts/gift-4.png", banner: "/gifts/banners/quai-deo-ly.jpg",           segmentColor: "#ffffff", textColor: "#1e3a8a" },
  { slot: 5, name: "Gương móc khóa Mắt Việt",           short: "Gương\nmóc khóa",    code: "MKG-SSM009",    image: "/gifts/gift-5.png", banner: "/gifts/banners/guong-moc-khoa.jpg",        segmentColor: "#1e3a8a", textColor: "#fde047" },
  { slot: 6, name: "Hộp đựng kính BD117",               short: "Hộp đựng\nkính 1",   code: "HK-BD117",      image: "/gifts/gift-6.png", banner: "/gifts/banners/hop-kinh-BD117.jpg",        segmentColor: "#dc2626", textColor: "#ffffff" },
  { slot: 7, name: "Hộp đựng kính BD054",               short: "Hộp đựng\nkính 2",   code: "HK-BD054",      image: "/gifts/gift-7.png", banner: "/gifts/banners/hop-dung-kinh-BD054.jpg",   segmentColor: "#fde047", textColor: "#1e3a8a" },
];

const SEGMENT_DEG = 360 / GIFTS.length;

// Convert polar to Cartesian for SVG arc
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export default function HungVuongPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [wonGift, setWonGift] = useState<Gift | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const notifiedRef = useRef(false);
  const phoneRef = useRef("");

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
          action: "spin",
          hoTen: name.trim(),
          sdt: phoneClean,
          email: email.trim(),
        }),
        headers: { "Content-Type": "text/plain" },
        redirect: "follow",
      });

      const data = await res.json();

      if (data.status === "success") {
        const gift = GIFTS.find((g) => g.slot === data.giftSlot);
        if (gift) {
          setWonGift({ ...gift, name: data.giftName, code: data.giftCode });
          phoneRef.current = phoneClean;
          notifiedRef.current = false;
          setFormState("ready");
        } else {
          setFormState("error");
          setMessage("Dữ liệu không hợp lệ. Vui lòng thử lại.");
        }
      } else {
        setFormState("error");
        setMessage(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch {
      setFormState("error");
      setMessage("Không thể kết nối server. Vui lòng thử lại sau.");
    }
  }

  // Fire "notify" when result becomes visible — SMS delivery syncs with popup
  useEffect(() => {
    if (formState !== "result" || notifiedRef.current || !phoneRef.current) return;
    notifiedRef.current = true;
    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "notify", sdt: phoneRef.current }),
      headers: { "Content-Type": "text/plain" },
      redirect: "follow",
      keepalive: true,
    }).catch(() => {
      // Silent — logged row on server will show "Chưa gửi", admin can resend manually
    });
  }, [formState]);

  function handleSpin() {
    if (!wonGift || formState === "spinning") return;
    setFormState("spinning");

    // Target angle: land so the winning segment sits under the top pointer.
    // Segment i covers [i * SEG, (i+1) * SEG) from the top; its center is (i + 0.5) * SEG.
    // Pointer is at top (0°); we need wheel rotated so center of target aligns with 0° (i.e., top).
    // That means rotation = 360 - center_of_segment (mod 360), plus several full turns.
    const segmentIndex = wonGift.slot - 1;
    const segmentCenter = segmentIndex * SEGMENT_DEG + SEGMENT_DEG / 2;
    const targetRotation = 360 - segmentCenter;
    const spins = 6;
    const final = spins * 360 + targetRotation;
    setWheelRotation(final);

    window.setTimeout(() => setFormState("result"), 4800);
  }

  return (
    <main className="flex flex-col min-h-dvh bg-[#fde047] relative overflow-hidden">
      {/* Full-page sunburst */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="sunburst-navy absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full" />
      </div>

      {/* ===== HEADER - LOGO (navy card for visibility) ===== */}
      <header className="relative z-20 pt-5 pb-2">
        <div className="flex items-center justify-center px-4">
          <div className="bg-[#1e3a8a] rounded-2xl px-5 py-2.5 shadow-lg shadow-black/20 border-2 border-[#fde047]/40">
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
      {formState !== "spinning" && formState !== "result" && (
        <section className="relative z-10 px-4 pt-2 pb-3 text-center">
          <h1 className="text-outline-navy text-[42px] sm:text-[52px] font-black tracking-tight leading-none mb-2">
            GRAND OPENING
          </h1>
          <p className="text-[#1e3a8a] text-base font-bold tracking-wide mb-3">
            17.04 &mdash; 03.05.2026
          </p>
          <div className="relative inline-flex items-center justify-center gap-2 mb-3">
            <span className="text-percent-hero text-[86px] sm:text-[110px] font-black leading-none">15</span>
            <div className="flex flex-col items-start gap-1">
              <span className="text-percent-hero text-4xl font-black leading-none">%</span>
              <span className="off-badge bg-[#dc2626] text-white font-black text-base px-2.5 py-0.5 rounded-sm shadow-lg shadow-black/20">
                OFF
              </span>
            </div>
          </div>
          <div className="mx-auto max-w-xs bg-[#1e3a8a] text-[#fde047] font-black text-sm tracking-wide py-2.5 px-6 rounded-full shadow-xl shadow-black/20">
            TẤT CẢ SẢN PHẨM
          </div>
        </section>
      )}

      {/* ===== STATE: IDLE / ERROR / SUBMITTING → show form ===== */}
      {(formState === "idle" || formState === "submitting" || formState === "error") && (
        <>
          <section className="relative z-10 bg-[#fde047] px-4 py-3 border-y-2 border-[#1e3a8a]/10 mt-2">
            <div className="text-center">
              <h2 className="text-[#1e3a8a] font-black text-lg sm:text-xl tracking-tight leading-tight">
                CỬA HÀNG MẮT VIỆT HÙNG VƯƠNG
              </h2>
              <p className="text-[#1e3a8a]/80 text-[11px] font-semibold tracking-wide">
                TẦNG 1 HÙNG VƯƠNG PLAZA, 126 HỒNG BÀNG, P. CHỢ LỚN, TP.HCM
              </p>
            </div>
          </section>

          <section className="relative z-10 px-5 pt-4 pb-4 flex-1 flex flex-col bg-gradient-to-b from-[#fde047] to-[#fcd34d]">
            <div className="mx-auto w-full max-w-sm">
              <div className="text-center mb-4 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-[#1e3a8a] text-[#fde047] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
                  <span>🎁</span>
                  <span>Vòng Quay May Mắn</span>
                </div>
                <h3 className="text-[#1e3a8a] text-xl font-black tracking-tight mb-1">
                  Đăng Ký &amp; Quay Quà
                </h3>
                <p className="text-[#1e3a8a]/70 text-sm leading-relaxed">
                  Mỗi SĐT chỉ được quay <span className="font-bold text-[#dc2626]">1 lần duy nhất</span>
                </p>
              </div>

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
                    "ĐĂNG KÝ & QUAY QUÀ"
                  )}
                </button>

                <p className="text-[10px] text-[#1e3a8a]/60 text-center leading-relaxed pt-1">
                  Bằng việc đăng ký, bạn đồng ý nhận thông tin ưu đãi từ Mắt Việt qua SMS và email.
                </p>
              </form>
            </div>
          </section>
        </>
      )}

      {/* ===== STATE: READY / SPINNING → show wheel ===== */}
      {(formState === "ready" || formState === "spinning") && wonGift && (
        <section className="relative z-10 flex-1 flex flex-col items-center px-4 pt-2 pb-6">
          <div className="text-center mb-3 animate-fade-in-up">
            <h2 className="text-[#1e3a8a] text-xl font-black tracking-tight">
              Quay Để Nhận Quà
            </h2>
            <p className="text-[#1e3a8a]/70 text-xs">
              {formState === "spinning" ? "Vòng quay đang chọn phần quà..." : "Nhấn SPIN để xem phần quà của bạn!"}
            </p>
          </div>

          {/* Wheel */}
          <div className="relative w-[320px] h-[320px] max-w-[85vw] max-h-[85vw]">
            {/* Pointer */}
            <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-[#dc2626] drop-shadow-lg" />
            </div>

            {/* Wheel SVG */}
            <div
              className="absolute inset-0 transition-transform"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transitionDuration: formState === "spinning" ? "4.5s" : "0s",
                transitionTimingFunction: "cubic-bezier(0.15, 0.7, 0.25, 1)",
              }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                {/* Outer ring */}
                <circle cx="100" cy="100" r="99" fill="#1e3a8a" />
                <circle cx="100" cy="100" r="96" fill="#fde047" />

                {/* Segments */}
                {GIFTS.map((g, i) => {
                  const start = i * SEGMENT_DEG;
                  const end = (i + 1) * SEGMENT_DEG;
                  const mid = start + SEGMENT_DEG / 2;
                  const labelPos = polar(100, 100, 58, mid);
                  const iconPos = polar(100, 100, 75, mid);
                  return (
                    <g key={g.slot}>
                      <path
                        d={segmentPath(100, 100, 96, start, end)}
                        fill={g.segmentColor}
                        stroke="#1e3a8a"
                        strokeWidth="0.5"
                      />
                      {/* Transparent gift image — counter-rotated so it stays radially aligned */}
                      <g transform={`rotate(${mid}, ${iconPos.x}, ${iconPos.y})`}>
                        <image
                          href={g.image}
                          x={iconPos.x - 14}
                          y={iconPos.y - 14}
                          width="28"
                          height="28"
                          preserveAspectRatio="xMidYMid meet"
                        />
                      </g>
                      {/* Label */}
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        textAnchor="middle"
                        fontSize="6.5"
                        fontWeight="800"
                        fill={g.textColor}
                        transform={`rotate(${mid}, ${labelPos.x}, ${labelPos.y})`}
                      >
                        {g.short.split("\n").map((line, li) => (
                          <tspan key={li} x={labelPos.x} dy={li === 0 ? 0 : 7}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}

                {/* Inner circle */}
                <circle cx="100" cy="100" r="18" fill="#1e3a8a" stroke="#fde047" strokeWidth="2" />
              </svg>
            </div>

            {/* SPIN button in center (above wheel) */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={formState === "spinning"}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#1e3a8a] border-4 border-[#fde047] text-[#fde047] font-black text-sm shadow-xl z-10 active:scale-95 transition disabled:opacity-70 pulse-navy"
            >
              {formState === "spinning" ? "..." : "SPIN"}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-[#1e3a8a]/60 max-w-xs">
            Sau khi quay, mã quà sẽ được gửi qua SMS. Mang SMS đến cửa hàng để nhận quà.
          </p>
        </section>
      )}

      {/* ===== STATE: RESULT ===== */}
      {formState === "result" && wonGift && (
        <section className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 py-5 bg-[#ede0c6]">
          <div className="animate-fade-in-up w-full max-w-sm mx-auto">
            {/* Congrats ribbon */}
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-2 bg-[#1e3a8a] text-[#fde047] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                <span>🎉</span>
                <span>Chúc Mừng Quý Khách</span>
                <span>🎉</span>
              </div>
            </div>

            {/* Gift banner — matches the LẬT HÌNH LIỀN TAY aesthetic */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border-4 border-[#fde047] bg-[#ede0c6]">
              <Image
                src={wonGift.banner}
                alt={wonGift.name}
                width={800}
                height={800}
                className="w-full h-auto block"
                unoptimized
                priority
              />
            </div>

            {/* Voucher code line */}
            <div className="mt-3 bg-white rounded-xl border-2 border-[#1e3a8a]/15 px-4 py-2 text-center">
              <p className="text-[#1e3a8a]/50 text-[10px] uppercase tracking-wider font-semibold">
                Mã phần quà
              </p>
              <p className="text-[#1e3a8a] text-base font-black tracking-widest font-mono">
                {wonGift.code}
              </p>
            </div>

            {/* SMS + store info */}
            <div className="mt-3 bg-[#1e3a8a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">📱</span>
                <p className="text-[#fde047] text-[11px] font-black uppercase tracking-widest">
                  Tin nhắn đã được gửi
                </p>
              </div>
              <p className="text-white/80 text-xs leading-relaxed mb-2">
                Mã quà đã được gửi qua SMS. Vui lòng mang tin nhắn đến cửa hàng để nhận quà:
              </p>
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <p className="text-white text-sm font-black">Mắt Việt Hùng Vương</p>
                <p className="text-white/70 text-[11px]">
                  Tầng 1 Hùng Vương Plaza, 126 Hồng Bàng, P. Chợ Lớn, TP.HCM
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 mt-auto bg-[#1e3a8a] text-white">
        <div className="mx-auto max-w-sm px-4 py-4">
          <div className="flex items-center justify-around text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#fde047] flex items-center justify-center text-[#1e3a8a] font-black text-[10px]">W</span>
              <span>matviet.vn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#fde047] flex items-center justify-center text-[#1e3a8a] font-black text-[10px]">☎</span>
              <span>1900 6081</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#fde047] flex items-center justify-center text-[#1e3a8a] font-black text-[10px]">f</span>
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
