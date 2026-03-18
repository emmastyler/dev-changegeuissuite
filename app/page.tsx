import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, Users, User, TrendingUp, BarChart3, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-medium text-indigo-700 mb-8">
            <Zap className="w-3.5 h-3.5" />
            Leadership Intelligence Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Discover Your{" "}
            <span className="text-indigo-600">Change Genius</span>
            <sup className="text-indigo-400 text-2xl sm:text-3xl align-super">™</sup>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Understand how leaders drive change and how teams execute it. Reveal your Change Genius™
            and build a Team Change Map™ to strengthen alignment, decision-making, and transformation.
          </p>
        </div>

        {/* Entry Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-4">
          <div className="group bg-white border-2 border-slate-200 hover:border-indigo-300 rounded-2xl p-8 transition-all duration-200 hover:shadow-lg">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">For Individuals</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Discover your Change Genius profile and understand how you naturally contribute during change.
            </p>
            <ul className="space-y-2.5 mb-8">
              {["Your Change Genius role","ADAPTS stage strengths","Leadership development guidance"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/assessment" className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
              Take Individual Assessment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="group bg-slate-900 border-2 border-slate-900 hover:border-indigo-600 rounded-2xl p-8 transition-all duration-200 hover:shadow-lg">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">For Teams</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Build a Team Change Map™ and discover how your team functions together during change.
            </p>
            <ul className="space-y-2.5 mb-8">
              {["Team role distribution","ADAPTS stage capacity","Friction patterns and collaboration risks","90-day change roadmap"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/teams/create" className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm">
              Build a Team Change Map™ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">One core loop. Lasting impact.</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">From individual insight to team transformation in a single, connected journey.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: User, title: "Take Assessment", desc: "60 questions. 8–10 minutes. Discover your Change Genius profile." },
              { step: "02", icon: BarChart3, title: "See Your Results", desc: "Get your Change Genius role and ADAPTS stage breakdown instantly." },
              { step: "03", icon: Users, title: "Invite Your Team", desc: "Share a link. As members join, your Team Change Map™ unlocks." },
              { step: "04", icon: TrendingUp, title: "Monitor Pulse", desc: "Weekly 3-question check-ins power your Monday Change Brief™." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
                <span className="absolute top-4 right-4 text-4xl font-black text-slate-100 select-none">{step}</span>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to reveal your Change Genius™?</h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">Join leaders who understand their role in driving change.</p>
          <Link href="/assessment" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
            Take the Assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            Change Genius™
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Change Genius™. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <Link key={item} href="#" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">{item}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
