export interface ChatMessage {
  _id: string;
  id: string;
  session_id: string;
  role: string;
  content: string;
  timestamp: string;
}
