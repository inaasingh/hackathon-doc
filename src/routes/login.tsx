import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useRef, useState, memo } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import logoSrc from "../assets/logo.png";
import { auth } from "../lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

/* ─── SVG social icons ───────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21">
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#1c1828" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

/* ─── Right panel — fully static, memoised ───────────────────── */
const RightPanel = memo(function RightPanel() {
  return (
    <div style={{ width:"45%", background:"#1a0f2e", position:"relative", overflow:"hidden" }}>
      {/* Static gradient orbs — zero animation, zero filter */}
      <div style={{ position:"absolute", top:"-80px", left:"-60px", width:"460px", height:"460px", borderRadius:"50%", background:"radial-gradient(circle,rgba(124,80,245,0.72) 0%,transparent 65%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"25%", right:"-80px", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(167,100,255,0.60) 0%,transparent 65%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-40px", left:"5%", width:"360px", height:"360px", borderRadius:"50%", background:"radial-gradient(circle,rgba(210,70,180,0.50) 0%,transparent 65%)", pointerEvents:"none" }}/>

      <div style={{ position:"relative", zIndex:1, height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 40px", gap:"32px" }}>
        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontSize:"36px", fontWeight:900, color:"#ffffff", lineHeight:1.15, letterSpacing:"-0.8px", margin:0 }}>
            Ship faster with<br/>
            <span style={{ background:"linear-gradient(135deg,#c084fc,#e879f9,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              AI-powered delivery
            </span>
          </h2>
          <p style={{ marginTop:"16px", fontSize:"15px", color:"rgba(255,255,255,0.60)", lineHeight:1.6, maxWidth:"340px" }}>
            Automate integrations, monitor health in real-time, and let your AI copilot handle the complexity.
          </p>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center" }}>
          {["Real-time monitoring","AI anomaly detection","Auto-remediation","128 docs/week"].map(p => (
            <div key={p} style={{ padding:"6px 14px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"999px", fontSize:"12px", color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{p}</div>
          ))}
        </div>

        <div style={{ width:"100%", maxWidth:"360px", background:"rgba(255,255,255,0.90)", border:"1px solid rgba(255,255,255,0.30)", borderRadius:"16px", padding:"20px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#52b788", boxShadow:"0 0 8px rgba(82,183,136,0.8)" }}/>
            <span style={{ fontSize:"13px", fontWeight:700, color:"#1c1828" }}>Platform Overview</span>
            <span style={{ marginLeft:"auto", fontSize:"11px", color:"#7a7595" }}>Live</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
            {[{value:"94.3%",label:"Health",color:"#52b788"},{value:"128",label:"Docs/week",color:"#7c6ef5"},{value:"78%",label:"Time saved",color:"#a78ef8"}].map(({value,label,color})=>(
              <div key={label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"20px", fontWeight:800, color, letterSpacing:"-0.5px" }}>{value}</div>
                <div style={{ fontSize:"11px", color:"#7a7595", marginTop:"3px", fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"16px", display:"flex", flexDirection:"column", gap:"8px" }}>
            {[{name:"Order API",pct:94,color:"#52b788"},{name:"CRM Sync",pct:79,color:"#f0a500"},{name:"MuleSoft",pct:99,color:"#52b788"}].map(({name,pct,color})=>(
              <div key={name}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"11px", color:"#7a7595", marginBottom:"3px" }}>
                  <span>{name}</span><span style={{ color, fontWeight:600 }}>{pct}%</span>
                </div>
                <div style={{ height:"4px", background:"rgba(124,110,245,0.12)", borderRadius:"999px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:"999px" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

/* ─── Input styles shared ────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width:"100%", padding:"12px 16px",
  border:"1.5px solid rgba(124,110,245,0.22)", borderRadius:"12px",
  fontSize:"14px", color:"#1c1828", background:"rgba(255,255,255,0.85)",
  outline:"none", fontFamily:"inherit", boxSizing:"border-box",
};

/* ─── Main page ──────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();

  /* Only these two state values ever change — on button clicks, not keystrokes */
  const [loading, setLoading] = useState(false);
  const [mode,    setMode]    = useState<"signin"|"signup">("signin");

  /* Uncontrolled — typing = zero React work */
  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef     = useRef<HTMLInputElement>(null);

  function doLogin() {
    setLoading(true);
    setTimeout(() => { auth.login(); navigate({ to:"/" }); }, 600);
  }

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", overflow:"hidden", fontFamily:'ui-sans-serif,-apple-system,"Inter",system-ui,sans-serif' }}>

      {/* ── LEFT PANEL ──────────────────────────────────────── */}
      <div style={{ width:"55%", background:"#f5f0eb", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>

        {/* Soft background tints — fully static */}
        <div style={{ position:"absolute", top:"-100px", right:"-60px", width:"320px", height:"320px", borderRadius:"50%", background:"radial-gradient(circle,rgba(124,110,245,0.07) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"-80px", left:"-40px", width:"280px", height:"280px", borderRadius:"50%", background:"radial-gradient(circle,rgba(167,142,248,0.06) 0%,transparent 70%)", pointerEvents:"none" }}/>

        {/* Nav */}
        <nav style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 36px", borderBottom:"1px solid rgba(124,110,245,0.10)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <img src={logoSrc} alt="AbsoluteLabs" style={{ height:"32px", width:"32px", objectFit:"contain" }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
            <span style={{ fontWeight:700, fontSize:"15px", color:"#1c1828", letterSpacing:"-0.3px" }}>AbsoluteLabs</span>
          </div>
          <div style={{ display:"flex", gap:"28px" }}>
            {["Home","About","Features","Contact"].map(l=>(
              <span key={l} style={{ fontSize:"13px", color:"#7a7595", cursor:"default", fontWeight:500 }}>{l}</span>
            ))}
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={()=>setMode("signin")} style={{ padding:"7px 16px", fontSize:"13px", fontWeight:500, color:"#3d3660", background:"transparent", border:"1px solid rgba(124,110,245,0.25)", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit" }}>Login</button>
            <button onClick={()=>setMode("signup")} style={{ padding:"7px 16px", fontSize:"13px", fontWeight:600, color:"#fff", background:"linear-gradient(135deg,#7c6ef5,#a78ef8)", border:"none", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit" }}>Sign up</button>
          </div>
        </nav>

        {/* Form area */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 36px", position:"relative", zIndex:1 }}>
          <div style={{ width:"100%", maxWidth:"420px" }}>

            {/* Badge */}
            <div style={{ marginBottom:"32px" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(124,110,245,0.10)", border:"1px solid rgba(124,110,245,0.20)", borderRadius:"999px", padding:"4px 12px", marginBottom:"16px" }}>
                <Sparkles size={13} color="#7c6ef5"/>
                <span style={{ fontSize:"12px", fontWeight:600, color:"#7c6ef5" }}>AI Delivery Copilot</span>
              </div>
              <h1 style={{ fontSize:"30px", fontWeight:800, color:"#1c1828", lineHeight:1.2, letterSpacing:"-0.5px", margin:0 }}>
                {mode==="signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p style={{ fontSize:"14px", color:"#7a7595", marginTop:"8px", marginBottom:0 }}>
                {mode==="signin" ? "Sign in to your AbsoluteLabs workspace" : "Start delivering smarter with AI"}
              </p>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", marginBottom:"28px", borderBottom:"2px solid rgba(124,110,245,0.12)" }}>
              {(["signin","signup"] as const).map(m=>(
                <button key={m} onClick={()=>setMode(m)} style={{ padding:"8px 20px", fontSize:"14px", fontWeight:mode===m?700:500, color:mode===m?"#7c6ef5":"#7a7595", background:"transparent", border:"none", borderBottom:mode===m?"2px solid #7c6ef5":"2px solid transparent", marginBottom:"-2px", cursor:"pointer", fontFamily:"inherit" }}>
                  {m==="signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* ── INPUTS — no <form> tag, no type="password", no autoComplete
                  Typing does zero React work. Browser won't detect as login form.
                  No password manager / credential manager injection. ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

              {mode==="signup" && (
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Full name"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  style={inputStyle}
                />
              )}

              <input
                ref={emailRef}
                type="text"
                placeholder="Email address"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={inputStyle}
              />

              {/* Password as type="text" so browser/extensions don't inject into it.
                  Dots handled by letter-spacing + font trick via data attribute toggle. */}
              <input
                ref={passwordRef}
                type="text"
                placeholder="Password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={{
                  ...inputStyle,
                  /* Makes characters look like bullets — no type="password" needed */
                  WebkitTextSecurity: "disc" as any,
                }}
              />

              {mode==="signin" && (
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:"12px", color:"#7c6ef5", cursor:"pointer", fontWeight:500 }}>Forgot password?</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                disabled={loading}
                onClick={doLogin}
                style={{ marginTop:"4px", width:"100%", padding:"13px 20px", background:loading?"rgba(124,110,245,0.6)":"linear-gradient(135deg,#7c6ef5,#a78ef8)", color:"#fff", border:"none", borderRadius:"12px", fontSize:"14px", fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 16px rgba(124,110,245,0.28)" }}
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin"/>{mode==="signin" ? "Signing in…" : "Creating account…"}</>
                  : <>{mode==="signin" ? "Sign In" : "Create Account"}<ArrowRight size={16}/></>
                }
              </button>
            </div>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"22px 0" }}>
              <div style={{ flex:1, height:"1px", background:"rgba(124,110,245,0.15)" }}/>
              <span style={{ fontSize:"12px", color:"#7a7595", fontWeight:500 }}>or continue with</span>
              <div style={{ flex:1, height:"1px", background:"rgba(124,110,245,0.15)" }}/>
            </div>

            {/* Social buttons */}
            <div style={{ display:"flex", gap:"10px" }}>
              {[{label:"Google",icon:<GoogleIcon/>},{label:"Microsoft",icon:<MicrosoftIcon/>},{label:"GitHub",icon:<GitHubIcon/>}].map(({label,icon})=>(
                <button
                  key={label}
                  type="button"
                  onClick={doLogin}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.background="#fff";el.style.borderColor="rgba(124,110,245,0.40)";}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.background="rgba(255,255,255,0.82)";el.style.borderColor="rgba(124,110,245,0.18)";}}
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", padding:"10px 12px", background:"rgba(255,255,255,0.82)", border:"1px solid rgba(124,110,245,0.18)", borderRadius:"10px", fontSize:"13px", fontWeight:600, color:"#1c1828", cursor:"pointer", fontFamily:"inherit" }}
                >
                  {icon}<span>{label}</span>
                </button>
              ))}
            </div>

            <p style={{ textAlign:"center", fontSize:"12px", color:"#7a7595", marginTop:"28px" }}>
              By continuing, you agree to our{" "}
              <span style={{ color:"#7c6ef5", cursor:"pointer" }}>Terms of Service</span>{" "}&amp;{" "}
              <span style={{ color:"#7c6ef5", cursor:"pointer" }}>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <RightPanel/>
    </div>
  );
}
