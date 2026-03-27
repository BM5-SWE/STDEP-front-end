import React from "react";

export default function HistoryPage() {
  return (
    <main className="p-6 animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-4">Query & Margin History</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Past Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-background/80">
            <h3 className="font-medium text-amazon">Amazon</h3>
            <p className="text-muted-foreground text-sm">(No queries yet)</p>
          </div>
          <div className="border rounded-lg p-4 bg-background/80">
            <h3 className="font-medium text-aliexpress">AliExpress</h3>
            <p className="text-muted-foreground text-sm">(No queries yet)</p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Past Margin Estimate Queries</h2>
        <div className="border rounded-lg p-4 bg-background/80">
          <p className="text-muted-foreground text-sm">(No margin estimate queries yet)</p>
        </div>
      </section>
    </main>
  );
}
