import { Mail, Lock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const isFromSettings = location?.state?.fromSettings ?? false;
  

  // ⏱️ OTP TIMER
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // STEP 1
  const handleSendOTP = () => {
    if (!email || !email.includes("@")) {
      setStatus("invalidEmail");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimer(30);
    }, 1200);
  };

  // STEP 2
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerifyOTP = () => {
    setLoading(true);

    setTimeout(() => {
      if (otp.join("") === "123456") {
        setStatus("success");
        setTimeout(() => {
          setStep(3);
          setStatus(null);
        }, 600);
      } else {
        setStatus("error");
        setOtp(["", "", "", "", "", ""]);
      }
      setLoading(false);
    }, 1000);
  };

  // STEP 3
  const handleReset = () => {
    if (password.length < 6) return setStatus("short");
    if (password !== confirmPassword) return setStatus("mismatch");

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStatus("done");

      // 🚀 Redirect after success
      setTimeout(() => {
        window.location.href = "/"; // change route if needed
      }, 1500);
    }, 1200);
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4 relative">
      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => {
          if (isFromSettings) {
            navigate("/settings"); // go back to settings
          } else if (window.history.length > 1) {
            navigate(-1); // normal back
          } else {
            navigate("/"); // fallback
          }
        }}
        className="absolute top-6 left-6 text-sm text-gray-600 hover:text-black flex items-center gap-1"
      >
        ← Back
      </button>



      <AnimatePresence mode="wait">
        <motion.div
          key={step + status}
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white rounded-3xl p-8
          shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
        >
                {/* PAGE CONTENT */}
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
        {isFromSettings ? "Change Password" : "Forgot Password"}
      </h2>

          {/* SUCCESS SCREEN */}
          {status === "done" ? (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-gray-800">
                Password Updated!
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Redirecting...
              </p>
            </div>
          ) : (
            <>
              {/* ICON */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center 
                rounded-full bg-gray-100 shadow-inner">
                  <Lock className="text-gray-500" size={22} />
                </div>
              </div>

              {/* TITLE */}
              <h2 className="text-2xl font-semibold text-center text-gray-800">
                {step === 1 && "Reset Password"}
                {step === 2 && "Verify OTP"}
                {step === 3 && "Create New Password"}
              </h2>

              <p className="text-center text-gray-500 text-sm mt-1 mb-7">
                {step === 1 && "Enter your email to reset your password."}
                {step === 2 && "Enter the OTP sent to your email."}
                {step === 3 && "Enter and confirm your new password."}
              </p>

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div className="relative mb-3">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300
                      placeholder-gray-400
                      focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  {status === "invalidEmail" && (
                    <p className="text-red-500 text-sm mb-4">
                      Enter valid email
                    </p>
                  )}

                  <button
                    onClick={handleSendOTP}
                    className="w-full py-3 rounded-xl bg-gray-800 text-white flex justify-center items-center"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                  </button>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <div className="flex justify-between gap-3 mb-4">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        maxLength="1"
                        value={d}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        className={`w-12 h-12 text-center text-lg font-semibold rounded-xl 
                            bg-white border border-gray-300 text-gray-800
                            focus:outline-none focus:border-orange-500 
                            focus:ring-2 focus:ring-orange-100
                            transition-all duration-200`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    className="w-full py-3 rounded-xl bg-gray-800 text-white flex justify-center items-center"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
                  </button>

                  {/* TIMER */}
                  <div className="text-center mt-3 text-sm text-gray-500">
                    {timer > 0 ? (
                      <>Resend in {timer}s</>
                    ) : (
                      <span
                        className="text-orange-500 cursor-pointer"
                        onClick={() => setTimer(30)}
                      >
                        Resend OTP
                      </span>
                    )}
                  </div>

                  {status === "error" && (
                    <p className="text-red-500 text-sm text-center mt-2">
                      Invalid OTP
                    </p>
                  )}
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <input
                    type="password"
                    placeholder="New Password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-3 px-4 py-3 rounded-xl 
                        border border-gray-300 
                        bg-white text-gray-800 placeholder-gray-400
                        focus:outline-none focus:border-orange-500 
                        focus:ring-2 focus:ring-orange-100
                        transition-all duration-200"
                    
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl 
                        border border-gray-300 
                        bg-white text-gray-800 placeholder-gray-400
                        focus:outline-none focus:border-orange-500 
                        focus:ring-2 focus:ring-orange-100
                        transition-all duration-200"
                  />

                  <button
                    onClick={handleReset}
                    className="w-full mt-4 py-3 rounded-xl bg-gray-800 text-white flex justify-center"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
                  </button>

                 {/* ERRORS */}
    {status === "mismatch" && (
      <p className="text-red-500 text-sm mt-2">
        Passwords do not match
      </p>
    )}

    {status === "short" && (
      <p className="text-red-500 text-sm mt-2">
        Password must be at least 6 characters
      </p>
    )}

    {status === "done" && (
      <p className="text-green-500 text-sm mt-2">
        ✅ Password updated successfully
      </p>
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}