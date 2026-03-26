"use client";
import React, { useState } from "react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("Settings updated (mock)");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleDelete = () => {
    // In real app, call API and logout
    setShowDelete(false);
    setSuccess("Account deleted. Logging out...");
    setTimeout(() => {
      // window.location.href = "/login";
    }, 1500);
  };

  return (
    <main className="p-6 animate-fade-in-up max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="name" className="block font-medium mb-1">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter your email"
          />
        </div>
        <button
          type="submit"
          className="bg-foreground text-background px-5 py-2 rounded font-medium hover:bg-foreground/90 transition"
        >
          Save Changes
        </button>
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </form>
      <div className="mt-10 border-t pt-6">
        <button
          className="text-destructive font-semibold hover:underline"
          onClick={() => setShowDelete(true)}
        >
          Delete Account
        </button>
      </div>
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative animate-fade-in-up">
            <h2 className="text-xl font-bold mb-2 text-destructive">Delete Account</h2>
            <p className="mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                className="bg-destructive text-background px-4 py-2 rounded font-medium hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
              <button
                className="bg-muted px-4 py-2 rounded font-medium hover:bg-muted/80"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
