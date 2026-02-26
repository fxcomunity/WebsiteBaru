-- Database Schema untuk FX Community (Neon PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY,
    username       VARCHAR(50)  UNIQUE NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password       TEXT         NOT NULL,
    role           VARCHAR(20)  NOT NULL DEFAULT 'User'
                   CHECK (role IN ('Owner', 'Admin', 'User')),
    status         VARCHAR(20)  NOT NULL DEFAULT 'Aktif'
                   CHECK (status IN ('Aktif', 'Tidak Aktif')),
    email_verified BOOLEAN      DEFAULT FALSE,
    created_at     TIMESTAMP    DEFAULT NOW()
);

-- OTP Email Verification Table
CREATE TABLE IF NOT EXISTS otp_email (
    id          SERIAL PRIMARY KEY,
    user_id     INT          REFERENCES users(id) ON DELETE CASCADE,
    email       VARCHAR(100) NOT NULL,
    otp_code    VARCHAR(6)   NOT NULL,
    expired_at  TIMESTAMP    NOT NULL,
    is_used     BOOLEAN      DEFAULT FALSE,
    attempt     INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- OTP Reset Password Table
CREATE TABLE IF NOT EXISTS otp_reset (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(100) NOT NULL,
    otp_code    VARCHAR(6)   NOT NULL,
    expired_at  TIMESTAMP    NOT NULL,
    is_used     BOOLEAN      DEFAULT FALSE,
    attempt     INT          DEFAULT 0,
    ip_address  VARCHAR(50),
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- PDFs Table
CREATE TABLE IF NOT EXISTS pdfs (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    url         TEXT          NOT NULL,
    category    VARCHAR(50)   NOT NULL,
    thumbnail   VARCHAR(10)   DEFAULT '📄',
    views       INT           DEFAULT 0,
    downloads   INT           DEFAULT 0,
    is_active   BOOLEAN       DEFAULT TRUE,
    created_at  TIMESTAMP     DEFAULT NOW(),
    updated_at  TIMESTAMP     DEFAULT NOW()
);

-- Login Log Table
CREATE TABLE IF NOT EXISTS login_log (
    id          SERIAL PRIMARY KEY,
    user_id     INT          REFERENCES users(id) ON DELETE SET NULL,
    email       VARCHAR(100),
    ip_address  VARCHAR(50),
    status      VARCHAR(20),
    keterangan  TEXT,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_otp_email_user_id ON otp_email(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_reset_email ON otp_reset(email);
CREATE INDEX IF NOT EXISTS idx_pdfs_category ON pdfs(category);
CREATE INDEX IF NOT EXISTS idx_login_log_user_id ON login_log(user_id);
CREATE INDEX IF NOT EXISTS idx_login_log_created_at ON login_log(created_at);
