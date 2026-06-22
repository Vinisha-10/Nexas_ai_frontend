import { create } from 'zustand'

export interface UserSession {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'editor' | 'viewer'
  token: string
}

export interface WorkspaceItem {
  id: number
  name: string
  owner_id: number
  members: any[]
}

export interface ConversationItem {
  id: number
  title: string
  model_name: string
  created_at: string
}

export interface MessageItem {
  id: number
  sender: 'user' | 'assistant' | 'system'
  content: string
  citations: any[]
  charts?: any[]
  logs?: string[]
  created_at: string
}

export interface DocumentItem {
  id: number
  file_name: string
  file_type: string
  status: 'processing' | 'completed' | 'failed'
  size: number
  created_at: string
}

export interface WorkflowItem {
  id: number
  name: string
  definition: any
  created_at: string
}

export interface ReportItem {
  id: number
  title: string
  format: string
  status: string
  created_at: string
}

interface AppState {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  
  // Auth state
  currentUser: UserSession | null
  setCurrentUser: (user: UserSession | null) => void
  
  // Navigation
  activeTab: 'landing' | 'dashboard' | 'chat' | 'analytics' | 'documents' | 'agents' | 'workflows' | 'settings' | 'admin'
  setActiveTab: (tab: any) => void
  
  // Workspaces
  workspaces: WorkspaceItem[]
  activeWorkspaceId: number | null
  setActiveWorkspaceId: (id: number | null) => void
  setWorkspaces: (workspaces: WorkspaceItem[]) => void
  
  // Chat
  conversations: ConversationItem[]
  activeConversationId: number | null
  messages: MessageItem[]
  isStreaming: boolean
  setActiveConversationId: (id: number | null) => void
  setConversations: (convs: ConversationItem[]) => void
  setMessages: (msgs: MessageItem[]) => void
  addMessage: (msg: MessageItem) => void
  setIsStreaming: (streaming: boolean) => void
  
  // Documents
  documents: DocumentItem[]
  setDocuments: (docs: DocumentItem[]) => void
  addDocument: (doc: DocumentItem) => void
  
  // Workflows
  workflows: WorkflowItem[]
  setWorkflows: (wfs: WorkflowItem[]) => void
  
  // Reports
  reports: ReportItem[]
  setReports: (reps: ReportItem[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    return { theme: newTheme };
  }),
  
  // Default Seed User is Administrator for recruiters
  currentUser: {
    id: 1,
    email: "admin@nexusai.com",
    full_name: "Sarah Jenkins (Recruiter)",
    role: "admin",
    token: "mock-jwt-token-string"
  },
  setCurrentUser: (user) => set({ currentUser: user }),
  
  activeTab: 'landing',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  workspaces: [
    { id: 1, name: "Nexus Personal Space", owner_id: 1, members: [] },
    { id: 2, name: "Financial Planning Workspace", owner_id: 1, members: [] },
    { id: 3, name: "Data Operations Hub", owner_id: 1, members: [] }
  ],
  activeWorkspaceId: 1,
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  
  conversations: [
    { id: 101, title: "Quarterly Revenue Forecasting", model_name: "Gemini 1.5 Pro", created_at: "2026-06-21T14:15:00Z" },
    { id: 102, title: "Natural Language SQL Interface", model_name: "Groq", created_at: "2026-06-21T12:30:00Z" },
    { id: 103, title: "Multi-Agent System Orchestration", model_name: "Gemini 1.5 Pro", created_at: "2026-06-21T10:00:00Z" }
  ],
  activeConversationId: 101,
  messages: [
    {
      id: 201,
      sender: 'system',
      content: "System: Agent Workspace session loaded successfully. Active agents: [Data Analyst Agent, Research Agent, Writer Agent].",
      citations: [],
      created_at: "2026-06-21T14:15:00Z"
    },
    {
      id: 202,
      sender: 'user',
      content: "Show Q1 2026 sales trends and predict growth for Q3.",
      citations: [],
      created_at: "2026-06-21T14:15:10Z"
    },
    {
      id: 203,
      sender: 'assistant',
      content: "### Quarterly Sales Trends Analysis\n\nI parsed the financials database using DuckDB. Financial metrics indicate steady scaling into Q2 2026:\n\n| Quarter | Net Revenue | Expenses | Margin |\n| :--- | :--- | :--- | :--- |\n| Q1 2025 | $120,000 | $95,000 | 20.8% |\n| Q2 2025 | $145,000 | $102,000 | 29.6% |\n| Q3 2025 | $190,000 | $115,000 | 39.4% |\n| Q4 2025 | $240,000 | $130,000 | 45.8% |\n| Q1 2026 | $285,000 | $142,000 | 50.1% |\n| Q2 2026 | $345,000 | $158,000 | 54.2% |\n\n**Prediction for Q3 2026:**\nBased on linear regression of past 6 quarters, projected Q3 2026 Net Sales will be **$395,400** with an estimated margin of **55.8%**.\n\nI have rendered the charts in the workspace window.",
      citations: [
        { title: "Q2_Sales_Report.pdf", snippet: "Q2 2026 net performance records a profit increase of 21.0% compared to Q1.", url: "file:///Q2_Sales_Report.pdf", page: 2 }
      ],
      charts: [
        {
          type: "bar_and_line",
          xAxis: "quarter",
          series: [
            { name: "Revenue", type: "bar", color: "#8b5cf6" },
            { name: "Expenses", type: "bar", color: "#3b82f6" }
          ],
          data: [
            { quarter: "Q1 2025", Revenue: 120000, Expenses: 95000 },
            { quarter: "Q2 2025", Revenue: 145000, Expenses: 102000 },
            { quarter: "Q3 2025", Revenue: 190000, Expenses: 115000 },
            { quarter: "Q4 2025", Revenue: 240000, Expenses: 130000 },
            { quarter: "Q1 2026", Revenue: 285000, Expenses: 142000 },
            { quarter: "Q2 2026", Revenue: 345000, Expenses: 158000 }
          ]
        }
      ],
      logs: ["router -> data_analyst_agent", "data_analyst_agent -> run_sql", "run_sql -> render_bar_chart"],
      created_at: "2026-06-21T14:15:30Z"
    }
  ],
  isStreaming: false,
  
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setConversations: (conversations) => set({ conversations }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  
  documents: [
    { id: 1, file_name: "Enterprise_Intelligence_Pitch.pdf", file_type: "pdf", status: "completed", size: 1245000, created_at: "2026-06-21T09:12:00Z" },
    { id: 2, file_name: "Financial_Growth_Q1_Q2.xlsx", file_type: "xlsx", status: "completed", size: 540000, created_at: "2026-06-21T09:15:00Z" },
    { id: 3, file_name: "Operational_Directives.docx", file_type: "docx", status: "completed", size: 89000, created_at: "2026-06-21T10:04:00Z" },
    { id: 4, file_name: "Unstructured_WebLogs.csv", file_type: "csv", status: "processing", size: 14560000, created_at: "2026-06-21T16:20:00Z" }
  ],
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  
  workflows: [
    {
      id: 1,
      name: "RAG Summarization pipeline",
      definition: {
        nodes: [
          { id: "1", type: "file_source", data: { label: "PDF Document Ingest" }, position: { x: 50, y: 150 } },
          { id: "2", type: "ocr_parser", data: { label: "Vision OCR Parse" }, position: { x: 250, y: 150 } },
          { id: "3", type: "summarize_node", data: { label: "Summarize (Groq)" }, position: { x: 450, y: 150 } },
          { id: "4", type: "export_pdf", data: { label: "PDF Export" }, position: { x: 650, y: 150 } }
        ],
        edges: [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
          { id: "e3-4", source: "3", target: "4" }
        ]
      },
      created_at: "2026-06-21T11:00:00Z"
    },
    {
      id: 2,
      name: "Financial Data translation & Alert",
      definition: {
        nodes: [
          { id: "1", type: "file_source", data: { label: "CSV Ledger Ingest" }, position: { x: 50, y: 150 } },
          { id: "2", type: "data_analyze", data: { label: "Run Pandas SQL" }, position: { x: 250, y: 150 } },
          { id: "3", type: "translate_text", data: { label: "Translate to ES" }, position: { x: 450, y: 150 } },
          { id: "4", type: "email_dispatch", data: { label: "Email Alert" }, position: { x: 650, y: 150 } }
        ],
        edges: [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
          { id: "e3-4", source: "3", target: "4" }
        ]
      },
      created_at: "2026-06-21T11:45:00Z"
    }
  ],
  setWorkflows: (workflows) => set({ workflows }),
  
  reports: [
    { id: 1, title: "Executive Operations Briefing Q2", format: "PDF", status: "completed", created_at: "2026-06-21T14:30:00Z" },
    { id: 2, title: "Sales Analysis PowerPoint", format: "PPTX", status: "completed", created_at: "2026-06-21T13:00:00Z" },
    { id: 3, title: "Financial Spreadsheet Ledger", format: "DOCX", status: "failed", created_at: "2026-06-21T10:10:00Z" }
  ],
  setReports: (reports) => set({ reports })
}))
