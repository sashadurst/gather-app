import { useState } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────

const TONES = [
  { id: 'warm', label: 'Warm & cozy' },
  { id: 'hype', label: 'Fun & hype' },
  { id: 'chill', label: 'Chill & low-key' },
]

const OUTPUT_OPTIONS = [
  { id: 'luma', label: 'Luma' },
  { id: 'partiful', label: 'Partiful' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'agenda', label: 'Agenda' },
]

const OUTPUT_LABELS = {
  luma: 'Luma Style',
  partiful: 'Partiful Style',
  instagram: 'Instagram Caption',
  agenda: 'Event Agenda',
}

const OUTPUT_COLORS = {
  luma: '#7c6af7',
  partiful: '#e46cff',
  instagram: '#fb923c',
  agenda: '#a78bfa',
}

// ── Prompt builder (unchanged) ─────────────────────────────────────────────

function buildPrompt(form, outputs) {
  const descriptions = {
    luma: `luma: 3-4 paragraphs for a Luma event page. Write like a friend describing the event to another friend - warm, narrative, and inviting. Use flowing sentences that connect naturally, not short punchy ones stacked together. Vary your sentence structure so it doesn't feel repetitive. Make it feel like there's a real person and a real community behind this. Draw people in with genuine enthusiasm, not marketing language.`,
    partiful: `partiful: 3-5 sentences max. Short, casual, and a little playful - think lowercase energy even if not actually lowercase. This is a text-message-first platform, so write like you're excitedly texting a friend about something they can't miss. Punchy and warm, never corporate.`,
    instagram: `instagram: 2-3 sentences of conversational hook to open, then a line with the key logistics (date, location, how to join), then 4-6 relevant hashtags. Keep the whole thing fun and approachable.`,
    agenda: 'agenda: A clean timeline for the organizer. Each item on its own line in exactly this format: "7:00pm - Guests arrive". Use a regular hyphen-minus surrounded by spaces ( - ) NOT an em dash. Separate each item with a blank line so it is easy to scan.',
  }
  const requested = outputs.map(id => `- ${descriptions[id]}`).join('\n')
  return `You are an expert event copywriter for social clubs and community organizers.

CLUB DETAILS:
- Club name: ${form.clubName}
- Club type / vibe: ${form.clubVibe || 'Not specified'}
- Event theme or focus: ${form.eventTheme}
- Date & time: ${form.dateTime || 'TBD'}
- Location: ${form.location || 'TBD'}
- Group size: ${form.groupSize || 'Not specified'}
- Logistics / notes: ${form.logistics || 'None'}
- Tone: ${form.tone}

IMPORTANT STYLE RULE: Never use em dashes (—) anywhere in any output. Replace em dashes with a comma or a regular hyphen (-) depending on which reads more naturally.

Generate these outputs and return ONLY a valid JSON object — no markdown, no extra text:
${requested}

JSON keys must be exactly: ${outputs.join(', ')}
Each value is the complete ready-to-post text.`
}

// ── Design tokens ──────────────────────────────────────────────────────────

const C = {
  bg:         '#0e0c12',
  surface:    '#1a1726',
  surfaceDim: '#141219',
  elevated:   '#231f32',
  border:     '#2e2a40',
  borderMid:  '#494552',
  textPrimary:'#f0edf8',
  textMuted:  '#8b87a0',
  primary:    '#a78bfa',
  secondary:  '#e46cff',
  gradient:   'linear-gradient(135deg, #a78bfa 0%, #e46cff 100%)',
}

const FONT_JAKARTA = "'Plus Jakarta Sans', sans-serif"
const FONT_INTER   = "Inter, sans-serif"
const FONT_MONO    = "'JetBrains Mono', monospace"

// ── CSS injected once ──────────────────────────────────────────────────────

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }

  .shimmer-bar {
    background: linear-gradient(90deg, #1a1726 25%, #2b2930 50%, #1a1726 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 6px;
  }
  .card-fadeup {
    animation: fadeInUp 0.4s ease both;
  }

  input, textarea {
    font-family: ${FONT_INTER};
    font-size: 15px;
    color: ${C.textPrimary};
    background: ${C.elevated};
    border: 1.5px solid ${C.border};
    border-radius: 10px;
    padding: 12px 16px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    resize: none;
  }
  input::placeholder, textarea::placeholder {
    color: ${C.textMuted};
  }
  input:focus, textarea:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.18);
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
`

// ── Sub-components ─────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <p style={{
      fontFamily: FONT_INTER, fontSize: 11, fontWeight: 600,
      letterSpacing: '0.07em', textTransform: 'uppercase',
      color: C.textMuted, marginBottom: 8,
    }}>
      {children}
    </p>
  )
}

function SectionCard({ number, title, children }) {
  return (
    <div style={{
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: '28px 32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: C.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: FONT_JAKARTA, fontSize: 13, fontWeight: 700, color: '#fff' }}>{number}</span>
        </div>
        <h3 style={{ fontFamily: FONT_JAKARTA, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function ShimmerCard() {
  return (
    <div style={{
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div className="shimmer-bar" style={{ width: 10, height: 10, borderRadius: '50%' }} />
        <div className="shimmer-bar" style={{ width: 120, height: 14 }} />
      </div>
      <div className="shimmer-bar" style={{ height: 12, width: '100%' }} />
      <div className="shimmer-bar" style={{ height: 12, width: '92%' }} />
      <div className="shimmer-bar" style={{ height: 12, width: '78%' }} />
      <div className="shimmer-bar" style={{ height: 12, width: '85%' }} />
      <div className="shimmer-bar" style={{ height: 12, width: '60%' }} />
    </div>
  )
}

function OutputCard({ id, content, isCopied, onCopy }) {
  const color = OUTPUT_COLORS[id]
  return (
    <div
      className="card-fadeup"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `0 0 40px ${color}18`,
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_JAKARTA, fontSize: 14, fontWeight: 700, color: C.textPrimary }}>
            {OUTPUT_LABELS[id]}
          </span>
        </div>
        <button
          onClick={onCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 8,
            fontFamily: FONT_INTER, fontSize: 12, fontWeight: 600,
            border: `1px solid ${C.border}`,
            backgroundColor: isCopied ? color : 'transparent',
            color: isCopied ? '#fff' : C.textMuted,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {isCopied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <p style={{
          fontFamily: FONT_MONO, fontSize: 14, lineHeight: 1.75,
          color: C.textPrimary, whiteSpace: 'pre-wrap',
        }}>
          {content}
        </p>
      </div>
    </div>
  )
}

// ── Main app ───────────────────────────────────────────────────────────────

export default function App() {
  const [form, setForm] = useState({
    clubName: '', clubVibe: '', eventTheme: '',
    dateTime: '', location: '', groupSize: '',
    logistics: '', tone: 'Warm & cozy',
  })
  const [selectedOutputs, setSelectedOutputs] = useState(['luma', 'instagram'])
  const [outputs, setOutputs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)
  const [aiModel, setAiModel] = useState('claude')

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const toggleOutput = (id) => {
    setSelectedOutputs(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    )
  }

  // ── generate (unchanged logic) ───────────────────────────────────────────
  const generate = async () => {
    setLoading(true)
    setError(null)
    setOutputs(null)

    try {
      const prompt = buildPrompt(form, selectedOutputs)
      let text

      if (aiModel === 'claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
            messages: [{ role: 'user', content: prompt }],
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error?.message || `API error ${res.status}`)
        }
        const data = await res.json()
        text = data.content[0].text
      } else {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        )
        if (!geminiRes.ok) {
          const err = await geminiRes.json().catch(() => ({}))
          throw new Error(err?.error?.message || `API error ${geminiRes.status}`)
        }
        const data = await geminiRes.json()
        text = data.candidates[0].content.parts[0].text
      }

      const clean = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      setOutputs(JSON.parse(clean))
    } catch (err) {
      setError(err.message || 'Generation failed — check the console for details.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyText = async (key, text) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const canGenerate = form.clubName.trim() && form.eventTheme.trim() && selectedOutputs.length > 0 && !loading

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.textPrimary, fontFamily: FONT_INTER }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(14,12,18,0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 32px',
        height: 56,
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{ fontFamily: FONT_JAKARTA, fontSize: 18, fontWeight: 800, color: C.textPrimary }}>
          Gather
        </span>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 96px' }}>
        {/* Background photo */}
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.12,
          }}
        />
        {/* Radial violet glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(167,139,250,0.22) 0%, transparent 70%)',
        }} />
        {/* Content */}
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: FONT_INTER, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: C.primary, marginBottom: 20,
          }}>
            AI-powered event copy
          </p>
          <h1 style={{
            fontFamily: FONT_JAKARTA, fontWeight: 800,
            fontSize: 'clamp(36px, 7vw, 64px)',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            color: C.textPrimary, marginBottom: 20,
          }}>
            Event copy, in seconds.
          </h1>
          <p style={{
            fontFamily: FONT_INTER, fontSize: 18, fontWeight: 400,
            lineHeight: 1.6, color: C.textMuted,
            maxWidth: 520, margin: '0 auto 36px',
          }}>
            Stop staring at a blank cursor. Gather AI generates curated invites,
            descriptions, and agendas that match your event's unique vibe.
          </p>
          <button
            onClick={() => document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: C.gradient,
              border: 'none', borderRadius: 10,
              padding: '14px 32px',
              fontFamily: FONT_JAKARTA, fontSize: 15, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 24px rgba(167,139,250,0.35)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Generate my event copy
          </button>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 24px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            fontFamily: FONT_INTER, fontSize: 12, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: C.textMuted, textAlign: 'center', marginBottom: 48,
          }}>
            The perfect invite in 3 steps
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { icon: '✏️', title: 'Input Details', desc: 'Tell us what you\'re hosting, when, and where. Simple as that.' },
              { icon: '🎨', title: 'Select Vibe', desc: 'Choose from Warm & Cozy to Fun & Hype to set the perfect tone.' },
              { icon: '✨', title: 'Export Copy', desc: 'Instant templates for Luma, Partiful, Instagram, and more.' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: 22,
                }}>
                  {step.icon}
                </div>
                <h4 style={{ fontFamily: FONT_JAKARTA, fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>
                  {step.title}
                </h4>
                <p style={{ fontFamily: FONT_INTER, fontSize: 14, lineHeight: 1.6, color: C.textMuted }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <section id="form-section" style={{ padding: '72px 24px 96px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 1 — Your Club */}
          <SectionCard number="1" title="Your Club">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Label>Club Name <span style={{ color: '#e46cff' }}>*</span></Label>
                <input value={form.clubName} onChange={set('clubName')} placeholder="e.g. Midnight Run Club" />
              </div>
              <div>
                <Label>Club type / vibe</Label>
                <textarea value={form.clubVibe} onChange={set('clubVibe')} placeholder="e.g. Tropical House Night" rows={3} />
              </div>
            </div>
          </SectionCard>

          {/* 2 — Event Details */}
          <SectionCard number="2" title="Event Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Label>Event theme or focus <span style={{ color: '#e46cff' }}>*</span></Label>
                <input value={form.eventTheme} onChange={set('eventTheme')} placeholder="e.g. End-of-episode" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Date & Time</Label>
                  <input value={form.dateTime} onChange={set('dateTime')} placeholder="Saturday, 3:00 PM" />
                </div>
                <div>
                  <Label>Location</Label>
                  <input value={form.location} onChange={set('location')} placeholder="Enter address or venue name" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Group Size</Label>
                  <input value={form.groupSize} onChange={set('groupSize')} placeholder="20 people" />
                </div>
                <div>
                  <Label>Logistics</Label>
                  <textarea value={form.logistics} onChange={set('logistics')} placeholder="e.g. RSVP, cost, what to bring" rows={5} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 3 — Pick a Tone */}
          <SectionCard number="3" title="Pick a Tone">
            <div style={{ display: 'flex', gap: 10 }}>
              {TONES.map(t => {
                const active = form.tone === t.label
                return (
                  <button
                    key={t.id}
                    onClick={() => setForm(prev => ({ ...prev, tone: t.label }))}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 10,
                      fontFamily: FONT_JAKARTA, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: active ? C.gradient : 'transparent',
                      border: active ? 'none' : `1.5px solid ${C.border}`,
                      color: active ? '#fff' : C.textMuted,
                    }}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </SectionCard>

          {/* 4 — Platforms */}
          <SectionCard number="4" title="Platforms">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {OUTPUT_OPTIONS.map(o => {
                const active = selectedOutputs.includes(o.id)
                const color = OUTPUT_COLORS[o.id]
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleOutput(o.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 10,
                      fontFamily: FONT_JAKARTA, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      backgroundColor: active ? `${color}20` : 'transparent',
                      border: active ? `1.5px solid ${color}` : `1.5px solid ${C.border}`,
                      color: active ? color : C.textMuted,
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                    {o.label}
                  </button>
                )
              })}
            </div>
          </SectionCard>

          {/* 5 — AI Model + Generate */}
          <SectionCard number="5" title="AI Model">
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['claude', 'gemini'].map(m => {
                const active = aiModel === m
                return (
                  <button
                    key={m}
                    onClick={() => setAiModel(m)}
                    style={{
                      padding: '8px 24px', borderRadius: 10,
                      fontFamily: FONT_JAKARTA, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: active ? C.gradient : 'transparent',
                      border: active ? 'none' : `1.5px solid ${C.border}`,
                      color: active ? '#fff' : C.textMuted,
                    }}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                )
              })}
            </div>

            <button
              onClick={generate}
              disabled={!canGenerate}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 10,
                fontFamily: FONT_JAKARTA, fontSize: 15, fontWeight: 700,
                border: 'none', letterSpacing: '0.01em',
                cursor: canGenerate ? 'pointer' : 'not-allowed',
                transition: 'transform 0.15s, box-shadow 0.15s',
                background: canGenerate ? C.gradient : C.elevated,
                color: canGenerate ? '#fff' : C.textMuted,
                boxShadow: canGenerate ? '0 4px 24px rgba(167,139,250,0.3)' : 'none',
              }}
              onMouseEnter={e => canGenerate && (e.currentTarget.style.transform = 'scale(1.01)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.75s linear infinite' }} />
                    Generating...
                  </span>
                : 'Generate my event copy →'
              }
            </button>

            {!form.clubName.trim() && (
              <p style={{ marginTop: 10, textAlign: 'center', fontSize: 13, color: C.textMuted }}>
                Fill in club name and event theme to get started
              </p>
            )}
          </SectionCard>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {(loading || outputs || error) && (
        <section style={{ padding: '0 24px 96px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 64 }}>

            {/* Results header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <h2 style={{ fontFamily: FONT_JAKARTA, fontSize: 32, fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>
                  Generated Results
                </h2>
                <p style={{ fontFamily: FONT_INTER, fontSize: 14, color: C.textMuted, marginTop: 6 }}>
                  Review and copy the content for your preferred platform.
                </p>
              </div>
              {outputs && (
                <button
                  onClick={generate}
                  style={{
                    padding: '9px 20px', borderRadius: 10,
                    fontFamily: FONT_JAKARTA, fontSize: 13, fontWeight: 600,
                    border: `1px solid ${C.border}`,
                    backgroundColor: 'transparent', color: C.textMuted,
                    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface; e.currentTarget.style.color = C.textPrimary }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.textMuted }}
                >
                  ↻ Regenerate All
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 24, padding: 16, borderRadius: 12,
                backgroundColor: '#93000a22', border: '1px solid #93000a',
                color: '#ffdad6', fontSize: 14, fontFamily: FONT_INTER,
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Shimmer skeletons while loading */}
            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginTop: 32, alignItems: 'start' }}>
                {OUTPUT_OPTIONS.filter(o => selectedOutputs.includes(o.id)).map(o => <ShimmerCard key={o.id} />)}
              </div>
            )}

            {/* Output cards */}
            {outputs && !loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginTop: 32, alignItems: 'start' }}>
                {OUTPUT_OPTIONS.map(({ id: key }, i) =>
                  selectedOutputs.includes(key) && outputs[key] ? (
                    <div key={key} style={{ animationDelay: `${i * 0.08}s` }}>
                      <OutputCard
                        id={key}
                        content={outputs[key]}
                        isCopied={copied === key}
                        onCopy={() => copyText(key, outputs[key])}
                      />
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ fontFamily: FONT_INTER, fontSize: 13, color: C.textMuted }}>
          Gather — Plan less. Gather more.
        </p>
      </footer>
    </div>
  )
}
