import { useState } from 'react'

const TONES = [
  { id: 'warm', label: 'Warm & cozy' },
  { id: 'hype', label: 'Fun & hype' },
  { id: 'chill', label: 'Chill & low-key' },
]

const OUTPUT_OPTIONS = [
  { id: 'luma', label: 'Luma description' },
  { id: 'partiful', label: 'Partiful copy' },
  { id: 'instagram', label: 'Instagram caption' },
  { id: 'agenda', label: 'Agenda' },
]

const OUTPUT_LABELS = {
  luma: 'Luma Description',
  partiful: 'Partiful Copy',
  instagram: 'Instagram Caption',
  agenda: 'Agenda',
}

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

export default function App() {
  const [form, setForm] = useState({
    clubName: '',
    clubVibe: '',
    eventTheme: '',
    dateTime: '',
    location: '',
    groupSize: '',
    logistics: '',
    tone: 'Warm & cozy',
  })
  const [selectedOutputs, setSelectedOutputs] = useState(['luma', 'instagram'])
  const [outputs, setOutputs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const toggleOutput = (id) => {
    setSelectedOutputs(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    )
  }

  const generate = async () => {
    setLoading(true)
    setError(null)
    setOutputs(null)
    try {
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
          messages: [{ role: 'user', content: buildPrompt(form, selectedOutputs) }],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      const text = data.content[0].text
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

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#0F1C2E] font-sans">

      {/* Header */}
      <header className="bg-white border-b border-[#E8E2D9] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <span className="text-lg font-semibold tracking-tight">Gather</span>
          <span className="hidden sm:block text-sm text-[#7A8A9A] ml-1">— Plan less. Gather more.</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── Left: Form ── */}
        <div className="space-y-5">

          {/* Club Info */}
          <section className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#7A8A9A] mb-4">Your Club</h2>
            <div className="space-y-4">
              <Field label="Club name" required>
                <input
                  type="text"
                  value={form.clubName}
                  onChange={set('clubName')}
                  placeholder="e.g. Seoul Film Collective"
                  className={INPUT}
                />
              </Field>
              <Field label="Club type / vibe">
                <input
                  type="text"
                  value={form.clubVibe}
                  onChange={set('clubVibe')}
                  placeholder="e.g. Korean film club, morning run group"
                  className={INPUT}
                />
              </Field>
            </div>
          </section>

          {/* Event Details */}
          <section className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#7A8A9A] mb-4">Event Details</h2>
            <div className="space-y-4">
              <Field label="Event theme or focus" required>
                <input
                  type="text"
                  value={form.eventTheme}
                  onChange={set('eventTheme')}
                  placeholder="e.g. Bong Joon-ho retrospective night"
                  className={INPUT}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date & time" optional>
                  <input
                    type="text"
                    value={form.dateTime}
                    onChange={set('dateTime')}
                    placeholder="e.g. Sat July 12, 7pm"
                    className={INPUT}
                  />
                </Field>
                <Field label="Location" optional>
                  <input
                    type="text"
                    value={form.location}
                    onChange={set('location')}
                    placeholder="e.g. The Alamo Drafthouse"
                    className={INPUT}
                  />
                </Field>
              </div>
              <Field label="Group size">
                <input
                  type="text"
                  value={form.groupSize}
                  onChange={set('groupSize')}
                  placeholder="e.g. 20 people, small group of 8"
                  className={INPUT}
                />
              </Field>
              <Field label="Logistics" optional>
                <textarea
                  value={form.logistics}
                  onChange={set('logistics')}
                  placeholder="e.g. $10 suggested donation, bring a snack, RSVP by Friday"
                  rows={3}
                  className={INPUT + ' resize-none'}
                />
              </Field>
            </div>
          </section>

          {/* Tone */}
          <section className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#7A8A9A] mb-4">Tone</h2>
            <div className="flex gap-2">
              {TONES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setForm(prev => ({ ...prev, tone: t.label }))}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-medium border transition-all ${
                    form.tone === t.label
                      ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm'
                      : 'bg-[#FAF8F4] text-[#0F1C2E] border-[#E8E2D9] hover:border-[#2D6A4F]/50 hover:bg-[#F0F7F3]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* Outputs + Generate */}
          <section className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#7A8A9A] mb-4">Generate</h2>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {OUTPUT_OPTIONS.map(o => (
                <label
                  key={o.id}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                    selectedOutputs.includes(o.id)
                      ? 'bg-[#EFF7F3] border-[#2D6A4F]/40 text-[#1A4434]'
                      : 'border-[#E8E2D9] hover:border-[#2D6A4F]/30 hover:bg-[#FAF8F4]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedOutputs.includes(o.id)}
                    onChange={() => toggleOutput(o.id)}
                    className="accent-[#2D6A4F] w-4 h-4 shrink-0"
                  />
                  <span className="text-sm font-medium">{o.label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={!canGenerate}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                canGenerate
                  ? 'bg-[#2D6A4F] text-white hover:bg-[#235540] shadow-sm active:scale-[0.98]'
                  : 'bg-[#E8E2D9] text-[#A8A09A] cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Generating…
                </span>
              ) : 'Generate my event ✦'}
            </button>

            {!form.clubName.trim() && (
              <p className="mt-2 text-xs text-center text-[#A8A09A]">Fill in club name and event theme to generate</p>
            )}
          </section>
        </div>

        {/* ── Right: Outputs ── */}
        <div className="space-y-4 lg:sticky lg:top-24">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!outputs && !loading && !error && (
            <div className="bg-white rounded-2xl border border-dashed border-[#D8D2C9] p-14 text-center">
              <div className="text-4xl mb-3">🌿</div>
              <p className="font-medium text-[#0F1C2E] mb-1">Your content will appear here</p>
              <p className="text-sm text-[#7A8A9A]">Fill in your details and hit Generate</p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-14 text-center">
              <div className="text-4xl mb-3">
                <span className="inline-block animate-pulse">🌿</span>
              </div>
              <p className="font-medium text-[#0F1C2E] mb-1">Writing your event copy…</p>
              <p className="text-sm text-[#7A8A9A]">Takes just a few seconds</p>
            </div>
          )}

          {outputs && selectedOutputs.map(key => (
            outputs[key] ? (
              <div key={key} className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E2D9]">
                  <span className="text-sm font-semibold text-[#0F1C2E]">{OUTPUT_LABELS[key]}</span>
                  <button
                    onClick={() => copyText(key, outputs[key])}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      copied === key
                        ? 'bg-[#2D6A4F] text-white'
                        : 'bg-[#EFF7F3] text-[#2D6A4F] hover:bg-[#D8EFE4]'
                    }`}
                  >
                    {copied === key ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-[#1A2A3A] whitespace-pre-wrap leading-relaxed">{outputs[key]}</p>
                </div>
              </div>
            ) : null
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Shared components ──

const INPUT = 'w-full rounded-lg border border-[#E8E2D9] bg-[#FAF8F4] px-3.5 py-2.5 text-sm placeholder:text-[#B8B0A8] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25 focus:border-[#2D6A4F] transition'

function Field({ label, children, required, optional }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-[#2D6A4F] text-xs">*</span>}
        {optional && <span className="text-[#A8A09A] font-normal text-xs">(optional)</span>}
      </label>
      {children}
    </div>
  )
}
