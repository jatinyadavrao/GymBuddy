import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const features = [
    {
      title: "AI Matchmaking",
      desc: "Our GEMINI-powered AI analyzes your goals and bio to find your perfect lifting partner.",
      icon: "🤖",
      color: "from-cyan-400 to-blue-500"
    },
    {
      title: "Swipe & Connect",
      desc: "Tinder-style intuitive swiping. Match instantly and schedule your next gym session.",
      icon: "⚡",
      color: "from-emerald-400 to-teal-500"
    },
    {
      title: "Real-Time Chat",
      desc: "Secure, instant messaging. Stay connected and hype each other up before leg day.",
      icon: "💬",
      color: "from-orange-400 to-rose-500"
    }
  ];

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-center">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-12 md:py-24 text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            The #1 Social Fitness App
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="max-w-4xl text-5xl font-black leading-tight tracking-tighter sm:text-7xl md:text-8xl"
        >
          Never Lift <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent italic drop-shadow-sm px-2">Alone</span> Again.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-8 max-w-2xl text-lg text-slate-400 sm:text-xl leading-relaxed font-medium"
        >
          Swipe, match, and conquer your goals with athletes who share your exact schedule, intensity, and local gym location.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6"
        >
          <Link to="/register" className="group relative overflow-hidden rounded-2xl bg-cyan-500 px-8 py-4 font-black tracking-widest text-slate-950 transition-all hover:scale-105 hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] active:scale-95">
            <span className="relative z-10 flex items-center gap-2">
              START SWIPING
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>
          <Link to="/login" className="rounded-2xl border-2 border-slate-700 bg-slate-900/50 backdrop-blur px-8 py-4 font-bold text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white hover:scale-105 active:scale-95 shadow-xl">
            MEMBER LOGIN
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 pb-24"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-8 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-slate-800/80 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div 
                style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} 
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feat.color} opacity-30 transition-opacity group-hover:opacity-100`} 
              />
              
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 border border-white/5 text-2xl shadow-inner group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="mb-3 text-2xl font-black text-white">{feat.title}</h3>
              <p className="font-medium leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </main>
  );
};

export default HomePage;
