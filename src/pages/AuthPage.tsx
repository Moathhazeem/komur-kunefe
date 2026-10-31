import React, { useState } from 'react';
import { Eye, EyeOff, Flame, Lock, Mail, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ─── Shared Input Field Component ────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  required?: boolean;
}

function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  suffix,
  error,
  required,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5 text-right">
      <label htmlFor={id} className="block text-xs font-bold text-[#D5C7B9]">
        {label}
        {required && <span className="mr-1 text-[#ff7b00]" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {/* RTL: icon on the right side */}
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7d6f64]">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          dir="rtl"
          className={`
            w-full rounded-xl border bg-[#14110f] py-3 pr-10 pl-${suffix ? '11' : '4'}
            text-sm text-[#F7F0E5] placeholder-[#574c43] outline-none
            transition-all duration-200
            focus:ring-2 focus:ring-[#ff7b00]/40
            ${error
              ? 'border-red-500/60 focus:border-red-500'
              : 'border-[rgba(255,123,0,0.18)] focus:border-[#ff7b00]'
            }
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2">{suffix}</span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Password Input (with show/hide toggle) ───────────────────────────────────

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  required,
}: Omit<InputFieldProps, 'type' | 'icon' | 'suffix'>) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      id={id}
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      icon={<Lock className="h-4 w-4" />}
      suffix={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          className="text-[#7d6f64] transition-colors hover:text-[#ff7b00] cursor-pointer p-1"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      error={error}
      required={required}
    />
  );
}

// ─── Brand Header ────────────────────────────────────────────────────────────

function BrandHeader() {
  return (
    <div className="mb-7 text-center" dir="rtl">
      <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(255,123,0,0.3)] bg-[#26201b] shadow-xl shadow-[#ff7b00]/15">
        <Flame className="h-9 w-9 text-[#ff7b00] animate-pulse" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-black tracking-wide text-[#F7F0E5]">كُومُر كُونافيه</h1>
      <p className="mt-1.5 text-xs font-medium text-[#bcaaa0]">
        مرحباً بك في عالم الكنافة على الفحم الأصيلة
      </p>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

interface LoginFormProps {
  onSwitch: () => void;
  onSuccess: () => void;
}

function LoginForm({ onSwitch, onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.';
    if (!password) e.password = 'يرجى إدخال كلمة المرور.';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.ok) {
      setIsSuccess(true);
      // Automatic smooth redirection to home
      setTimeout(() => {
        onSuccess();
      }, 400);
    } else {
      setErrors({ form: result.error || 'تعذر تسجيل الدخول، يرجى المحاولة ثانية.' });
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@gmail.com');
    setPassword('123456');
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" dir="rtl">
      {errors.form && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
          {errors.form}
        </div>
      )}

      {isSuccess && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>تم تسجيل الدخول بنجاح! جاري التوجيه للرئيسية...</span>
        </div>
      )}

      <InputField
        id="login-email"
        label="البريد الإلكتروني أو رقم الهاتف"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="admin@gmail.com أو بريدك الخاص"
        autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email}
        required
      />

      <PasswordInput
        id="login-password"
        label="كلمة المرور"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password}
        required
      />

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleFillAdmin}
          className="text-[11px] font-bold text-[#ff7b00]/80 hover:text-[#ff7b00] underline underline-offset-4 cursor-pointer"
        >
          تجربة حساب المسؤول تلقائياً
        </button>
        <button
          type="button"
          className="text-xs text-[#9a8278] transition-colors hover:text-[#ff7b00] cursor-pointer"
          onClick={() => alert('يمكنك تسجيل الدخول مباشرة بأي بريد وكلمة مرور، أو تجربة حساب المسؤول: admin@gmail.com')}
        >
          نسيت كلمة المرور؟
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || isSuccess}
        className="
          mt-2 flex w-full items-center justify-center gap-2 rounded-xl
          bg-[#ff7b00] py-3.5 text-sm font-black text-white
          shadow-lg shadow-[#ff7b00]/25
          transition-all duration-200
          hover:bg-[#ea580c] hover:shadow-[#ea580c]/30
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7b00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#221d19]
          disabled:cursor-not-allowed disabled:opacity-60
          cursor-pointer
        "
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
            <span>جارٍ التحقق والتوجيه…</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>تم بنجاح! مرحباً بك</span>
          </>
        ) : (
          <span>تسجيل الدخول</span>
        )}
      </button>

      <div className="pt-1 text-center">
        <p className="text-xs text-[#a69286]">
          ليس لديك حساب؟{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="font-black text-[#ff7b00] transition-colors hover:text-[#ea580c] cursor-pointer mr-1"
          >
            انشئ حساباً جديداً
          </button>
        </p>
      </div>

      {/* Admin Demo helper card */}
      <div className="mt-4 rounded-xl border border-[rgba(255,123,0,0.15)] bg-[#17120F] p-3 text-right">
        <p className="text-[11px] font-bold text-[#ff7b00] mb-0.5">🔥 بيانات حساب المسؤول المعتمد:</p>
        <p className="text-[11px] text-[#D5C7B9]">البريد: <code className="text-[#ff7b00]">admin@gmail.com</code></p>
        <p className="text-[11px] text-[#D5C7B9]">كلمة المرور: <code className="text-[#ff7b00]">123456</code></p>
      </div>
    </form>
  );
}

// ─── Sign-up Form ─────────────────────────────────────────────────────────────

interface SignUpFormProps {
  onSwitch: () => void;
  onSuccess: () => void;
}

function SignUpForm({ onSwitch, onSuccess }: SignUpFormProps) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{
    name?: string; email?: string; password?: string; confirm?: string; form?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'يرجى إدخال الاسم الكامل.';
    if (!email.trim()) e.email = 'يرجى إدخال البريد الإلكتروني.';
    if (!password || password.length < 4) e.password = 'كلمة المرور يجب أن تكون 4 خانات على الأقل.';
    if (confirm !== password) e.confirm = 'كلمتا المرور غير متطابقتين.';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const result = await signup(name, email, password);
    setLoading(false);

    if (result.ok) {
      setIsSuccess(true);
      // Automatic smooth redirection to home
      setTimeout(() => {
        onSuccess();
      }, 400);
    } else {
      setErrors({ form: result.error || 'تعذر إنشاء الحساب، يرجى المحاولة ثانية.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3.5" dir="rtl">
      {errors.form && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
          {errors.form}
        </div>
      )}

      {isSuccess && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>تم إنشاء الحساب بنجاح! جاري الانتقال للرئيسية...</span>
        </div>
      )}

      <InputField
        id="signup-name"
        label="الاسم الكامل"
        value={name}
        onChange={setName}
        placeholder="أحمد النابلسي"
        autoComplete="name"
        icon={<User className="h-4 w-4" />}
        error={errors.name}
        required
      />

      <InputField
        id="signup-email"
        label="البريد الإلكتروني أو رقم الهاتف"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="ahmad@example.com"
        autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email}
        required
      />

      <PasswordInput
        id="signup-password"
        label="كلمة المرور"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password}
        required
      />

      <PasswordInput
        id="signup-confirm"
        label="تأكيد كلمة المرور"
        value={confirm}
        onChange={setConfirm}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirm}
        required
      />

      <button
        type="submit"
        disabled={loading || isSuccess}
        className="
          mt-2 flex w-full items-center justify-center gap-2 rounded-xl
          bg-[#ff7b00] py-3.5 text-sm font-black text-white
          shadow-lg shadow-[#ff7b00]/25
          transition-all duration-200
          hover:bg-[#ea580c] hover:shadow-[#ea580c]/30
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7b00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#221d19]
          disabled:cursor-not-allowed disabled:opacity-60
          cursor-pointer
        "
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
            <span>جارٍ إنشاء الحساب…</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>تم إنشاء حسابك بنجاح!</span>
          </>
        ) : (
          <span>إنشاء الحساب</span>
        )}
      </button>

      <div className="pt-1 text-center">
        <p className="text-xs text-[#a69286]">
          لديك حساب بالفعل؟{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="font-black text-[#ff7b00] transition-colors hover:text-[#ea580c] cursor-pointer mr-1"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </form>
  );
}

// ─── Main Export: AuthPage ────────────────────────────────────────────────────

interface AuthPageProps {
  onSuccess?: () => void;
  onClose?: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthPage({ onSuccess, onClose, initialMode = 'login' }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-[#14110f] px-4 py-8"
      dir="rtl"
    >
      {/* Background Ambience Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ff7b00]/10 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#ea580c]/8 blur-[80px]" />
      </div>

      {/* Return to home button if available */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="fixed top-5 left-5 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#221d19]/80 px-3.5 py-2 text-xs font-bold text-[#D5C7B9] backdrop-blur-md hover:border-[#ff7b00]/40 hover:text-white cursor-pointer"
        >
          <span>العودة للمتجر</span>
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
        </button>
      )}

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div
          className="rounded-2xl border border-[rgba(255,123,0,0.18)] bg-[#221d19] p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          role="main"
        >
          <BrandHeader />

          {/* Tab Switcher */}
          <div
            role="tablist"
            aria-label="نوع الحساب"
            className="mb-6 flex rounded-xl border border-[rgba(255,123,0,0.15)] bg-[#14110f] p-1"
          >
            <button
              role="tab"
              type="button"
              aria-selected={mode === 'login'}
              onClick={() => setMode('login')}
              className={`
                flex-1 rounded-lg py-2.5 text-xs font-black transition-all duration-200 cursor-pointer
                ${mode === 'login'
                  ? 'bg-[#ff7b00] text-white shadow-md shadow-[#ff7b00]/25'
                  : 'text-[#9a8278] hover:text-[#D5C7B9]'
                }
              `}
            >
              تسجيل الدخول
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={mode === 'signup'}
              onClick={() => setMode('signup')}
              className={`
                flex-1 rounded-lg py-2.5 text-xs font-black transition-all duration-200 cursor-pointer
                ${mode === 'signup'
                  ? 'bg-[#ff7b00] text-white shadow-md shadow-[#ff7b00]/25'
                  : 'text-[#9a8278] hover:text-[#D5C7B9]'
                }
              `}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* Form Content */}
          <div key={mode} className="animate-soft-slide-up" role="tabpanel">
            {mode === 'login' ? (
              <LoginForm
                onSwitch={() => setMode('signup')}
                onSuccess={handleSuccess}
              />
            ) : (
              <SignUpForm
                onSwitch={() => setMode('login')}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[11px] text-[#635348]">
          كُومُر كُونافيه · نكهة نابلسية أصيلة على الجمر © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
