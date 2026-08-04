import { Link } from "react-router-dom";

export default function Unauthorized() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <section className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
                <p className="text-7xl font-bold text-[#732269]">403</p>
                <h1 className="mt-3 text-2xl font-bold text-slate-800">Access Denied</h1>
                <p className="mt-2 text-slate-600">
                    You do not have permission to access this page.
                </p>
                <Link
                    to="/dashboard"
                    className="mt-6 inline-flex rounded-md bg-[#732269] px-4 py-2 font-medium text-white no-underline hover:bg-[#5f1c57]"
                >
                    Return to dashboard
                </Link>
            </section>
        </main>
    );
}
