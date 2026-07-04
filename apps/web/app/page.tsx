import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="w-full relative">
      <nav className="flex justify-between items-center py-6 px-[5%] relative z-20 max-w-[1400px] mx-auto border-b border-slate-200/50">
        <Link href="/" className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          DocuLens Studio
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/auth/signin" className="text-slate-600 font-medium transition-colors hover:text-slate-900">
            Sign In
          </Link>
          <Link 
            href="/auth/signup" 
            className="bg-white border border-slate-200 text-slate-900 font-medium py-2.5 px-6 rounded-full transition-all shadow-[0_4px_14px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto">
        <section className="flex flex-col items-center justify-center text-center pt-32 pb-24 px-4 relative">
          
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-full text-sm font-medium mb-10 shadow-sm transition-transform hover:scale-105">
            <span className="flex h-2 w-2 rounded-full bg-orange-400"></span>
            DocuLens Studio Enterprise is live
          </div>
          
          <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] font-bold text-slate-900 leading-[1.05] tracking-tighter mb-8 max-w-[1000px]">
            Enterprise Document <br/>
            Processing, Automated.
          </h1>
          
          <p className="text-[clamp(1.125rem,3vw,1.35rem)] text-slate-500 max-w-[650px] mb-14 leading-relaxed font-light">
            Instantly classify, intelligently route, and accurately extract data from 
            thousands of documents with enterprise-grade accuracy.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/auth/signup" 
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-10 rounded-full transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1 text-lg"
            >
              Start for Free
            </Link>
            <a 
              href="#features" 
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium py-4 px-10 rounded-full transition-all text-lg shadow-sm"
            >
              See how it works
            </a>
          </div>
        </section>

        <section id="features" className="py-24 px-[5%] relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Classify Card */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-10 transition-all duration-500 hover:-translate-y-2 shadow-[0_20px_40px_rgba(249,115,22,0.04)] hover:shadow-[0_20px_60px_rgba(249,115,22,0.08)] group relative overflow-hidden">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100">
                <span className="text-2xl text-slate-700">🔍</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Classify</h3>
              <p className="text-slate-500 leading-relaxed font-light text-lg">
                Automatically detect document types—invoices, receipts, legal contracts, 
                or forms—with extreme precision.
              </p>
            </div>
            
            {/* Route Card */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-10 transition-all duration-500 hover:-translate-y-2 shadow-[0_20px_40px_rgba(249,115,22,0.04)] hover:shadow-[0_20px_60px_rgba(249,115,22,0.08)] group relative overflow-hidden">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100">
                <span className="text-2xl text-slate-700">🔀</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Route</h3>
              <p className="text-slate-500 leading-relaxed font-light text-lg">
                Intelligently direct documents to the correct department or workflow 
                pipeline based on content and custom rules.
              </p>
            </div>

            {/* Extract Card */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-10 transition-all duration-500 hover:-translate-y-2 shadow-[0_20px_40px_rgba(249,115,22,0.04)] hover:shadow-[0_20px_60px_rgba(249,115,22,0.08)] group relative overflow-hidden">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100">
                <span className="text-2xl text-slate-700">⚡</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Extract</h3>
              <p className="text-slate-500 leading-relaxed font-light text-lg">
                Instantly pull out key-value pairs, line items, and structured JSON 
                data from unstructured text seamlessly.
              </p>
            </div>

          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-12 px-[5%] text-center text-slate-400 text-sm mt-10 relative z-10">
        <p>&copy; {new Date().getFullYear()} DocuLens Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}
