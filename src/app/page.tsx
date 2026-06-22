"use client"

import React, { useState, useEffect, useRef } from 'react'
import { 
  Bot, Database, FileText, LayoutDashboard, Settings, Shield, GitBranch, 
  Send, Sparkles, Upload, Plus, Play, 
  Download, Moon, Sun, ArrowRight, BookOpen, 
  ChevronRight, RefreshCw, Layers, Server, Activity, Users, FileSpreadsheet,
  Zap, BarChart3, Search, Hash, Terminal, Clock, Check
} from 'lucide-react'
import { useAppStore, MessageItem, DocumentItem, WorkflowItem } from '../store/store'

export default function WorkspacePage() {
  const {
    theme, toggleTheme,
    currentUser,
    activeTab, setActiveTab,
    workspaces, activeWorkspaceId, setActiveWorkspaceId,
    conversations, setConversations, activeConversationId, setActiveConversationId,
    messages, setMessages, addMessage, isStreaming, setIsStreaming,
    documents, addDocument,
    workflows, setWorkflows,
    reports, setReports
  } = useAppStore()

  const [mounted, setMounted] = useState(false)
  const [inputMsg, setInputMsg] = useState('')
  const [sqlPrompt, setSqlPrompt] = useState('Show top performing customers by token usage')
  const [sqlResult, setSqlResult] = useState<any>({
    sql: "SELECT u.full_name, u.email, SUM(a.details->>'token_count') as total_tokens FROM users u JOIN analytics a ON u.id = a.user_id GROUP BY u.id, u.full_name, u.email ORDER BY total_tokens DESC LIMIT 5;",
    headers: ["Customer Name", "Email", "Token Consumption"],
    rows: [
      ["Sarah Jenkins", "sarah.j@enterprise.com", "1,245,600"],
      ["David Vance", "david@vance-corp.com", "980,500"],
      ["Michael Chang", "m.chang@innovate.io", "740,200"],
      ["Elena Rostova", "elena@cybersecurity.net", "630,000"],
      ["Marcus Brody", "marcus@archaeology.org", "512,400"]
    ]
  })
  const [sqlLoading, setSqlLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentPrompt, setNewAgentPrompt] = useState('')
  const [runningWorkflowId, setRunningWorkflowId] = useState<number | null>(null)
  const [workflowStepIndex, setWorkflowStepIndex] = useState(-1)
  const [workflowLogs, setWorkflowLogs] = useState<string[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const root = document.documentElement
    root.classList.add('dark')
    root.style.backgroundColor = '#080808'
    document.body.style.backgroundColor = '#080808'
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!mounted) return null

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || isStreaming) return
    const userMessageContent = inputMsg
    setInputMsg('')
    const userMsg: MessageItem = {
      id: Date.now(), sender: 'user', content: userMessageContent,
      citations: [], created_at: new Date().toISOString()
    }
    addMessage(userMsg)
    setIsStreaming(true)
    const botMsgId = Date.now() + 1
    let routeChoice = "general_assistant"
    const q = userMessageContent.toLowerCase()
    if (q.includes("sales") || q.includes("revenue") || q.includes("chart")) routeChoice = "Data Analyst Agent"
    else if (q.includes("search") || q.includes("web")) routeChoice = "Research Agent"
    else if (q.includes("report") || q.includes("write")) routeChoice = "Writer Agent"
    else if (q.includes("code") || q.includes("python")) routeChoice = "CodingAgent"
    const logs = ["router → active", `router → selected [${routeChoice}]`]
    if (routeChoice !== "general_assistant") {
      logs.push(`${routeChoice} → fetching context`)
      logs.push(`${routeChoice} → running pipeline`)
    }
    addMessage({ id: botMsgId, sender: 'assistant', content: '', citations: [], logs, created_at: new Date().toISOString() })
    let responseText = ""
    let citations: any[] = []
    let charts: any[] = []
    if (routeChoice === "Data Analyst Agent") {
      responseText = "### Financial Analytics\n\nSQL executed on workspace DB. Monthly net sales:\n\n| Month | Sales | Subscriptions | Growth |\n|:---|:---|:---|:---|\n| Jan | $280k | 12,400 | +5.2% |\n| Feb | $310k | 14,200 | +10.7% |\n| Mar | $345k | 16,800 | +11.2% |\n| Apr | $390k | 19,500 | +13.0% |\n| May | $430k | 22,100 | +10.2% |\n| Jun | $480k | 25,400 | +11.6% |\n\nProjected Q3 growth: **+14.5%**"
      charts = [{ type: "bar", data: [{ month: "Jan", sales: 280000 }, { month: "Feb", sales: 310000 }, { month: "Mar", sales: 345000 }, { month: "Apr", sales: 390000 }, { month: "May", sales: 430000 }, { month: "Jun", sales: 480000 }] }]
    } else if (routeChoice === "Research Agent") {
      responseText = "### Web Synthesis\n\nScanned active index and found:\n\n1. **[Stanford AI Index 2026](https://aiindex.stanford.edu)** — agent infrastructure metrics\n2. **[LangGraph Workflows](https://langchain.com)** — cyclic graph design\n\nMulti-agent architectures are shifting toward reactive graph nodes. Implementing locally saves ~45% computational cost."
      citations = [{ title: "Stanford AI Index 2026", snippet: "Foundation models trending toward specialized sub-agent routing.", url: "https://aiindex.stanford.edu" }]
    } else if (routeChoice === "Writer Agent") {
      responseText = "### Draft Generated\n\n# OPERATIONAL ASSESSMENT REPORT\n\n**Author:** Nexus AI Writer Agent  \n**Date:** June 2026\n\n## Objectives\nSystem metrics review and agent performance analysis.\n\n## Infrastructure\nFastAPI routing, Celery background queues, Redis caching."
    } else if (routeChoice === "CodingAgent") {
      responseText = "### SSE Streaming — FastAPI\n\n```python\nfrom fastapi import FastAPI\nfrom fastapi.responses import StreamingResponse\nimport asyncio\n\napp = FastAPI()\n\nasync def event_stream():\n    for i in range(5):\n        await asyncio.sleep(0.4)\n        yield f'data: {\"chunk\": i}\\n\\n'\n\n@app.get('/stream')\nasync def stream():\n    return StreamingResponse(event_stream(), media_type='text/event-stream')\n```"
    } else {
      responseText = "I'm your Nexus AI workspace assistant. I support multi-model switching (Gemini and Groq), document RAG querying, DuckDB analytics, and visual automation workflows. What can I help you with?"
    }
    let currentText = ""
    const words = responseText.split(" ")
    for (let i = 0; i < words.length; i++) {
      currentText += words[i] + " "
      setMessages((prev: MessageItem[]) => prev.map((m: MessageItem) => m.id === botMsgId ? { ...m, content: currentText, citations, charts } : m))
      await new Promise(r => setTimeout(r, 25))
    }
    setIsStreaming(false)
  }

  const handleExecuteSQL = (e: React.FormEvent) => {
    e.preventDefault()
    setSqlLoading(true)
    setTimeout(() => {
      const p = sqlPrompt.toLowerCase()
      if (p.includes("customer") || p.includes("user")) {
        setSqlResult({ sql: "SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;", headers: ["User ID", "Email", "Full Name", "Role", "Joined"], rows: [["1","admin@nexusai.com","Sarah Jenkins","admin","2026-06-21"],["2","editor@nexusai.com","Lead Editor","editor","2026-06-21"],["3","david@vance-corp.com","David Vance","viewer","2026-06-20"]] })
      } else if (p.includes("document") || p.includes("file")) {
        setSqlResult({ sql: "SELECT id, file_name, file_type, status FROM documents ORDER BY id DESC;", headers: ["Doc ID", "Filename", "Type", "Status"], rows: [["1","Enterprise_Intelligence_Pitch.pdf","pdf","completed"],["2","Financial_Growth_Q1_Q2.xlsx","xlsx","completed"],["3","Operational_Directives.docx","docx","completed"]] })
      } else {
        setSqlResult({ sql: "SELECT action, COUNT(*) as count FROM analytics GROUP BY action ORDER BY count DESC;", headers: ["Action", "Count"], rows: [["chat_stream","142"],["file_upload","38"],["sql_generate","18"],["workflow_run","12"]] })
      }
      setSqlLoading(false)
    }, 800)
  }

  const handleUploadMockFile = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    setTimeout(() => {
      addDocument({ id: Date.now(), file_name: file.name, file_type: file.name.split('.').pop() || 'txt', status: 'completed', size: file.size, created_at: new Date().toISOString() })
      setIsUploading(false)
    }, 1500)
  }

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAgentName) return
    alert(`Agent [${newAgentName}] registered!`)
    setNewAgentName('')
    setNewAgentPrompt('')
  }

  const handleRunWorkflow = (wf: WorkflowItem) => {
    setRunningWorkflowId(wf.id)
    setWorkflowStepIndex(0)
    setWorkflowLogs(["Initializing pipeline orchestrator..."])
    const stepsCount = wf.definition.nodes.length
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      if (currentStep < stepsCount) {
        setWorkflowStepIndex(currentStep)
        setWorkflowLogs(prev => [...prev, `[${wf.definition.nodes[currentStep].data.label}] executed successfully`])
      } else {
        clearInterval(interval)
        setWorkflowStepIndex(-1)
        setRunningWorkflowId(null)
        setWorkflowLogs(prev => [...prev, "Pipeline completed — report generated."])
      }
    }, 1200)
  }

  const renderTabContent = () => {
    switch (activeTab) {

      // ── LANDING ──────────────────────────────────────────────
      case 'landing':
        return (
          <div className="flex flex-col items-center justify-center min-h-[88vh] px-6 animate-fadeIn">
            {/* Ambient blobs */}
            <div className="ambient-blob w-[500px] h-[500px] top-[-100px] left-[-200px]"
              style={{ background: 'radial-gradient(circle, rgba(109,74,255,0.14) 0%, transparent 70%)' }} />
            <div className="ambient-blob w-[400px] h-[400px] bottom-[-80px] right-[-100px]"
              style={{ background: 'radial-gradient(circle, rgba(0,198,162,0.10) 0%, transparent 70%)' }} />

            <div className="relative z-10 max-w-3xl w-full text-center">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 mb-8 py-1.5 px-4 text-xs rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'var(--fg-secondary)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--fg-primary)' }} />
                Enterprise Intelligence Platform — v1.0 Pro
              </div>

              <h1 className="display-xl mb-5">
                Collaborative AI<br />
                <span style={{ color: 'var(--fg-secondary)' }}>for Modern Teams</span>
              </h1>

              <p className="page-subtitle text-[15px] max-w-xl mx-auto mb-10">
                Switch between Gemini and Groq. Analyze data with DuckDB, manage knowledge bases with RAG, and build visual agent workflows.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
                <button onClick={() => setActiveTab('dashboard')} className="btn-primary text-[14px] px-7 py-3">
                  Open Workspace <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveTab('settings')} className="btn-ghost text-[14px] px-7 py-3">
                  View Demo Accounts
                </button>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left stagger-children">
                {[
                  { icon: Bot, color: 'var(--accent)', label: 'Multi-Model Hub', desc: 'Route tasks to Gemini or Groq with one click.' },
                  { icon: Database, color: 'var(--accent-2)', label: 'Data Analytics', desc: 'Natural language → SQL via DuckDB. Export to PDF or DOCX.' },
                  { icon: GitBranch, color: 'var(--accent-3)', label: 'Visual Workflows', desc: 'Chain OCR, translation, ingestion, and email nodes graphically.' },
                ].map(({ icon: Icon, color, label, desc }) => (
                  <div key={label} className="card p-5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--fg-primary)' }}>{label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      // ── DASHBOARD ─────────────────────────────────────────────
      case 'dashboard':
        return (
          <div className="space-y-7 animate-fadeIn">
            <div>
              <div className="accent-bar" />
              <h2 className="page-title">Dashboard</h2>
              <p className="page-subtitle">Model consumption, storage metrics, and worker queues.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
              {[
                { label: 'Token Consumption', value: '2.35M', delta: '+14.2%', deltaOk: true, icon: Zap },
                { label: 'Active Conversations', value: conversations.length.toString(), delta: '3 models', deltaOk: true, icon: Bot },
                { label: 'Documents Indexed', value: documents.length.toString(), delta: '100% RAG', deltaOk: true, icon: FileText },
                { label: 'Storage Used', value: '29.4 MB', delta: '/ 5 GB', deltaOk: true, icon: Database },
              ].map(({ label, value, delta, deltaOk, icon: Icon }) => (
                <div key={label} className="card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <p className="section-label">{label}</p>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-surface)', color: 'var(--fg-muted)' }}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="stat-number">{value}</p>
                  <p className="text-[11px] mt-1.5" style={{ color: deltaOk ? 'var(--accent-2)' : 'var(--accent-3)' }}>{delta}</p>
                </div>
              ))}
            </div>

            {/* Chart + Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="card p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="section-label mb-1">Token Utilization</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Q1 – Q2 2026</p>
                  </div>
                  <span className="badge badge-accent text-[11px]">Live</span>
                </div>
                <div className="w-full h-52">
                  <svg className="w-full h-full" viewBox="0 0 560 200" fill="none">
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12"/>
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {[20, 60, 100, 140].map(y => (
                      <line key={y} x1="40" y1={y} x2="540" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                    ))}
                    {/* Bars */}
                    {[
                      { x: 70, h: 30, label: 'Jan' }, { x: 150, h: 60, label: 'Feb' },
                      { x: 230, h: 100, label: 'Mar' }, { x: 310, h: 120, label: 'Apr' },
                      { x: 390, h: 145, label: 'May' }, { x: 470, h: 165, label: 'Jun' },
                    ].map(({ x, h, label }) => (
                      <g key={label}>
                        <rect x={x - 12} y={170 - h} width={24} height={h} rx="4"
                          fill="white" fillOpacity="0.07"/>
                        <text x={x} y="192" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)">{label}</text>
                      </g>
                    ))}
                    {/* Line */}
                    <path d="M 70 155 L 150 125 L 230 85 L 310 65 L 390 40 L 470 20"
                      stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <path d="M 70 155 L 150 125 L 230 85 L 310 65 L 390 40 L 470 20 L 470 170 L 70 170 Z"
                      fill="url(#grad1)"/>
                    {[70,150,230,310,390,470].map((cx, i) => {
                      const cy = [155,125,85,65,40,20][i]
                      return <circle key={cx} cx={cx} cy={cy} r="3" fill="white" stroke="var(--bg-elevated)" strokeWidth="2"/>
                    })}
                  </svg>
                </div>
              </div>

              {/* Service Health */}
              <div className="card p-6">
                <p className="section-label mb-4">Service Health</p>
                <div className="space-y-4">
                  {[
                    { name: 'FastAPI Engine', sub: 'Online & seeding active', status: 'online', icon: Server },
                    { name: 'Celery Workers', sub: '2 task loops running', status: 'online', icon: Activity },
                    { name: 'PostgreSQL + Redis', sub: 'pgvector indexes live', status: 'online', icon: Database },
                    { name: 'Chroma VectorDB', sub: 'Mock fallback ready', status: 'idle', icon: Sparkles },
                  ].map(({ name, sub, status, icon: Icon }) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--bg-base)', color: 'var(--fg-muted)' }}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--fg-primary)' }}>{name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>{sub}</p>
                      </div>
                      <span className={`status-dot ${status}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Recent Activity</p>
                <button className="section-label hover:opacity-70 transition-opacity">View all</button>
              </div>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Action</th><th>Details</th><th>Agent</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { action: 'File Indexed', detail: 'Q2_Sales_Report.pdf', agent: 'RAG Parser', agentColor: 'badge-green', time: '2m ago' },
                    { action: 'SQL Query', detail: 'SELECT SUM(total) FROM sales', agent: 'Data Analyst', agentColor: 'badge-accent', time: '12m ago' },
                    { action: 'Workflow Ran', detail: 'Summarization of Ledger', agent: 'Celery Engine', agentColor: 'badge-amber', time: '1h ago' },
                  ].map(row => (
                    <tr key={row.action}>
                      <td className="font-medium text-[13px]">{row.action}</td>
                      <td className="mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>{row.detail}</td>
                      <td><span className={`badge ${row.agentColor}`}>{row.agent}</span></td>
                      <td className="text-[11px]" style={{ color: 'var(--fg-faint)' }}>{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      // ── CHAT ──────────────────────────────────────────────────
      case 'chat':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-80px)] animate-fadeIn">
            {/* Main chat */}
            <div className="lg:col-span-3 card flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-soft)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Multi-Model Chat</p>
                    <p className="text-[11px]" style={{ color: 'var(--fg-faint)' }}>Conversing on workspace docs</p>
                  </div>
                </div>
                {/* Model pills */}
                <div className="flex items-center gap-1.5">
                  {['Groq', 'Gemini'].map(model => (
                    <button
                      key={model}
                      onClick={() => {
                        const activeConv = conversations.find(c => c.id === activeConversationId)
                        if (activeConv) {
                          setConversations(conversations.map(c => c.id === activeConversationId ? { ...c, model_name: model } : c))
                        }
                      }}
                      className={`model-pill ${conversations.find(c => c.id === activeConversationId)?.model_name.startsWith(model) ? 'active' : ''}`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender !== 'user' && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--bg-base)', color: 'var(--accent)', border: '1px solid var(--border-soft)' }}>
                        AI
                      </div>
                    )}
                    <div>
                      {msg.sender === 'system' ? (
                        <div className="flex items-center gap-2 text-[11px] py-1.5 px-3 rounded-lg" style={{ background: 'var(--bg-base)', color: 'var(--fg-faint)', border: '1px solid var(--border-soft)' }}>
                          <Terminal className="w-3 h-3" />{msg.content}
                        </div>
                      ) : msg.sender === 'user' ? (
                        <div className="bubble-user">{msg.content}</div>
                      ) : (
                        <div className="bubble-ai">
                          <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                          {msg.charts?.map((c, i) => (
                            <div key={i} className="mt-4 p-4 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-soft)' }}>
                              <p className="section-label mb-3">Chart Output</p>
                              <div className="h-32 flex items-end justify-between gap-2 px-2">
                                {c.data.map((item: any, idx: number) => {
                                  const maxV = Math.max(...c.data.map((x: any) => x.sales))
                                  const pct = (item.sales / maxV) * 100
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-1 flex-1 group relative">
                                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 text-[10px] px-2 py-0.5 rounded"
                                        style={{ background: 'var(--fg-primary)', color: 'var(--bg-base)' }}>
                                        ${(item.sales / 1000).toFixed(0)}k
                                      </div>
                                      <div className="w-full rounded-sm transition-all duration-500"
                                        style={{ height: `${pct * 0.75}px`, background: 'var(--accent)', opacity: 0.7 + idx * 0.04 }} />
                                      <span className="text-[9px]" style={{ color: 'var(--fg-faint)' }}>{item.month}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--border-soft)' }}>
                              <p className="section-label mb-2">Sources</p>
                              {msg.citations.map((cit, idx) => (
                                <a key={idx} href={cit.url} onClick={e => e.preventDefault()}
                                  className="flex items-center gap-2 p-2 rounded-lg text-[11px] transition-colors"
                                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-soft)', color: 'var(--fg-muted)' }}>
                                  <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                  {cit.title}
                                </a>
                              ))}
                            </div>
                          )}
                          {/* Agent logs */}
                          {msg.logs && msg.logs.length > 0 && (
                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                              {msg.logs.map((log, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] py-0.5 mono" style={{ color: 'var(--fg-faint)' }}>
                                  <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                  {log}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        {currentUser?.full_name[0]}
                      </div>
                    )}
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'var(--bg-base)', color: 'var(--accent)', border: '1px solid var(--border-soft)' }}>AI</div>
                    <div className="bubble-ai flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)', animationDelay: '0.2s' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-6 pb-5 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text" value={inputMsg} onChange={e => setInputMsg(e.target.value)}
                    placeholder="Ask a question, query documents, or analyze data…"
                    className="input flex-1 text-[13px]"
                  />
                  <button type="submit" disabled={isStreaming} className="btn-primary px-4 py-2.5">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4">
              <div className="card p-5 flex-1">
                <p className="section-label mb-3">LangGraph Trace</p>
                <div className="terminal h-52 overflow-y-auto space-y-2">
                  {(messages.filter(m => m.sender === 'assistant').pop()?.logs || ["router → idle"]).map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="log-info">›</span>
                      <span className="log-ok mono text-[11px]">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <p className="section-label mb-3">Knowledge Base</p>
                <div className="space-y-2">
                  {documents.slice(0, 3).map(d => (
                    <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg"
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border-soft)' }}>
                      <span className="text-[12px] font-medium truncate max-w-[120px]" style={{ color: 'var(--fg-primary)' }}>
                        {d.file_name}
                      </span>
                      <span className="badge badge-mono text-[10px]">{d.file_type.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      // ── ANALYTICS ─────────────────────────────────────────────
      case 'analytics':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="accent-bar" />
              <h2 className="page-title">Data Analytics</h2>
              <p className="page-subtitle">Natural language → SQL. Execute queries, plot results.</p>
            </div>

            <div className="card p-5">
              <form onSubmit={handleExecuteSQL} className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-faint)' }} />
                  <input type="text" value={sqlPrompt} onChange={e => setSqlPrompt(e.target.value)}
                    placeholder="Describe what you want to query in plain English…"
                    className="input pl-10 text-[13px]" />
                </div>
                <button type="submit" disabled={sqlLoading} className="btn-primary">
                  {sqlLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Run Query</>}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="card p-6 lg:col-span-2 space-y-5">
                <div>
                  <p className="section-label mb-2">Generated SQL</p>
                  <div className="terminal text-[11.5px]">
                    <span className="log-dim">{'>'} </span>
                    <span className="log-info">{sqlResult.sql}</span>
                  </div>
                </div>
                <div>
                  <p className="section-label mb-3">Query Results</p>
                  <table className="w-full data-table">
                    <thead>
                      <tr>{sqlResult.headers.map((h: string) => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sqlResult.rows.map((row: any, i: number) => (
                        <tr key={i}>
                          {row.map((val: string, idx: number) => (
                            <td key={idx} className={idx === 0 ? 'font-semibold' : 'mono text-[12px]'}
                              style={{ color: idx === 0 ? 'var(--fg-primary)' : 'var(--fg-muted)' }}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card p-6 space-y-4">
                <p className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Export Report</p>
                <p className="text-[12px]" style={{ color: 'var(--fg-muted)' }}>Compile analysis into executive-ready bundles.</p>
                <div className="space-y-2">
                  {[
                    { icon: FileText, label: 'Executive PDF', color: '#6366f1' },
                    { icon: FileSpreadsheet, label: 'DOCX Report', color: 'var(--accent-2)' },
                    { icon: Layers, label: 'PPTX Slides', color: 'var(--accent-3)' },
                  ].map(({ icon: Icon, label, color }) => (
                    <button key={label} className="btn-ghost w-full justify-between text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color }} />{label}
                      </span>
                      <Download className="w-3.5 h-3.5" style={{ color: 'var(--fg-faint)' }} />
                    </button>
                  ))}
                </div>
                <div className="rounded-xl p-4 mt-2" style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                  <p className="text-[12px] font-semibold" style={{ color: 'var(--fg-primary)' }}>Interactive Builder</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--fg-muted)' }}>Prompt the model to add charts dynamically.</p>
                </div>
              </div>
            </div>
          </div>
        )

      // ── DOCUMENTS ─────────────────────────────────────────────
      case 'documents':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="accent-bar" />
              <h2 className="page-title">Document Intelligence</h2>
              <p className="page-subtitle">Upload resources, generate summaries, populate RAG vector storage.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Drop zone */}
              <div className="relative card flex flex-col items-center justify-center text-center p-10 cursor-pointer overflow-hidden group"
                style={{ borderStyle: 'dashed', borderColor: 'var(--border-med)' }}>
                <input type="file" onChange={handleUploadMockFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                {isUploading ? (
                  <>
                    <RefreshCw className="w-8 h-8 animate-spin mb-4" style={{ color: 'var(--accent)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>Indexing vectors…</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--fg-primary)' }}>Upload a file</p>
                    <p className="text-[12px] mb-5" style={{ color: 'var(--fg-muted)' }}>PDF, DOCX, CSV, images · max 25MB</p>
                    <span className="btn-ghost text-[12px] px-4 py-2">Browse files</span>
                  </>
                )}
              </div>

              {/* File table */}
              <div className="card p-6 lg:col-span-2">
                <p className="font-semibold text-sm mb-5" style={{ color: 'var(--fg-primary)' }}>Knowledge Base Files</p>
                <table className="w-full data-table">
                  <thead><tr>
                    <th>Name</th><th>Type</th><th>Size</th><th>Status</th><th>Date</th>
                  </tr></thead>
                  <tbody>
                    {documents.map(d => (
                      <tr key={d.id}>
                        <td className="font-medium truncate max-w-[160px]" style={{ color: 'var(--fg-primary)' }}>{d.file_name}</td>
                        <td><span className="badge badge-mono">{d.file_type.toUpperCase()}</span></td>
                        <td className="mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>{(d.size / 1000).toFixed(0)} KB</td>
                        <td>
                          <span className={`badge ${d.status === 'completed' ? 'badge-green' : d.status === 'processing' ? 'badge-accent' : 'badge-red'}`}>
                            {d.status === 'completed' && <Check className="w-2.5 h-2.5" />}
                            {d.status}
                          </span>
                        </td>
                        <td className="text-[11px]" style={{ color: 'var(--fg-faint)' }}>{d.created_at.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      // ── AGENTS ────────────────────────────────────────────────
      case 'agents':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="accent-bar" />
              <h2 className="page-title">Agent Marketplace</h2>
              <p className="page-subtitle">Specialized AI agents with curated tools and model paths.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {[
                { name: "Data Analyst", model: "Groq", desc: "Aggregates DuckDB queries, generates charts, exports analytics.", tools: ["duckdb_sql", "pandas"], color: 'var(--accent)' },
                { name: "Research Agent", model: "Gemini", desc: "Crawls the web Perplexity-style, synthesizes briefs, cites sources.", tools: ["web_crawler", "rag"], color: '#6366f1' },
                { name: "Coding Agent", model: "Groq", desc: "Writes Python scripts, solves algorithms, reviews code.", tools: ["code_executor"], color: 'var(--accent-2)' },
                { name: "Resume Reviewer", model: "Gemini 1.5", desc: "Parses CV documents, checks role fit, gives structured feedback.", tools: ["vision_ocr", "nlp"], color: '#f97316' },
                { name: "Business Analyst", model: "Gemini 1.5 Flash", desc: "SWOT analysis, competitor research, KPI frameworks.", tools: ["web_crawler"], color: '#ec4899' },
              ].map((a, i) => (
                <div key={i} className="card-interactive p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `color-mix(in srgb, ${a.color} 12%, transparent)`, color: a.color }}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="badge badge-mono">{a.model}</span>
                  </div>
                  <h3 className="font-semibold text-[14px] mb-1.5" style={{ color: 'var(--fg-primary)' }}>{a.name}</h3>
                  <p className="text-[12px] leading-relaxed flex-1" style={{ color: 'var(--fg-muted)' }}>{a.desc}</p>
                  <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-soft)' }}>
                    <div className="flex gap-1.5 flex-wrap">
                      {a.tools.map(t => <span key={t} className="badge badge-mono text-[10px]">{t}</span>)}
                    </div>
                    <button onClick={() => {
                      setActiveTab('chat')
                      setMessages([{ id: Date.now(), sender: 'system', content: `Session started with [${a.name}]. Ready to execute.`, citations: [], created_at: new Date().toISOString() }])
                    }} className="flex items-center gap-1 text-[12px] font-semibold transition-colors"
                      style={{ color: 'var(--accent)' }}>
                      Boot <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Create custom agent */}
              <div className="card p-5 flex flex-col" style={{ borderStyle: 'dashed', borderColor: 'var(--border-med)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-base)', color: 'var(--fg-muted)' }}>
                    <Plus className="w-4 h-4" />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Custom Agent</p>
                </div>
                <form onSubmit={handleCreateAgent} className="space-y-3 flex-1">
                  <input type="text" value={newAgentName} onChange={e => setNewAgentName(e.target.value)}
                    placeholder="Agent name…" className="input text-[13px]" />
                  <textarea value={newAgentPrompt} onChange={e => setNewAgentPrompt(e.target.value)}
                    placeholder="System prompt instructions…" rows={3}
                    className="input text-[13px] resize-none" style={{ resize: 'none' }} />
                  <button type="submit" className="btn-primary w-full justify-center text-[13px] py-2.5">
                    <Plus className="w-3.5 h-3.5" /> Register Agent
                  </button>
                </form>
              </div>
            </div>
          </div>
        )

      // ── WORKFLOWS ─────────────────────────────────────────────
      case 'workflows':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="accent-bar" />
              <h2 className="page-title">Workflow Builder</h2>
              <p className="page-subtitle">Visual task graphs — wire document ingestion, OCR, translation, and alerts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="card p-6 lg:col-span-3 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Pipeline Canvas</p>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--fg-faint)' }}>
                    <Clock className="w-3 h-3" /> Auto-saved 1 min ago
                  </div>
                </div>

                {/* Canvas */}
                <div className="relative rounded-xl overflow-hidden flex-1 min-h-[280px] flex items-center"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-soft)', backgroundImage: 'radial-gradient(var(--border-soft) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  <div className="flex items-center gap-0 px-8 w-full">
                    {workflows[0]?.definition.nodes.map((node: any, i: number) => {
                      const isActive = runningWorkflowId !== null && workflowStepIndex === i
                      const isDone = runningWorkflowId !== null && workflowStepIndex > i
                      return (
                        <div key={node.id} className="flex items-center flex-1">
                          <div className={`flow-node flex-1 ${isActive ? 'running' : isDone ? 'done' : ''}`}>
                            <div className="text-[9px] font-bold mb-1.5">
                              <span className={`badge ${isActive ? 'badge-accent' : isDone ? 'badge-green' : 'badge-mono'}`}>
                                {isActive ? 'Running' : isDone ? 'Done' : 'Ready'}
                              </span>
                            </div>
                            <p className="text-[12px] font-semibold" style={{ color: 'var(--fg-primary)' }}>{node.data.label}</p>
                          </div>
                          {i < workflows[0].definition.nodes.length - 1 && (
                            <div className="flex items-center flex-shrink-0 w-8">
                              <div className="flex-1 h-px" style={{ background: isDone ? 'var(--accent-2)' : 'var(--border-med)' }} />
                              <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: isDone ? 'var(--accent-2)' : 'var(--fg-faint)' }} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <button onClick={() => handleRunWorkflow(workflows[0])} disabled={runningWorkflowId !== null} className="btn-primary">
                    <Play className="w-3.5 h-3.5" /> Run Pipeline
                  </button>
                  <button className="btn-ghost">Add Block</button>
                </div>
              </div>

              {/* Logs */}
              <div className="card p-5 flex flex-col">
                <p className="section-label mb-3">Execution Logs</p>
                <div className="terminal flex-1 min-h-[220px] overflow-y-auto space-y-1.5">
                  {workflowLogs.length === 0
                    ? <p className="log-dim">Pipeline idle. Run a workflow…</p>
                    : workflowLogs.map((l, i) => (
                      <p key={i} className={l.includes("completed") ? "log-ok" : "text-[#a0a8c0]"}>
                        {'> '}{l}
                      </p>
                    ))}
                </div>
                <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
                  <p className="text-[11px] font-semibold" style={{ color: '#10b981' }}>Efficiency</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-muted)' }}>~1.2s delay per block transition</p>
                </div>
              </div>
            </div>
          </div>
        )

      // ── ADMIN ─────────────────────────────────────────────────
      case 'admin':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="accent-bar" style={{ background: '#ef4444' }} />
              <h2 className="page-title">Admin Panel</h2>
              <p className="page-subtitle">Security audit logs, member access, and server allocations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'CPU Load', value: '24.5%', sub: 'Stable allocation', color: 'var(--accent)' },
                { label: 'Memory', value: '58.2%', sub: '3.8 GB / 8 GB', color: '#6366f1' },
                { label: 'User Accounts', value: '5', sub: '1 Admin · 2 Editors · 2 Viewers', color: 'var(--accent-2)' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="card p-5">
                  <p className="section-label mb-3">{label}</p>
                  <p className="stat-number">{value}</p>
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--fg-muted)' }}>{sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-6">
                <p className="font-semibold text-sm mb-5" style={{ color: 'var(--fg-primary)' }}>Users & Roles</p>
                <div className="space-y-3">
                  {[
                    { name: "Sarah Jenkins", email: "admin@nexusai.com", role: "admin" },
                    { name: "Lead Editor", email: "editor@nexusai.com", role: "editor" },
                    { name: "David Vance", email: "david@vance-corp.com", role: "viewer" },
                    { name: "Michael Chang", email: "m.chang@innovate.io", role: "editor" },
                    { name: "Elena Rostova", email: "elena@cybersecurity.net", role: "viewer" },
                  ].map((u, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl"
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border-soft)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--accent)', border: '1px solid var(--border-soft)' }}>
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'var(--fg-primary)' }}>{u.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>{u.email}</p>
                        </div>
                      </div>
                      <select defaultValue={u.role} onChange={e => alert(`Updated ${u.name} → ${e.target.value}`)}
                        className="input text-[12px] w-auto px-2.5 py-1.5">
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <p className="font-semibold text-sm mb-5" style={{ color: 'var(--fg-primary)' }}>Security Audit Log</p>
                <div className="terminal max-h-[300px] overflow-y-auto space-y-2.5">
                  {[
                    { type: '[ROLE_CHANGED]', msg: 'editor@nexusai.com → editor role', time: '10m ago', cls: 'log-info' },
                    { type: '[FILE_INDEXED]', msg: 'Q2_Sales_Report.pdf parsed', time: '1h ago', cls: 'log-ok' },
                    { type: '[USER_LOGGED]', msg: 'Admin signed in from 192.168.1.1', time: '2h ago', cls: 'text-[#a78bfa]' },
                    { type: '[API_RATE_LIMIT]', msg: 'Warning on personal token', time: '1d ago', cls: 'log-warn' },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`${entry.cls} font-bold text-[10px] flex-shrink-0 pt-0.5`}>{entry.type}</span>
                      <span className="flex-1 text-[11px]" style={{ color: '#a0a8c0' }}>{entry.msg}</span>
                      <span className="text-[10px] log-dim flex-shrink-0">{entry.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      // ── SETTINGS ──────────────────────────────────────────────
      case 'settings':
        return (
          <div className="space-y-6 animate-fadeIn max-w-2xl">
            <div>
              <div className="accent-bar" />
              <h2 className="page-title">Settings</h2>
              <p className="page-subtitle">Theme, API keys, and workspace configuration.</p>
            </div>

            <div className="card p-6">
              <p className="font-semibold text-sm mb-5" style={{ color: 'var(--fg-primary)' }}>Profile</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  {currentUser?.full_name[0]}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--fg-primary)' }}>{currentUser?.full_name}</p>
                  <p className="text-[12px]" style={{ color: 'var(--fg-muted)' }}>{currentUser?.email}</p>
                  <span className="badge badge-accent mt-1.5 text-[10px]">{currentUser?.role?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="card p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Appearance</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--fg-muted)' }}>Toggle between light and dark mode.</p>
              </div>
              <button onClick={toggleTheme} className="btn-ghost px-4 py-2.5 flex items-center gap-2">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            <div id="credentials" className="card p-6 space-y-5">
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>API Keys</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--fg-muted)' }}>Running in mock mode. Add keys for live model access.</p>
              </div>
              {[
                { label: 'OpenAI (Fallback)', placeholder: 'sk-...' },
                { label: 'Groq', placeholder: 'gsk_...' },
                { label: 'Google Gemini', placeholder: 'AIzaSy...' },
              ].map(({ label, placeholder }) => (
                <div key={label} className="space-y-1.5">
                  <label className="section-label">{label}</label>
                  <input type="password" placeholder={placeholder} className="input text-[13px]" />
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-6 space-y-4" style={{ background: '#0b0b0e', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <p className="font-semibold text-sm text-white">Recruiter Demo Accounts</p>
              </div>
              <p className="text-[12px]" style={{ color: '#8b8fa8' }}>Pre-seeded accounts for evaluating role-based access controls:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl mono text-[11.5px]"
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div>
                  <p className="mb-2" style={{ color: 'var(--accent)' }}>// Admin</p>
                  <p style={{ color: '#6b7280' }}>Email: <span className="text-white">admin@nexusai.com</span></p>
                  <p style={{ color: '#6b7280' }}>Pass: <span className="text-white">adminpassword123</span></p>
                </div>
                <div>
                  <p className="mb-2" style={{ color: '#a78bfa' }}>// Editor</p>
                  <p style={{ color: '#6b7280' }}>Email: <span className="text-white">editor@nexusai.com</span></p>
                  <p style={{ color: '#6b7280' }}>Pass: <span className="text-white">editorpassword123</span></p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div style={{ color: 'var(--fg-muted)' }}>Tab not found.</div>
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'Multi-Model Chat', icon: Bot },
    { id: 'analytics', label: 'Data Analytics', icon: Database },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'agents', label: 'Agents', icon: Sparkles },
    { id: 'workflows', label: 'Workflows', icon: GitBranch },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--fg-primary)' }}>
      {/* ── Sidebar ── */}
      <aside className="sidebar" style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-soft)' }}>
        {/* Logo */}
        <div className="p-5 pb-3">
          <button onClick={() => setActiveTab('landing')} className="flex items-center gap-3 w-full group mb-6">
            <div className="logo-mark group-hover:opacity-85 transition-opacity">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-[15px] leading-tight" style={{ color: 'var(--fg-primary)', fontFamily: 'Syne, sans-serif' }}>Nexus AI</p>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--fg-faint)', letterSpacing: '0.08em' }}>V1.0 PRO</p>
            </div>
          </button>

          {/* Workspace selector */}
          <div className="mb-5">
            <p className="section-label mb-2 px-1">Workspace</p>
            <select value={activeWorkspaceId || ''} onChange={e => setActiveWorkspaceId(Number(e.target.value))}
              className="input text-[12px] w-full">
              {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {/* Nav */}
          <nav className="space-y-0.5">
            <p className="section-label mb-2 px-1">Navigation</p>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id as any)}
                className={`nav-item w-full ${activeTab === id ? 'active' : ''}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}

            {currentUser?.role === 'admin' && (
              <div className="pt-4">
                <p className="section-label mb-2 px-1">Admin</p>
                <button onClick={() => setActiveTab('admin')}
                  className={`nav-item w-full ${activeTab === 'admin' ? 'active-danger' : ''}`}>
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Admin Panel</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom user strip */}
        <div className="mt-auto px-5 pb-5 pt-4" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <button onClick={() => setActiveTab('settings')} className="flex items-center gap-3 w-full group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {currentUser?.full_name[0]}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--fg-primary)' }}>{currentUser?.full_name}</p>
              <p className="text-[10px]" style={{ color: 'var(--fg-faint)' }}>{currentUser?.role}</p>
            </div>
            <Settings className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--fg-faint)' }} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto max-h-screen p-7 lg:p-9 relative z-10">
        {renderTabContent()}
      </main>
    </div>
  )
}
