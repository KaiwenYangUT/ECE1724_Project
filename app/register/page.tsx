import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
    return (
        //Register Page
        <main className = "min-h-screen bg-white text-black">
            <div className="mx-auto max-w-3xl px-6 py-10">
            <RegisterForm />
            </div>
        </main>
    );
}