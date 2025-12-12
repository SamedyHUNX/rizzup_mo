// CREATE TABLE passes (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   UNIQUE(from_user_id, to_user_id)
// );

// -- Add indexes for performance
// CREATE INDEX idx_passes_from_user ON passes(from_user_id);
// CREATE INDEX idx_passes_to_user ON passes(to_user_id);
