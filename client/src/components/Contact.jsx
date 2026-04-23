import { useState } from "react";
import { useForm, ValidationError } from '@formspree/react';

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert("Thank you for your message! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center mb-12">
        <p className="text-[10px] tracking-[0.4em] uppercase text-amber-400 font-bold mb-4">Contact</p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Get In<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Touch</span>
        </h2>
        <p className="text-zinc-500 text-base">Have questions? We'd love to hear from you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-black text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-amber-400 text-xl">📧</span>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Email</p>
                  <p className="text-white font-semibold">support@eventapp.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-amber-400 text-xl">📞</span>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Phone</p>
                  <p className="text-white font-semibold">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-amber-400 text-xl">📍</span>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Address</p>
                  <p className="text-white font-semibold">123 Event Street<br />City, State 12345</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center hover:border-amber-400/50 hover:bg-amber-400/10 transition-all cursor-pointer">
                <span className="text-zinc-400 hover:text-amber-400 text-xl">📘</span>
              </div>
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center hover:border-amber-400/50 hover:bg-amber-400/10 transition-all cursor-pointer">
                <span className="text-zinc-400 hover:text-amber-400 text-xl">🐦</span>
              </div>
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center hover:border-amber-400/50 hover:bg-amber-400/10 transition-all cursor-pointer">
                <span className="text-zinc-400 hover:text-amber-400 text-xl">📷</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-black text-white mb-6">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-semibold mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 transition-all"
                placeholder="What's this about?"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-semibold mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 transition-all resize-none"
                placeholder="Tell us more..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-400 text-zinc-950 rounded-xl py-3 font-black hover:bg-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}