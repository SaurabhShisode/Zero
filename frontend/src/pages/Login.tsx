import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import bgImage from "../assets/authbg3.png";

import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


const getRateLimitMessage = (err: any) => {
  if (err?.response?.status === 429) {
    const retryAfter = err.response.headers?.["retry-after"];
    if (retryAfter) {
      const minutes = Math.ceil(Number(retryAfter) / 60);
      return `Too many attempts. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
    }
    return "Too many attempts. Try again in a few minutes.";
  }

  return err?.response?.data?.message || "Something went wrong.";
};

const submit = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await api.post("/api/auth/login", { email, password });
    const user = res.data.user;

    setAuth(user, res.data.token);

    const hasSkill = user.preferences.some((p: any) => p.enabled);
    navigate(hasSkill ? "/" : "/onboarding");
  } catch (err: any) {
    setError(getRateLimitMessage(err));
  } finally {
    setLoading(false);
  }
};

const loginWithGoogle = async () => {
  try {
    setLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const res = await api.post("/api/auth/google", {
      token: idToken
    });

    const user = res.data.user;

    setAuth(user, res.data.token);

    const hasSkill = user.preferences.some((p: any) => p.enabled);
    navigate(hasSkill ? "/" : "/onboarding");
  } catch (err: any) {
    setError(getRateLimitMessage(err));
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="relative min-h-screen overflow-hidden text-white flex flex-col">


      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />


      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0f172a]/80 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />



      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="relative group w-full max-w-md">


          <div className="absolute -inset-1 rounded-3xl bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />


          <div className="relative rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="p-8 space-y-6">

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-geist font-semibold">
                  Login to Zero
                </h1>
                <p className="text-sm text-white/60 font-geist">
                  Continue your consistency-first practice loop
                </p>
              </div>

              <button
                onClick={loginWithGoogle}
                disabled={loading}
                className="
                w-full flex items-center justify-center gap-3
                px-4 py-3 rounded-lg
                bg-white/5 border border-white/20
                text-white font-medium
                transition-all duration-300
                hover:bg-white/10 hover:border-white/40
                active:scale-[0.98]
                disabled:opacity-50
                font-geist cursor-pointer
              "
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 text-white/30 text-xs font-geist">
                <div className="h-px bg-white/20 flex-1" />
                OR
                <div className="h-px bg-white/20 flex-1" />
              </div>

              <div className="space-y-4 font-geist">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    className="w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    type="button"
    onClick={() => setShowPassword((v) => !v)}
    className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition cursor-pointer"
  >
    {showPassword ? (
      <EyeOff className="h-5 w-5 text-black" />
    ) : (
      <Eye className="h-5 w-5 text-black" />
    )}
  </button>
</div>

              </div>

              {error && (
                <p className="text-sm text-red-400 text-center font-geist">
                  {error}
                </p>
              )}

              <button
                onClick={submit}
                disabled={loading}
                className="
                w-full py-3 rounded-lg
                bg-white text-black font-medium
                shadow-[0_10px_30px_rgba(0,0,0,0.3)]
                transition-all duration-300
                hover:bg-white/90 hover:scale-[1.02]
                active:scale-[0.98]
                disabled:opacity-50
                font-geist cursor-pointer
              "
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <p className="text-sm text-white/50 text-center font-geist">
                No account yet?{" "}
                <Link
                  to="/signup"
                  className="text-white hover:underline transition"
                >
                  Create one
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );


}
