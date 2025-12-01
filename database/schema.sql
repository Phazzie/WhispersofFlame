-- Whispers of Flame Database Schema
-- Neon PostgreSQL Database
-- Privacy-first design with auto-expiration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table (game sessions)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL,
    host_id UUID NOT NULL,
    step VARCHAR(50) NOT NULL DEFAULT 'Lobby',
    spicy_level VARCHAR(20) DEFAULT 'Mild',
    categories TEXT[] DEFAULT '{}',
    play_mode VARCHAR(20) DEFAULT 'multi-device', -- 'multi-device' or 'same-device'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    is_host BOOLEAN DEFAULT false,
    is_ready BOOLEAN DEFAULT false,
    connection_id VARCHAR(100), -- For reconnection tracking
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, name) -- No duplicate names in same room
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    category VARCHAR(50),
    spicy_level VARCHAR(20),
    round_number INTEGER NOT NULL,
    asked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, player_id) -- One answer per player per question
);

-- Game events for real-time sync
CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'player_joined', 'answer_submitted', 'step_changed', etc
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_rooms_code ON rooms(code) WHERE is_active = true;
CREATE INDEX idx_rooms_expires ON rooms(expires_at) WHERE is_active = true;
CREATE INDEX idx_players_room ON players(room_id);
CREATE INDEX idx_questions_room ON questions(room_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_game_events_room_created ON game_events(room_id, created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rooms table
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to cleanup expired rooms
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void AS $$
BEGIN
    UPDATE rooms
    SET is_active = false
    WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- View for active game state (convenient for queries)
CREATE VIEW active_game_state AS
SELECT
    r.*,
    COUNT(DISTINCT p.id) as player_count,
    COUNT(DISTINCT q.id) as question_count,
    COUNT(DISTINCT a.id) as answer_count,
    MAX(ge.created_at) as last_activity
FROM rooms r
LEFT JOIN players p ON r.id = p.room_id
LEFT JOIN questions q ON r.id = q.room_id
LEFT JOIN answers a ON q.id = a.question_id
LEFT JOIN game_events ge ON r.id = ge.room_id
WHERE r.is_active = true
GROUP BY r.id;

-- Comments for documentation
COMMENT ON TABLE rooms IS 'Game sessions with auto-expiration for privacy';
COMMENT ON TABLE players IS 'Players in each game room';
COMMENT ON TABLE questions IS 'AI-generated questions asked during the game';
COMMENT ON TABLE answers IS 'Player responses to questions (encrypted in production)';
COMMENT ON TABLE game_events IS 'Event log for real-time synchronization';
COMMENT ON COLUMN rooms.play_mode IS 'multi-device: separate phones, same-device: pass-the-phone';
COMMENT ON COLUMN players.connection_id IS 'WebSocket or session ID for reconnection';