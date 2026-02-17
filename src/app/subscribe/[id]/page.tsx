"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

  const pricingData = [
    {
      id: "prc-01keyax41gqy3bfpmp3a38hn0e",
      name: "Starter",
      description: "Coba konsisten dengan fitur dasar.",
      monthly_price: 89000,
      yearly_price: 749000,
      token_monthly: 2000,
      duration: 250,
    },
    {
      id: "prc-01keyax41jka7ja2s2zfq3pzzf",
      name: "Creator",
      description: "Pilihan terbaik untuk kreator aktif harian.",
      monthly_price: 149000,
      yearly_price: 1199000,
      token_monthly: 6000,
      duration: 750,
      highlight: true, // best deal
    },
    {
      id: "prc-01keyax41jewghxe2ka84hqc7j",
      name: "Pro",
      description: "Untuk agency dan scaling bisnis.",
      monthly_price: 249000,
      yearly_price: 1999000,
      token_monthly: 15000,
      duration: 1875,
    },
  ];
  
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* ================= PRICING ================= */}
      <section className="pt-16 px-6" id="pricing">
        <div className="max-w-6xl mx-auto">

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingData.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-2xl border p-8 bg-white shadow-sm hover:shadow-lg transition
                  ${p.highlight ? "border-lime-500 ring-2 ring-lime-300" : "border-slate-200"}`}
              >
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-lime-600 px-4 py-1 text-sm font-bold text-white">
                    🔥 BEST DEAL
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {p.name}
                </h3>

                <p className="text-gray-600 mb-6">
                  {p.description}
                </p>

                <div className="mb-6">
                  <p className="text-4xl font-extrabold text-gray-900">
                    Rp{p.monthly_price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500">
                    / bulan · {p.token_monthly.toLocaleString("id-ID")} token
                  </p>
                </div>

                <ul className="mb-8 space-y-3 text-gray-700 text-sm">
                  <li>✔ Hingga {p.duration} menit video / bulan</li>
                  <li>✔ Subtitle otomatis</li>
                  <li>✔ AI highlight selection</li>
                  <li>✔ Export siap upload</li>
                </ul>

                <Link
                  href={`/payment/${p.id}`}
                  className={`block text-center rounded-xl py-3 font-semibold transition
                    ${p.highlight
                      ? "bg-lime-600 text-white hover:bg-lime-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                >
                  Pilih Paket {p.name}
                </Link>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  Atau <span className="font-semibold">Rp{p.yearly_price.toLocaleString("id-ID")}</span> / tahun
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    
    </main>
  );
}