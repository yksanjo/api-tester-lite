'use client'

import { useState, useCallback } from 'react'
import { Send, Copy, Clock, Database, ChevronDown, Plus, Trash2, Play, Key, Lock, Globe } from 'lucide-react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

interface Header { key: string; value: string; enabled: boolean }
interface Param { key: string; value: string; enabled: boolean }

const methodColors: Record<HttpMethod, string> = {
  GET: 'text-green-400 bg-green-400/10 border-green-400/30',
  POST: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  PUT: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  DELETE: 'text-red-400 bg-red-400/10 border-red-400/30',
  PATCH: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  HEAD: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  OPTIONS: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
}

export default function Home() {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Header[]>([{ key: 'Content-Type', value: 'application/json', enabled: true }])
  const [params, setParams] = useState<Param[]>([])
  const [body, setBody] = useState('')
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'apikey'>('none')
  const [authValue, setAuthValue] = useState('')
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const addHeader = () => setHeaders([...headers, { key: '', value: '', enabled: true }])
  const removeHeader = (i: number) => setHeaders(headers.filter((_, x) => x !== i))
  const updateHeader = (i: number, f: keyof Header, v: string | boolean) => {
    const n = [...headers]; n[i] = { ...n[i], [f]: v }; setHeaders(n)
  }
  const addParam = () => setParams([...params, { key: '', value: '', enabled: true }])
  const removeParam = (i: number) => setParams(params.filter((_, x) => x !== i))
  const updateParam = (i: number, f: keyof Param, v: string | boolean) => {
    const n = [...params]; n[i] = { ...n[i], [f]: v }; setParams(n)
  }

  const buildUrl = useCallback(() => {
    if (!url) return ''
    try {
      const u = new URL(url)
      params.filter(p => p.enabled && p.key).forEach(p => u.searchParams.append(p.key, p.value))
      return u.toString()
    } catch { return url }
  }, [url, params])

  const handleSend = async () => {
    if (!url) return
    setIsLoading(true)
    setResponse(null)
    try {
      const h: Record<string, string> = {}
      headers.filter(x => x.enabled && x.key).forEach(x => h[x.key] = x.value)
      if (authType === 'bearer' && authValue) h['Authorization'] = `Bearer ${authValue}`
      else if (authType === 'basic' && authValue) h['Authorization'] = `Basic ${btoa(authValue)}`
      else if (authType === 'apikey' && authValue) h['X-API-Key'] = authValue

      const start = Date.now()
      const res = await fetch(buildUrl(), {
        method,
        headers: h,
        body: ['POST', 'PUT', 'PATCH'].includes(method) ? body : undefined,
      })
      const data = await res.text()
      const time = Date.now() - start

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data,
        time,
        size: new Blob([data]).size,
      })
    } catch (e: any) {
      setResponse({ error: e.message, time: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (s: number) => {
    if (s >= 200 && s < 300) return 'text-green-400 bg-green-400/10'
    if (s >= 300 && s < 400) return 'text-blue-400 bg-blue-400/10'
    if (s >= 400 && s < 500) return 'text-yellow-400 bg-yellow-400/10'
    return 'text-red-400 bg-red-400/10'
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border bg-bg-secondary/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold font-mono">
            <span className="text-accent-primary">API</span> Tester Lite
          </h1>
          <a href="https://github.com" className="text-text-muted hover:text-accent-primary text-sm">GitHub</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* URL Bar */}
        <div className="flex gap-2 mb-4">
          <select value={method} onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className={`appearance-none px-4 py-3 pr-10 rounded-lg border font-mono text-sm font-medium cursor-pointer ${methodColors[method]} bg-bg-tertiary`}>
            {Object.keys(methodColors).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute mt-3 ml-[-28px] w-4 h-4 pointer-events-none text-text-muted" />
          
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter request URL..."
            className="flex-1 bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary font-mono" />
          
          <button onClick={handleSend} disabled={isLoading || !url}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg text-sm font-medium text-bg-primary hover:opacity-90 disabled:opacity-50">
            {isLoading ? <Play className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-4">
          {(['params', 'headers', 'body', 'auth'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === t ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-bg-secondary border border-border rounded-lg mb-4 p-4 max-h-48 overflow-auto">
          {activeTab === 'params' && (
            <div className="space-y-2">
              {params.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input type="checkbox" checked={p.enabled} onChange={(e) => updateParam(i, 'enabled', e.target.checked)} className="mt-2" />
                  <input value={p.key} onChange={(e) => updateParam(i, 'key', e.target.value)} placeholder="Key" className="flex-1 bg-bg-tertiary border border-border rounded px-3 py-2 text-sm" />
                  <input value={p.value} onChange={(e) => updateParam(i, 'value', e.target.value)} placeholder="Value" className="flex-1 bg-bg-tertiary border border-border rounded px-3 py-2 text-sm" />
                  <button onClick={() => removeParam(i)} className="p-2 text-text-muted hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={addParam} className="text-accent-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Parameter</button>
            </div>
          )}
          {activeTab === 'headers' && (
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input type="checkbox" checked={h.enabled} onChange={(e) => updateHeader(i, 'enabled', e.target.checked)} className="mt-2" />
                  <input value={h.key} onChange={(e) => updateHeader(i, 'key', e.target.value)} placeholder="Header" className="flex-1 bg-bg-tertiary border border-border rounded px-3 py-2 text-sm" />
                  <input value={h.value} onChange={(e) => updateHeader(i, 'value', e.target.value)} placeholder="Value" className="flex-1 bg-bg-tertiary border border-border rounded px-3 py-2 text-sm" />
                  <button onClick={() => removeHeader(i)} className="p-2 text-text-muted hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={addHeader} className="text-accent-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Header</button>
            </div>
          )}
          {activeTab === 'body' && (
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"key": "value"}'
              className="w-full h-32 bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-sm font-mono resize-none" />
          )}
          {activeTab === 'auth' && (
            <div className="flex gap-2 mb-4">
              {[
                { v: 'none', l: 'None', i: Globe },
                { v: 'bearer', l: 'Bearer', i: Key },
                { v: 'basic', l: 'Basic', i: Lock },
                { v: 'apikey', l: 'API Key', i: Key },
              ].map(a => (
                <button key={a.v} onClick={() => setAuthType(a.v as typeof authType)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${authType === a.v ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' : 'border-border text-text-secondary'}`}>
                  <a.i className="w-4 h-4" />{a.l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Response */}
        <div className="bg-bg-secondary border border-border rounded-lg min-h-[300px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-text-secondary">Response</span>
            {response && response.status && (
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(response.status)}`}>{response.status} {response.statusText}</span>
                <span className="flex items-center gap-1 text-xs text-text-muted"><Clock className="w-3 h-3" />{response.time}ms</span>
                <span className="flex items-center gap-1 text-xs text-text-muted"><Database className="w-3 h-3" />{response.size} B</span>
              </div>
            )}
          </div>
          <div className="p-4 overflow-auto max-h-[400px]">
            {isLoading && <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" /></div>}
            {!isLoading && !response && <div className="flex items-center justify-center h-32 text-text-muted">Enter URL and click Send</div>}
            {!isLoading && response?.error && <div className="text-red-400">{response.error}</div>}
            {!isLoading && response?.data && (
              <pre className="text-sm font-mono whitespace-pre-wrap">{(() => { try { return JSON.stringify(JSON.parse(response.data), null, 2) } catch { return response.data } })()}</pre>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
