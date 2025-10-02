import { useCallback, useMemo, useState } from "react";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Images } from "../../assets/images";
import { useNavigate } from "react-router-dom";
import { Login } from "../../api/authService";
import { toast } from "react-toastify";

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

const initialState: FormState = { email: "", password: "", remember: false };

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(
    () =>
      !loading &&
      isValidEmail(formData.email) &&
      formData.password.trim().length >= 1,
    [loading, formData.email, formData.password]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const extractErrorMessage = (err: unknown) => {
    // Works with Axios errors or generic errors
    const anyErr = err as any;
    return (
      anyErr?.response?.data?.message ||
      anyErr?.message ||
      "Login failed. Please try again."
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);

    const toastId = toast.loading("Signing you in…");

    try {
      const res = await Login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const token: string | undefined = res?.data?.token;
      const user = res?.data?.data?.user;

      if (!token || !user) {
        throw new Error("Malformed login response");
      }
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const storage = formData.remember ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      toast.update(toastId, {
        render: "Login successful! Redirecting…",
        type: "success",
        isLoading: false,
        autoClose: 1500,
        closeOnClick: true,
      });

      navigate("/", { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err);
      toast.update(toastId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            <img src={Images.Logo} alt="Logo" className="mx-auto h-10" />
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1e1e38]"
              >
                Email Address
              </label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  inputMode="email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={
                    formData.email.length > 0 && !isValidEmail(formData.email)
                      ? true
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1e1e38]"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <MdVisibilityOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <MdVisibility className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Extras */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-[#22c55e] focus:ring-[#22c55e] border-gray-300 rounded"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <button
                type="button"
                className="text-sm font-medium text-[#22c55e] hover:text-[#1ea550]"
                onClick={() =>
                  toast.info("Password reset coming soon.", { autoClose: 2000 })
                }
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#22c55e] hover:bg-[#1ea550] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
