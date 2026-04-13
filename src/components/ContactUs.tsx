import { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Mail,
  Send,
  MessageSquare,
  User,
  AtSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────
//  🔑  PASTE YOUR EMAILJS CREDENTIALS HERE
// ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_na0ydyi";   // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "template_6plupsi";  // e.g. "template_xyz789"
const EMAILJS_PUBLIC_KEY  = "zsOzKS9sJGazbsiyM";   // e.g. "xxxxxxxxxxxxxxxxxxx"
// ─────────────────────────────────────────────

type FormState = "idle" | "submitting" | "success" | "error";

interface ContactUsProps {
  darkMode?: boolean;
}

export default function ContactUs({ darkMode = true }: ContactUsProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address";
    if (!form.message.trim()) newErrors.message = "Message is required";
    else if (form.message.trim().length < 10)
      newErrors.message = "Message must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormState("submitting");

    try {
      // EmailJS sends the template variables below to your email inbox.
      // Make sure your EmailJS template uses: {{from_name}}, {{from_email}}, {{message}}
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          message:    form.message,
          reply_to:   form.email,
        },
        EMAILJS_PUBLIC_KEY
      );

      setFormState("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("EmailJS error:", err);
      setFormState("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors])
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (formState === "error") setFormState("idle");
  };

  const dark = darkMode;

  return (
    <main
      className={`min-h-screen py-16 px-4 ${
        dark ? "bg-[#05050f] text-gray-200" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 ${
              dark
                ? "bg-purple-600/20 border border-purple-500/30"
                : "bg-purple-100 border border-purple-200"
            }`}
          >
            <Mail className={`w-6 h-6 ${dark ? "text-purple-400" : "text-purple-600"}`} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Contact Us</h1>
          <p className={`text-lg leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>
            Want to submit an AI tool or have a question?{" "}
            <br className="hidden sm:block" />
            Drop us a message and we'll get back to you.
          </p>
        </div>

        {/* Success state */}
        {formState === "success" ? (
          <div
            className={`rounded-2xl p-10 text-center border ${
              dark
                ? "bg-green-500/10 border-green-500/30"
                : "bg-green-50 border-green-200"
            }`}
          >
            <CheckCircle
              className={`w-12 h-12 mx-auto mb-4 ${
                dark ? "text-green-400" : "text-green-500"
              }`}
            />
            <h2 className="text-2xl font-semibold mb-2">Message Sent!</h2>
            <p className={`mb-6 ${dark ? "text-gray-400" : "text-gray-500"}`}>
              Thanks for reaching out. We'll review your message and respond as
              soon as possible.
            </p>
            <button
              onClick={() => setFormState("idle")}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                dark
                  ? "bg-white/10 hover:bg-white/15 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className={`rounded-2xl p-8 space-y-6 border ${
              dark
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium mb-2 ${
                  dark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Your Name
              </label>
              <div className="relative">
                <User
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    dark ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 ${
                    dark
                      ? "bg-white/5 border text-gray-200 placeholder-gray-600"
                      : "bg-gray-50 border text-gray-900 placeholder-gray-400"
                  } ${
                    errors.name
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : dark
                      ? "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/30"
                      : "border-gray-300 focus:border-purple-400 focus:ring-purple-300/30"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${
                  dark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <AtSign
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    dark ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 ${
                    dark
                      ? "bg-white/5 border text-gray-200 placeholder-gray-600"
                      : "bg-gray-50 border text-gray-900 placeholder-gray-400"
                  } ${
                    errors.email
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : dark
                      ? "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/30"
                      : "border-gray-300 focus:border-purple-400 focus:ring-purple-300/30"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className={`block text-sm font-medium mb-2 ${
                  dark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Message
              </label>
              <div className="relative">
                <MessageSquare
                  className={`absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none ${
                    dark ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about the AI tool you'd like to submit, or ask us anything..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 resize-none ${
                    dark
                      ? "bg-white/5 border text-gray-200 placeholder-gray-600"
                      : "bg-gray-50 border text-gray-900 placeholder-gray-400"
                  } ${
                    errors.message
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : dark
                      ? "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/30"
                      : "border-gray-300 focus:border-purple-400 focus:ring-purple-300/30"
                  }`}
                />
              </div>
              {errors.message && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.message}
                </p>
              )}
            </div>

            {/* Error banner */}
            {formState === "error" && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Failed to send. Please check your connection and try again.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={formState === "submitting"}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium text-sm text-white"
            >
              {formState === "submitting" ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
