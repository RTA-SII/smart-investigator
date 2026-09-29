import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, Eye, EyeOff, Lock, Moon, RefreshCw, Sun, User } from "lucide-react"
import { asset } from "@/lib/asset"
import { Button } from "@/components/ui/Button"
import { authenticate } from "@/app/auth"
import { applyTheme, signIn, toggleTheme, useSession } from "@/app/session"
import { cn } from "@/lib/cn"

/**
 * Sign-in: credentials, then a one-time passcode — the same two steps as the
 * bus-lane POC's portal, in this module's design language.
 *
 * The username is the account, so there is no role chooser after it: signing
 * in as `officer1` *is* signing in as the investigation officer. A picker
 * would also have been a way straight past the password.
 *
 * The password is checked for real (see `auth.js`, which is honest about what
 * that is worth on a static site). The passcode is not — it fills itself in,
 * because a demo that can lock its own presenter out of the room is worse
 * than no demo at all, and because there is nowhere to send an SMS from.
 */
const OTP_LENGTH = 6

/** Fixed rather than random: the presenter should never be guessing. */
const DEMO_OTP = "482913"
const OTP_MS = 200
const RESEND_SECONDS = 30

export function Login() {
  const session = useSession()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [reveal, setReveal] = useState(false)
  const [otp, setOtp] = useState(() => Array(OTP_LENGTH).fill(""))
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)
  // Held from step one so the passcode step knows who it is admitting.
  const roleId = useRef(null)
  const boxes = useRef([])

  useEffect(() => applyTheme(session.theme), [session.theme])

  // The passcode arrives a digit at a time, with the caret moving along the
  // boxes as it lands.
  useEffect(() => {
    if (step !== 2) return undefined
    const timers = DEMO_OTP.split("").map((digit, i) =>
      setTimeout(
        () => {
          setOtp((prev) => prev.map((d, n) => (n === i ? digit : d)))
          boxes.current[Math.min(i + 1, OTP_LENGTH - 1)]?.focus()
        },
        600 + i * OTP_MS,
      ),
    )
    return () => timers.forEach(clearTimeout)
  }, [step])

  useEffect(() => {
    if (step !== 2) return undefined
    setResendIn(RESEND_SECONDS)
    const id = setInterval(() => setResendIn((n) => (n > 0 ? n - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [step])

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError("Enter your username and password.")
      return
    }
    setError("")
    setBusy(true)

    const id = await authenticate(username, password)
    if (!id) {
      setBusy(false)
      // Which half was wrong is not said, and is not known here either.
      setError("Those credentials were not recognised.")
      setPassword("")
      return
    }

    roleId.current = id
    // A beat of latency, so the step change reads as a response, not a jump.
    setTimeout(() => {
      setBusy(false)
      setStep(2)
    }, 500)
  }

  const setDigit = (i, value) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    setOtp((prev) => prev.map((d, n) => (n === i ? digit : d)))
    if (digit && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus()
  }

  const onKeyDown = (i) => (e) => {
    // Backspace on an empty box steps back, which is what every passcode field
    // in the world does and what fingers expect.
    if (e.key === "Backspace" && !otp[i] && i > 0) boxes.current[i - 1]?.focus()
    if (e.key === "ArrowLeft" && i > 0) boxes.current[i - 1]?.focus()
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus()
  }

  const onPaste = (e) => {
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
    if (!digits) return
    e.preventDefault()
    setOtp(Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] || ""))
    boxes.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus()
  }

  const verify = (e) => {
    e.preventDefault()
    if (otp.join("").length < OTP_LENGTH) {
      setError("Enter all six digits.")
      return
    }
    setError("")
    setBusy(true)
    setTimeout(() => {
      signIn(roleId.current)
      navigate("/dashboard", { replace: true })
    }, 500)
  }

  const back = () => {
    setStep(1)
    setError("")
    setPassword("")
    setOtp(Array(OTP_LENGTH).fill(""))
    roleId.current = null
  }

  return (
    <div className="relative min-h-dvh">
      <div className="app-scene" aria-hidden />

      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-[var(--border)] px-8 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <img src={asset("rta-icon.svg")} alt="" className="h-8 w-auto shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-xl leading-tight font-bold">
              Roads and Transport Authority
            </p>
            <p className="truncate text-[11px] font-semibold tracking-[1px] text-[var(--muted-foreground)] uppercase">
              Smart Investigation Initiative
            </p>
            <p className="truncate text-[11px] text-[var(--muted-foreground)]">
              AI-powered investigation, analysis, and decision support
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="glass-surface grid size-10 place-items-center rounded-xl"
          >
            {session.theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <span className="hidden items-center gap-2 rounded-full border-[1px] border-[rgb(79_174_94/0.3)] bg-[rgb(79_174_94/0.12)] px-4 py-2.5 text-sm font-semibold tracking-[1px] text-[#15803d] uppercase sm:inline-flex">
            <span className="size-2 rounded-full bg-[#16a34a]" />
            System Online
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[520px] px-6 py-10">
        <Steps step={step} />

        <p className="mt-9 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-[11px] font-semibold tracking-[1px] text-[var(--primary)] uppercase">
            <Lock className="size-3.5" />
            Secure Access Portal
          </span>
        </p>

        <h1 className="mt-5 text-center text-4xl font-bold">
          {step === 1 ? "Sign In" : "Verify OTP"}
        </h1>
        <p className="mt-3 text-center text-base text-[var(--muted-foreground)]">
          {step === 1
            ? "Enter your username to continue"
            : "Passcode sent to the mobile ending ••82"}
        </p>

        <form
          onSubmit={step === 1 ? submit : verify}
          className="glass-surface mt-8 rounded-2xl p-7"
        >
          {step === 1 ? (
            <>
              <Field label="Username" icon={User}>
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  spellCheck="false"
                  aria-label="Username"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </Field>

              <Field
                label="Password"
                icon={Lock}
                className="mt-5"
                trailing={
                  <button
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    aria-label={reveal ? "Hide password" : "Show password"}
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-[var(--muted-foreground)] transition-colors duration-150 hover:bg-[rgb(23_28_143/0.06)] dark:hover:bg-white/10"
                  >
                    {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              >
                <input
                  type={reveal ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-label="Password"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </Field>
            </>
          ) : (
            <div
              onPaste={onPaste}
              className="flex justify-center gap-2 sm:gap-3"
              dir="ltr"
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el
                  }}
                  value={digit}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={onKeyDown(i)}
                  onFocus={(e) => e.target.select()}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  className={cn(
                    "size-12 rounded-xl border text-center font-mono text-lg font-bold outline-none",
                    "transition-colors duration-150 focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)]",
                    digit
                      ? "border-[var(--primary)] bg-[rgb(23_28_143/0.06)] text-[var(--primary)]"
                      : "border-[var(--input)] bg-[rgb(238_238_238/0.4)] dark:bg-[rgb(255_255_255/0.04)]",
                  )}
                />
              ))}
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-[rgb(228_26_20/0.1)] px-3 py-2.5 text-center text-[13px] font-semibold text-[var(--destructive)]"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={busy}
            className="mt-6 w-full text-base"
          >
            {busy
              ? "Authenticating…"
              : step === 1
                ? "Sign In"
                : "Verify & Continue"}
          </Button>

          {step === 1 ? (
            <p className="mt-5 text-center text-[13px] text-[var(--muted-foreground)]">
              Having trouble? Contact the IT help desk.
            </p>
          ) : (
            <div className="mt-5 flex items-center justify-between gap-3 text-[13px]">
              <button
                type="button"
                onClick={back}
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                Change username
              </button>
              {resendIn > 0 ? (
                <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                  <RefreshCw className="size-3.5" />
                  Resend in {resendIn}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setResendIn(RESEND_SECONDS)
                    setOtp(Array(OTP_LENGTH).fill(""))
                    setError("")
                  }}
                  className="flex items-center gap-1.5 font-semibold text-[var(--primary)] hover:underline"
                >
                  <RefreshCw className="size-3.5" />
                  Resend code
                </button>
              )}
            </div>
          )}
        </form>
      </main>
    </div>
  )
}

/** The two-step rail: numbered, with the finished step ticked. */
function Steps({ step }) {
  return (
    <ol className="flex items-center justify-center gap-3">
      {["Login", "Verify OTP"].map((label, i) => {
        const n = i + 1
        const on = step === n
        const done = step > n
        return (
          <li key={label} className="flex items-center gap-3">
            {i > 0 && (
              <span
                className={cn(
                  "h-px w-14",
                  done || on ? "bg-[var(--primary)]" : "bg-[var(--border)]",
                )}
              />
            )}
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full text-[13px] font-bold",
                  on || done
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[rgb(0_0_0/0.05)] text-[var(--muted-foreground)] dark:bg-white/10",
                )}
              >
                {done ? <Check className="size-4" /> : n}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  on || done
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]",
                )}
              >
                {label}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** A labelled field on the same chrome as the rest of the portal's inputs. */
function Field({ label, icon: Icon, trailing, className, children }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-[11px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
        {label}
      </span>
      <span className="flex h-12 items-center gap-2.5 rounded-xl border border-[var(--input)] bg-[rgb(238_238_238/0.4)] px-3.5 transition-colors duration-150 focus-within:border-[var(--ring)] focus-within:ring-1 focus-within:ring-[var(--ring)] dark:bg-[rgb(255_255_255/0.04)]">
        <Icon className="size-4 shrink-0 text-[var(--muted-foreground)]" />
        {children}
        {trailing}
      </span>
    </label>
  )
}
