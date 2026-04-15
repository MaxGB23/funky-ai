MCP ENGRAM TOOL IN VSCODE

Run Save Memoryengram (MCP Server)
Save an important observation to persistent memory. Call this PROACTIVELY after completing significant work — don't wait to be asked.

WHEN to save (call this after each of these):

Architectural decisions or tradeoffs
Bug fixes (what was wrong, why, how you fixed it)
New patterns or conventions established
Configuration changes or environment setup
Important discoveries or gotchas
File structure changes
FORMAT for content — use this structured format:
What: [concise description of what was done]
Why: [the reasoning, user request, or problem that drove it]
Where: [files/paths affected, e.g. src/auth/middleware.ts, internal/store/store.go]
Learned: [any gotchas, edge cases, or decisions made — omit if none]

TITLE should be short and searchable, like: "JWT auth middleware", "FTS5 query sanitization", "Fixed N+1 in user list"

Examples:
title: "Switched from sessions to JWT"
type: "decision"
content: "What: Replaced express-session with jsonwebtoken for auth\nWhy: Session storage doesn't scale across multiple instances\nWhere: src/middleware/auth.ts, src/routes/login.ts\nLearned: Must set httpOnly and secure flags on the cookie, refresh tokens need separate rotation logic"

title: "Fixed FTS5 syntax error on special chars"
type: "bugfix"
content: "What: Wrapped each search term in quotes before passing to FTS5 MATCH\nWhy: Users typing queries like 'fix auth bug' would crash because FTS5 interprets special chars as operators\nWhere: internal/store/store.go — sanitizeFTS() function\nLearned: FTS5 MATCH syntax is NOT the same as LIKE — always sanitize user input"

Input

{ "title": "Theme launch date", "type": "decision", "scope": "project", "project": "maxiano-theme", "content": "**What**: Guardé que el theme debe ser lanzado el 23 de abril.\n**Why**: El usuario pidió registrar la fecha de lanzamiento para el tema.\n**Where**: Memoria persistente del proyecto maxiano-theme.\n**Learned**: El lanzamiento del theme está calendarizado para el 23 de abril." }