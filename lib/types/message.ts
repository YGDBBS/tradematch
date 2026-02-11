export interface Message {
  id: string
  request_id: string
  sender_id: string
  body: string
  attachment_url: string | null
  created_at: string
}

export interface MessageInsert {
  request_id: string
  sender_id?: string // Set by API from auth
  body: string
  attachment_url?: string
}

export interface MessageWithSender extends Message {
  sender: {
    id: string
    full_name: string | null
    role: string
  }
}
