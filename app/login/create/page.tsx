import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
            Ticketa
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
