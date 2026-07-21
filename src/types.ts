export interface SummaryResult {
  title: string;
  authors: string;
  journal: string;
  year: string;
  tldr: string;
  objectives: string[];
  methods: string[];
  results: string[];
  conclusions: string[];
  suggestedQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedFollowUps?: string[];
}

export interface PaperEvaluation {
  rating: number;
  usefulness: "high" | "medium" | "low";
  comments: string;
}
