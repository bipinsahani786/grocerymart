import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useThemeStore } from "@/store/themeStore";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LoginForm, RegisterForm, RegisterOtpForm } from "../components/AuthForms";

export default function LoginPage() {
  const { appName, appLogo } = useAppStore();
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "otp">("login");
  const [registrationEmail, setRegistrationEmail] = useState("");

  const isDark = theme === "dark" || theme === "semi-dark";

  return (
    <div className={`flex min-h-screen w-screen flex-col overflow-hidden font-sans selection:bg-brand-accent selection:text-brand-on-accent lg:flex-row transition-colors duration-300 ${
      isDark ? "bg-brand-panel text-white" : "bg-cerulean text-white"
    }`}>
      
      {/* Theme Toggle Button in top-right */}
      <div className="absolute top-6 right-6 z-50 animate-in fade-in duration-700">
        <ModeToggle />
      </div>

      {/* Left Panel: Redesigned Premium Brand Section */}
      <div 
        className="relative hidden lg:flex flex-col items-center justify-between text-foreground px-12 py-20 lg:w-[35%] lg:min-h-screen z-10 bg-white"
      >
        {/* Premium C-shaped curved divider extending rightwards */}
        <div className="absolute top-0 bottom-0 -right-48 w-48 hidden lg:block pointer-events-none z-10">
          {/* Primary color-themed curved panel */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full fill-white"
          >
            <path d="M 100,0 C 20,20 20,80 100,100 L 0,100 L 0,0 Z" />
          </svg>
        </div>

        {/* Top Title & Logo */}
        <div className="relative z-10 self-start animate-in fade-in slide-in-from-top-6 duration-700 flex items-center gap-3 -mt-8 -ml-4">
          {appLogo ? (
            <img
              src={appLogo}
              alt={appName}
              className="h-9 w-9 object-contain"
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              className={`w-9 h-9 animate-[spin_45s_linear_infinite] transition-colors duration-300 ${
                isDark ? "text-willow-green" : "text-cerulean"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              {/* Outermost ring fragments */}
              <path d="M 50,5 A 45,45 0 0,1 95,50" strokeLinecap="round" />
              <path d="M 95,50 A 45,45 0 0,1 50,95" strokeLinecap="round" />
              <path d="M 50,95 A 45,45 0 0,1 5,50" strokeLinecap="round" />
              <path d="M 5,50 A 45,45 0 0,1 50,5" strokeLinecap="round" />

              {/* Spiral/curved network paths */}
              <path
                d="M 50,15 C 65,15 80,30 80,50 C 80,65 65,80 50,80 C 35,80 20,65 20,50 C 20,35 35,20 50,20"
                strokeWidth="2"
                strokeDasharray="3 3"
              />

              <path
                d="M 50,15 C 30,25 30,75 50,85 C 70,75 70,25 50,15"
                strokeWidth="2"
              />
              <path
                d="M 15,50 C 25,30 75,30 85,50 C 75,70 25,70 15,50"
                strokeWidth="2"
              />

              {/* Network nodes/dots */}
              <circle cx="50" cy="15" r="4.5" fill="currentColor" />
              <circle cx="85" cy="50" r="4.5" fill="currentColor" />
              <circle cx="50" cy="85" r="4.5" fill="currentColor" />
              <circle cx="15" cy="50" r="4.5" fill="currentColor" />

              <circle
                cx="50"
                cy="50"
                r="8"
                fill="currentColor"
                className={`animate-pulse transition-colors duration-300 ${
                  isDark ? "text-seagrass" : "text-dark-cyan"
                }`}
              />
              <circle cx="30" cy="30" r="3.5" fill="currentColor" />
              <circle cx="70" cy="30" r="3.5" fill="currentColor" />
              <circle cx="30" cy="70" r="3.5" fill="currentColor" />
              <circle cx="70" cy="70" r="3.5" fill="currentColor" />
            </svg>
          )}
          <span className="text-xl font-black tracking-tight text-zinc-900 uppercase">
            {appName.split(" ").map((word, idx) => (
              <span
                key={idx}
                className={
                  idx % 2 === 1
                    ? (isDark 
                        ? "bg-clip-text bg-gradient-to-r from-willow-green to-seagrass text-transparent ml-1.5 animate-pulse" 
                        : "bg-clip-text bg-gradient-to-r from-cerulean to-dark-cyan text-transparent ml-1.5"
                      )
                    : "text-zinc-900"
                }
              >
                {word}
              </span>
            ))}
          </span>
        </div>

        {/* Center Content: Logo & Brand Description */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm animate-in fade-in slide-in-from-left-8 duration-700">
          {/* Customized Spiral Network Logo with rotating ring effect */}
          <div className="relative mb-8 flex h-44 w-44 items-center justify-center rounded-full p-3 shadow-2xl border border-zinc-200/60 bg-zinc-50/50 group">
            {/* Pulsing gradient glow behind logo */}
            <div className={`absolute inset-0 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-all duration-300 bg-gradient-to-tr ${
              isDark ? "from-willow-green to-seagrass" : "from-cerulean to-dark-cyan"
            }`} />
            
            {appLogo ? (
              <img
                src={appLogo}
                alt={appName}
                className="max-h-32 max-w-32 object-contain"
              />
            ) : (
              <svg
                viewBox="0 0 100 100"
                className={`w-32 h-32 animate-[spin_45s_linear_infinite] transition-colors duration-300 ${
                  isDark ? "text-willow-green" : "text-cerulean"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                {/* Outermost ring fragments */}
                <path d="M 50,5 A 45,45 0 0,1 95,50" strokeLinecap="round" />
                <path d="M 95,50 A 45,45 0 0,1 50,95" strokeLinecap="round" />
                <path d="M 50,95 A 45,45 0 0,1 5,50" strokeLinecap="round" />
                <path d="M 5,50 A 45,45 0 0,1 50,5" strokeLinecap="round" />

                {/* Spiral/curved network paths */}
                <path
                  d="M 50,15 C 65,15 80,30 80,50 C 80,65 65,80 50,80 C 35,80 20,65 20,50 C 20,35 35,20 50,20"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />

                <path
                  d="M 50,15 C 30,25 30,75 50,85 C 70,75 70,25 50,15"
                  strokeWidth="2"
                />
                <path
                  d="M 15,50 C 25,30 75,30 85,50 C 75,70 25,70 15,50"
                  strokeWidth="2"
                />

                {/* Network nodes/dots */}
                <circle cx="50" cy="15" r="4.5" fill="currentColor" />
                <circle cx="85" cy="50" r="4.5" fill="currentColor" />
                <circle cx="50" cy="85" r="4.5" fill="currentColor" />
                <circle cx="15" cy="50" r="4.5" fill="currentColor" />

                <circle
                  cx="50"
                  cy="50"
                  r="8"
                  fill="currentColor"
                  className={`animate-pulse transition-colors duration-300 ${
                    isDark ? "text-seagrass" : "text-dark-cyan"
                  }`}
                />
                <circle cx="30" cy="30" r="3.5" fill="currentColor" />
                <circle cx="70" cy="30" r="3.5" fill="currentColor" />
                <circle cx="30" cy="70" r="3.5" fill="currentColor" />
                <circle cx="70" cy="70" r="3.5" fill="currentColor" />
              </svg>
            )}
          </div>

          {/* Brand Name & Tagline */}
          <div className="relative inline-block pb-1">
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">
              {appName.split(" ").map((word, idx) => (
                <span
                  key={idx}
                  className={
                    idx % 2 === 1
                      ? (isDark 
                          ? "bg-clip-text bg-gradient-to-r from-willow-green to-seagrass text-transparent ml-2" 
                          : "bg-clip-text bg-gradient-to-r from-cerulean to-dark-cyan text-transparent ml-2"
                        )
                      : "text-zinc-900"
                  }
                >
                  {word}
                </span>
              ))}
            </h1>
          </div>
          
          <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">
            The intelligent retail dashboard. Access real-time billing logs, analytics, and stock records.
          </p>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="relative z-10 flex gap-6 text-[11px] font-bold uppercase tracking-wider text-zinc-500 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-zinc-50 border-zinc-200/60">
            🔒 SSL Encrypted
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-zinc-50 border-zinc-200/60">
            ⚡ High Speed
          </span>
        </div>
      </div>

      {/* Right Panel: Styled Form Section */}
      <div className="flex w-full flex-1 flex-col items-center justify-center p-4 md:p-8 lg:w-[65%] z-0">
        <div className={`w-full max-w-md space-y-4 p-8 rounded-3xl shadow-2xl border transition-all duration-300 animate-in fade-in duration-700 ${
          isDark 
            ? "bg-slate-900/40 backdrop-blur-md border-white/10 text-white" 
            : "bg-white/90 backdrop-blur-md border-white/20 text-white"
        }`}>
          
          {/* Mobile-only Brand Header (hidden on desktop) */}
          <div className="flex flex-col items-center justify-center text-center lg:hidden mb-4 animate-in fade-in slide-in-from-top-6 duration-700">
            <div 
              className="mb-3 flex h-20 w-20 items-center justify-center rounded-full p-1 shadow-md border border-overlay-border bg-white/10"
            >
              {appLogo ? (
                <img
                  src={appLogo}
                  alt={appName}
                  className="max-h-16 max-w-16 object-contain"
                />
              ) : (
                <svg
                  viewBox="0 0 100 100"
                  className="w-14 h-14 text-willow-green animate-[spin_60s_linear_infinite]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M 50,5 A 45,45 0 0,1 95,50" strokeLinecap="round" />
                  <path d="M 95,50 A 45,45 0 0,1 50,95" strokeLinecap="round" />
                  <path d="M 50,95 A 45,45 0 0,1 5,50" strokeLinecap="round" />
                  <path d="M 5,50 A 45,45 0 0,1 50,5" strokeLinecap="round" />
                  <path d="M 50,15 C 65,15 80,30 80,50 C 80,65 65,80 50,80 C 35,80 20,65 20,50 C 20,35 35,20 50,20" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M 50,15 C 30,25 30,75 50,85 C 70,75 70,25 50,15" strokeWidth="2" />
                  <path d="M 15,50 C 25,30 75,30 85,50 C 75,70 25,70 15,50" strokeWidth="2" />
                  <circle cx="50" cy="15" r="4" fill="currentColor" />
                  <circle cx="85" cy="50" r="4" fill="currentColor" />
                  <circle cx="50" cy="85" r="4" fill="currentColor" />
                  <circle cx="15" cy="50" r="4" fill="currentColor" />
                  <circle cx="50" cy="50" r="7" fill="currentColor" className="text-seagrass animate-pulse" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-extrabold tracking-wider text-white uppercase">
              {appName}
            </h1>
          </div>

          {/* Tab Switcher for Login / Sign Up */}
          <div className="flex justify-center mb-2">
            <div className="relative flex bg-primary-950/60 p-1 rounded-full border-2 border-primary-700/30 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`relative px-6 py-1.5 rounded-full font-extrabold text-xs tracking-wide transition-all duration-300 z-10 cursor-pointer select-none ${
                  activeTab === "login"
                    ? "text-white bg-primary-500 shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`relative px-6 py-1.5 rounded-full font-extrabold text-xs tracking-wide transition-all duration-300 z-10 cursor-pointer select-none ${
                  activeTab === "signup"
                    ? "text-white bg-primary-500 shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {activeTab === "login" && <LoginForm />}
          {activeTab === "signup" && <RegisterForm onOtpRequired={(email) => { setRegistrationEmail(email); setActiveTab("otp"); }} />}
          {activeTab === "otp" && <RegisterOtpForm email={registrationEmail} />}
        </div>
      </div>
    </div>
  );
}
