"use client";
import React from "react";

export default function InfoPage() {
  return (
    <main className="p-6 animate-fade-in-up max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">About, FAQ & Policies</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">About TrendPulse</h2>
        <p className="text-muted-foreground mb-2">
          TrendPulse is a smart trend-driven e-commerce analytics platform. It helps you discover market trends, track competitor insights, and make data-driven decisions for your business.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Is my data secure?</strong> Yes, your data is encrypted and never shared with third parties.</li>
          <li><strong>How do I save products?</strong> Use the save button on any product card in the dashboard.</li>
          <li><strong>Can I delete my account?</strong> Yes, visit the Settings page to delete your account at any time.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Policies</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Privacy Policy:</strong> We respect your privacy and only collect data necessary for analytics and personalization.</li>
          <li><strong>Terms of Service:</strong> Use of this platform is subject to our terms and conditions. Misuse may result in account suspension.</li>
        </ul>
      </section>
    </main>
  );
}
