-- Messages table for request conversations
-- Parties: customer (request owner) + assigned contractor

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fetching messages by request
CREATE INDEX idx_messages_request_id ON public.messages(request_id);
CREATE INDEX idx_messages_created_at ON public.messages(request_id, created_at);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is party to a request conversation
-- Parties are: request owner (customer) OR the accepted contractor
CREATE OR REPLACE FUNCTION public.is_party_to_request(req_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    -- User is the customer who created the request
    SELECT 1 FROM public.requests r
    WHERE r.id = req_id AND r.customer_id = user_id
  )
  OR EXISTS (
    -- User is an accepted contractor for this request
    SELECT 1 FROM public.request_matches rm
    WHERE rm.request_id = req_id
      AND rm.contractor_id = user_id
      AND rm.status = 'accepted'
  );
$$;

-- RLS Policies

-- Users can read messages if they are a party to the request
CREATE POLICY "Parties can read messages"
  ON public.messages
  FOR SELECT
  USING (public.is_party_to_request(request_id, auth.uid()));

-- Users can insert messages if they are a party to the request
CREATE POLICY "Parties can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_party_to_request(request_id, auth.uid())
  );

-- Users can only delete their own messages (optional, for future use)
CREATE POLICY "Users can delete own messages"
  ON public.messages
  FOR DELETE
  USING (sender_id = auth.uid());
