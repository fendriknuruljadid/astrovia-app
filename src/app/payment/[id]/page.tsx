"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";

type Pricing = {
  id: string;
  name: string;
  duration: number;
  monthly_price: number;
  token_monthly: number;
  yearly_price: number;
  original_price: number;
};

type PaymentMethod = {
  paymentMethod: string;
  paymentName: string;
  paymentImage: string;
  totalFee: number;
};
/* ================= PAGE ================= */

function PaymentMethodSkeleton() {
  return (
    <div className="flex gap-4 border rounded-xl p-4">
      <Skeleton className="h-8 w-20" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-40" />
      <div className="space-y-2 mt-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function RightSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border p-6 space-y-6">
      <Skeleton className="h-14 w-full" />
      <div className="grid sm:grid-cols-3 gap-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}


export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [selectedPayment, setSelectedPayment] =
    useState<(typeof paymentMethods)[0] | null>(null);

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const isFormValid =
  form.firstName.trim() !== "" &&
  form.lastName.trim() !== "" &&
  form.phone.trim() !== "" &&
  form.email.trim() !== "" &&
  selectedPayment;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch(`/api/proxy/payment-method/${id}`);
        const data = await res.json();
  
        if (data.status) {
          setPaymentMethods(data.data.payment_methods);
          setPricing(data.data.pricing);
        }
        
      } catch (err) {
        console.error("Gagal ambil payment method", err);
      } finally {
        setLoadingPayment(false);
        setLoadingPage(false);
      }
    };
  
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (session?.user && !form.email) {
      setForm({
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        phone: session.user.phone || "",
        email: session.user.email || "",
      });
    }
  }, [session]);
  
  const price = Number(pricing?.monthly_price);
  const fee = Number(selectedPayment?.totalFee || 0);
  const discountValue = Number(discount);

  const total = price + fee - discountValue;

  /* ================= CREATE INVOICE ================= */
  const handleCreateInvoice = async () => {
    if (!selectedPayment) return;

    setLoading(true);

    try {
      const res = await fetch("/api/proxy/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          payment_method: selectedPayment.paymentMethod,
          phone: form.phone,
          pricing_id: pricing?.id,
          // promo_code: promoCode || null,
        }),
      });

      // console.log(res);
      const data = await res.json();
      // console.log(data);
      if (data.status) {
        router.push(data.data.payment_url);
        setLoading(false);
      }else{
        setLoading(false);
      }
    } catch (err) {
      alert("Gagal membuat invoice");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="pt-14 px-4 pb-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {loadingPage ? (
          <>
            <PricingSkeleton />
            <div className="lg:col-span-2">
              <RightSectionSkeleton />
            </div>
          </>
        ) : !pricing ? (
          <div className="col-span-full text-center">
            Paket tidak ditemukan
          </div>
        ) : (
          <>
          {/* LEFT */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">
              Paket {pricing.name} (1 Bulan)
            </h2>

            <p className="text-sm text-gray-500 line-through">
              Rp{pricing.original_price.toLocaleString("id-ID")}
            </p>
            <p className="text-4xl font-extrabold">
              Rp{pricing.monthly_price.toLocaleString("id-ID")}
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-2">
                <CheckCircle className="text-lime-500 w-5 h-5" />
                {pricing.duration} menit video
              </li>
              <li className="flex gap-2">
                <CheckCircle className="text-lime-500 w-5 h-5" />
                {pricing.token_monthly.toLocaleString("id-ID")} token AI
              </li>
            </ul>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm space-y-8">

            {/* PAYMENT METHOD */}
            <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
              <DialogTrigger asChild>
                <button className="cursor-pointer w-full border rounded-xl p-4 flex justify-between items-center">
                  {selectedPayment ? (
                    <div className="flex items-center gap-3">
                     <img
                        src={selectedPayment.paymentImage}
                        alt={selectedPayment.paymentName}
                        className="h-8 w-auto object-contain"
                        />
                      <span>{selectedPayment.paymentName}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Pilih metode pembayaran
                    </span>
                  )}
                  <span className="text-lime-600 font-medium">Pilih</span>
                </button>
              </DialogTrigger>

              <DialogContent className="max-h-[500px] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                {loadingPayment ? (
                    <>
                      <PaymentMethodSkeleton />
                      <PaymentMethodSkeleton />
                      <PaymentMethodSkeleton />
                    </>
                  ) : paymentMethods.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">
                      Metode pembayaran belum tersedia
                    </p>
                  ) : (
                    paymentMethods.map((m) => (
                      <button
                        key={m.paymentMethod}
                        onClick={() => {
                          setSelectedPayment(m);
                          setOpenPaymentDialog(false);
                        }}
                        className="cursor-pointer w-full flex gap-4 border rounded-xl p-4 hover:border-lime-500"
                      >
                        <img
                          src={m.paymentImage}
                          alt={m.paymentName}
                          className="h-8 w-auto object-contain"
                        />
                        <div className="text-left">
                          <p className="font-medium">{m.paymentName}</p>
                          
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* USER FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                  value={form.firstName}
                  placeholder="Nama Depan"
                  className="border rounded-xl px-4 py-3"
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
              />
               <input
                value={form.lastName}
                placeholder="Nama Belakang"
                className="border rounded-xl px-4 py-3"
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />

              
            </div>
            <div className="grid grid-cols-1 gap-4">
              <input
                value={form.phone}
                placeholder="No HP"
                className="border rounded-xl px-4 py-3"
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <input
                type="email"
                value={form.email}
                readOnly
                className="border rounded-xl px-4 py-3 bg-gray-100 cursor-not-allowed"
                placeholder="Email aktif"
              />

            </div>

            {/* SUMMARY */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Harga paket <span className="font-bold">(Paket {pricing.name} - 1 Bulan)</span></span>
                <span>Rp{pricing.monthly_price.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Diskon</span>
                <span>- Rp{discount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience fee</span>
                <span>Rp{fee.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Total</span>
                <span>Rp{total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <Button
              disabled={!isFormValid || loading}
              onClick={handleCreateInvoice}
              className="cursor-pointer w-full h-14 text-lg"
            >
              {loading ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </div>
          </>
        )}
        </div>

      </section>
    </main>
  );
}
