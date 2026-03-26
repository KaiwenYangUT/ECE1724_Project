import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-black px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
            Create your account
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
