import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("jm_token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("jm_user") || "null"));
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [query, setQuery] = useState("");
  const [file, setFile] = useState(null);
  const [resumeReady, setResumeReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("jobs");
  const [busy, setBusy] = useState(false);

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(API + path, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  }

  async function loadJobs(search = "") {
    try {
      setJobs(await api("/jobs?q=" + encodeURIComponent(search)));
    } catch (error) {
      setNotice(error.message);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function authenticate(event) {
    event.preventDefault();
    setBusy(true);

    try {
      const data = await api("/auth/" + mode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      localStorage.setItem("jm_token", data.token);
      localStorage.setItem("jm_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setNotice("Welcome, " + data.user.name);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function upload(event) {
    event.preventDefault();

    if (!file) {
      setNotice("Choose a PDF resume first.");
      return;
    }

    const body = new FormData();
    body.append("resume", file);
    setBusy(true);

    try {
      const data = await api("/resume/upload", {
        method: "POST",
        body
      });
      setResumeReady(true);
      setNotice(data.message);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function recommend() {
    setBusy(true);

    try {
      setMatches(await api("/recommendations"));
      setTab("matches");
      document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
      setNotice("Your recommendations are ready.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("jm_token");
    localStorage.removeItem("jm_user");
    setToken("");
    setUser(null);
    setResumeReady(false);
    setMatches([]);
    setTab("jobs");
  }

  const list = tab === "matches" ? matches : jobs;

  return (
    <div className="shell">
      <header>
        <a className="logo" href="#">JM <span>JobMatch AI</span></a>
        <nav>
          <button onClick={() => { setTab("jobs"); document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" }); }}>Explore Jobs</button>
          {token && <button onClick={recommend}>My Matches</button>}
        </nav>
        {token
          ? <div className="user">Hi, {user?.name} <button onClick={logout}>Logout</button></div>
          : <small>SMARTER CAREER DISCOVERY</small>}
      </header>

      <section className="hero">
        <div>
          <label>✦ AI-POWERED JOB DISCOVERY</label>
          <h1>Find the role<br /><em>that fits you.</em></h1>
          <p>Upload your resume and discover opportunities that align with your skills and experience.</p>
          <button className="primary" onClick={() => document.getElementById(token ? "resume" : "auth")?.scrollIntoView({ behavior: "smooth" })}>
            {token ? "Upload Resume" : "Get Started"} ↗
          </button>
        </div>
        <aside>
          <small>JOBMATCH INTELLIGENCE</small>
          <div className="orb">AI<span>POWERED</span></div>
          <p>Resume-aware matching · Ranked opportunities</p>
        </aside>
      </section>

      {notice && <div className="notice">{notice}<button onClick={() => setNotice("")}>×</button></div>}

      {!token ? (
        <section className="panel" id="auth">
          <div>
            <label>CANDIDATE ACCESS</label>
            <h2>{mode === "register" ? "Create your account" : "Welcome back"}</h2>
            <p>Register or log in to upload your resume and get job recommendations.</p>
          </div>
          <form onSubmit={authenticate}>
            {mode === "register" && <input placeholder="Full name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
            <input type="email" placeholder="Email address" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password (8+ characters)" minLength="8" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <button className="primary" disabled={busy}>{busy ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}</button>
            <p className="switch">{mode === "register" ? "Already registered?" : "New candidate?"}
              <button type="button" onClick={() => setMode(mode === "register" ? "login" : "register")}>
                {mode === "register" ? " Sign in" : " Create account"}
              </button>
            </p>
          </form>
        </section>
      ) : (
        <section className="panel" id="resume">
          <div>
            <label>YOUR PROFILE</label>
            <h2>Upload your resume</h2>
            <p>Choose a text-based PDF (maximum 5 MB). The backend extracts its text for matching.</p>
            {resumeReady && <strong className="success">✓ Resume uploaded</strong>}
          </div>
          <form onSubmit={upload}>
            <input type="file" accept=".pdf,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
            <button className="primary" disabled={busy}>Upload PDF</button>
            <button type="button" className="secondary" disabled={!resumeReady || busy} onClick={recommend}>Find My Matches</button>
          </form>
        </section>
      )}

      <section className="jobs" id="jobs">
        <div className="section-heading">
          <div>
            <label>OPPORTUNITIES</label>
            <h2>{tab === "matches" ? "Recommended for you" : "Explore open roles"}</h2>
            <p>{tab === "matches" ? "Ranked by resume and job-description similarity." : "Search sample job opportunities."}</p>
          </div>
          <input className="search" placeholder="Search jobs or skills..." value={query}
            onChange={e => { setQuery(e.target.value); setTab("jobs"); loadJobs(e.target.value); }} />
        </div>

        <div className="grid">
          {list.map(job => (
            <article key={job.id || job._id}>
              <div className="jobtop"><span>{job.company?.[0] || "J"}</span><small>{job.type}</small></div>
              <h3>{job.title}</h3>
              <p className="company">{job.company} · {job.location}</p>
              {tab === "matches" && <div className="score">Resume match <strong>{job.matchScore}%</strong></div>}
              <p className="description">{job.description}</p>
              <div className="skills">{(job.skills || []).map(skill => <span key={skill}>{skill}</span>)}</div>
              {tab === "matches" && <p className="gap"><b>Skills to build:</b> {job.missingSkills?.join(", ") || "No missing listed skills"}</p>}
            </article>
          ))}
          {!list.length && <div className="empty">No jobs found. Upload a resume or change your search.</div>}
        </div>

        <p className="disclaimer">Sample job listings. Match scores indicate text similarity, not hiring probability.</p>
      </section>

      <footer>JobMatch AI <span>Academic MVP · MERN + Machine Learning</span></footer>
    </div>
  );
}
