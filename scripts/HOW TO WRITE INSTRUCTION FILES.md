HOW TO WRITE INSTRUCTION FILES

Here’s how I’d think about this like a front-office GM: one clubhouse (you), four very different players (Claude, Gemini, Copilot, Agents). I’ll give you:

A quick comparison + common patterns

“Moneyball” edges per tool

Ready-to-drop markdown for claude.md, agents.md, gemini.md, copilot.md

0. Big picture: what they all have in common

Across Claude, Gemini, Copilot, and agent frameworks, the official guides and blogs basically agree on a few fundamentals:

Clear, specific instructions win – All of them respond best when you spell out the task, constraints, and desired output explicitly, instead of vague “help me with this”. 
GitHub Docs
+3
Claude Console
+3
Google AI for Developers
+3

Personas & roles help – Telling the model “you are a ___” and defining its job (editor, test-writer, refactor-bot, etc.) is explicitly recommended in Gemini, Claude, and agent docs, and implicitly in Copilot’s “top-level comment” pattern. 
OpenAI CDN
+4
Claude Console
+4
Google Cloud
+4

Examples / few-shot prompting – All of them improve when you give example inputs + ideal outputs (few-shot), especially for structured or nuanced tasks. 
Google Cloud Documentation
+3
Claude Console
+3
Claude Console
+3

Iterate, don’t one-shot – Official docs for Claude, Gemini, Copilot, and agents all emphasize interactive refinement and breaking complex tasks into smaller steps or linked prompts/LLM calls. 
GitHub Docs
+5
Claude Console
+5
Google AI for Developers
+5

Structure the output – Asking for JSON, XML, Markdown tables, etc. is directly recommended in Claude and Gemini docs and is a core pattern in agent frameworks. 
OpenAI CDN
+3
Claude Console
+3
Amazon Web Services, Inc.
+3

So your shared “README” across tools is basically:

Be explicit about what, how, format, persona, plus give one or two concrete examples, then iterate.

1. Quick comparison snapshot (for a shared README)

You can put this in a global README-ai-stack.md if you want:

| Tool     | Primary Role                            | Unique Edge                                             | Best At                                               |
|----------|-----------------------------------------|---------------------------------------------------------|-------------------------------------------------------|
| Claude   | General LLM + code/analysis             | XML-structured prompts, long context, strong safety     | Deep reasoning, refactors, style canon, long-doc work |
| Gemini   | General LLM + Google ecosystem          | Native Workspace/Drive integration, strong multimodal   | Knowledge retrieval, doc ops, media understanding     |
| Copilot  | In-IDE coding copilots + agents         | Tight repo/IDE context, GitHub-native workflows         | Code gen, refactor, tests, PRs, task-level agents     |
| Agents   | Orchestration pattern, not a model      | Tool orchestration, multi-agent workflows, governance   | Pipelines, automation, routing between models/tools   |

2. Moneyball ideas (high-level, before the per-file docs)
Claude – undervalued edges

XML / tag-based structuring – Claude has been explicitly tuned to pay special attention to XML tags separating instructions, context, examples, etc. Most people ignore this; you can turn your SDD flows into <seams>, <contracts>, <tests> blocks and get more reliable behavior than GPT-style “just bullet it” prompts. 
Walturn
+3
Claude Console
+3
Amazon Web Services, Inc.
+3

Long-context canon keeper – Use Claude as the “style canon auditor” for long manuscripts, repos, or entire creative universes; it’s particularly good with long context + reasoning over constraints.

Claude Code CLI as an “agent” that actually sees files – The official Claude Code tool is basically an agentic coding environment that reads/writes a real filesystem; you can use this instead of rolling your own full agent, especially for SDD-coded repos. 
Anthropic

Gemini – undervalued edges

Google Workspace as memory + knowledge base – Gemini’s official prompt guides assume Workspace usage: Docs, Sheets, Gmail, Drive, etc. That’s a gigantic arbitrage if your life is already in Google. Use it as your librarian/ops manager. 
Google Cloud
+3
Google Services
+3
Google Workspace
+3

Multimodal for actual work, not just toys – Feed meeting recordings, screenshots, PDFs, and ask for decisions, risks, TODOs, and data extraction, using the prompt strategies from Vertex AI docs. 
Google AI for Developers
+1

Gemini 3 prompting: short and precise – Some guidance says Gemini 3 prefers concise, focused instructions and can over-analyze overly fancy prompts; that’s different from classic “prompt poetry” meta. 
Reddit

Copilot – undervalued edges

Repo-level “house style” via copilot-instructions.md + org instructions – This is where you encode SDD rules, naming conventions, testing requirements, “always write tests from contracts first”, etc. Almost no one really tunes this deeply. 
GitHub Docs
+1

Top-level comments as micro-prompts – The official Copilot tips emphasize giving high-level comments or TODOs before writing code so Copilot sees intent + context in one place. Combine with open files + meaningful names and it becomes eerily good at filling in SDD patterns. 
GitHub Docs
+2
The GitHub Blog
+2

Agent + MCP surface – New Copilot agents use MCP and custom agents; you can plug in your own tooling/servers and let Copilot’s agent call them (including SDD-aware services). 
GitHub Docs
+1

Agents (pattern) – undervalued edges

“No agent” as your baseline – Anthropic and OpenAI both explicitly say: start simple, only go agentic when needed. That’s a Moneyball edge because most people over-engineer multi-agent chaos. 
Anthropic
+1

Micro-agents with crystal-clear scopes – Best-practice writeups stress narrow responsibilities, one thing per LLM call, and multi-agent composition only where it actually pays off. 
Medium
+2
Reddit
+2

Governance & observability as features, not afterthoughts – Enterprise guides on agent systems hammer governance, logging, and evaluation. If you build this first, your agent stack will actually be debuggable and improvable instead of vibes-only. 
Patronus AI
+1

3. claude.md
# Claude – Working Notes & Best Practices

## 1. Role in the stack

Claude is the **long-context reasoning and style canon specialist**. It’s great at:

- Deep analysis and editing of long texts or repos
- Following **structured instructions** (especially with XML-style tags)
- Safety-aware reasoning and “voice consistent” creative work
- Agentic coding via Claude Code (CLI) where it can actually read/write files

Use it when you need **precision, structure, and consistency** across big contexts.

---

## 2. Core strengths (vs Gemini/Copilot/Agents)

- **XML/tag structure awareness** – Claude responds unusually well when you wrap instructions, context, examples, and inputs in XML-like tags (`<instructions>…</instructions>`).
- **Very long context + consistency** – Strong at keeping track of themes, constraints, and style over long documents or large codebases.
- **Safety and refusal behavior** – More conservative by design, which is good for tasks where hallucinations or risky completions are expensive.
- **Claude Code** – Native “agentic coding” experience via CLI that can manage multi-step coding tasks over a filesystem.

---

## 3. Prompting best practices

**3.1 Skeleton prompt**

```text
<instructions>
You are [ROLE]. Your job:
1. [Goal 1]
2. [Goal 2]
Constraints:
- Style: [...]
- Format: [...]
- Don’t do: [...]
</instructions>

<context>
[Paste relevant snippets, contracts, constraints, examples...]
</context>

<task>
[Specific thing Claude should do *now*]
</task>

<output_format>
[Describe the JSON/Markdown structure you want back]
</output_format>


3.2 Tactics that work well

Use sections with tags: <instructions>, <context>, <examples>, <task>, <output_format>.

Be clear and direct; avoid vague “help me” asks.

Include 1–3 examples of ideal input→output for nuanced tasks.

Ask it to “think step-by-step” inside your tags (e.g. <reasoning>), but request that only the final answer is surfaced in <answer>.

For long projects, keep a living “canon prompt” (style, rules, constraints) you paste or link to each time.

4. Moneyball patterns for Claude

Turn your SDD pipeline into XML

<seams>, <contracts>, <tests>, <mocks>, <impl_plan> — Claude is unusually good at obeying structures like this.

Use it as a “style auditor”

Have Claude extract a Canon Doc from your best chapters/PRs, then use that Canon as a constraint to critique or rewrite weaker material.

Ask Claude to write prompts for other models

“Given my SDD rules, write the ideal o3 / GPT-5.1 / Gemini prompt for this task.”

Claude Code as an “AI senior engineer”

Scripted workflows: “Understand this repo → summarize modules → propose seam map → create contract files → write tests → propose PR plan”.

5. How Claude overlaps with others

Shares with Gemini & agents:

Clear instructions, persona, and structured outputs help a lot.

Shares with Copilot:

In the coding domain, benefits from good file context and clear comments, especially when used via Claude Code or IDE integrations.

6. Good starting template (Claude)
<instructions>
You are an AI architect helping me implement Seam-Driven Development (SDD).
Pipeline: Identify seams → Define seams → Write contracts → Write tests → Write mocks → Implement.
Today, focus ONLY on: [stage].
Goals:
- [Goal 1]
- [Goal 2]
Constraints:
- Keep outputs concise.
- Use my naming patterns.
- Ask clarifying questions only if absolutely necessary.
</instructions>

<context>
[Paste relevant code/docs/contracts/tests]
</context>

<task>
[Specific outcome you want this call to produce]
</task>

<output_format>
[Bullet list, JSON, or Markdown structure]
</output_format>


---

## 4. `agents.md`

```markdown
# Agents – Patterns, Pitfalls, and Best Practices

## 1. Role in the stack

“Agents” are **patterns**, not models: workflows where LLMs can call tools, make decisions, and sometimes call other LLMs. They shine when:

- Tasks are multi-step and tool-heavy (APIs, repos, browsers, CI, etc.).
- You want **automation**, not just one-off Q&A.
- Different sub-tasks need different capabilities or models.

---

## 2. When NOT to use agents

- If a **single prompt + model call** can solve it reliably.
- If latency/cost are more important than squeezing out a small quality gain.
- If you don’t have monitoring, logs, or evaluation in place yet.

Baseline rule: **start simple, then add agentic complexity only where the ROI is obvious.**

---

## 3. Core design principles

1. **Narrow scope per agent**
   - Each agent gets a small, clearly defined responsibility (e.g., “contract extractor”, “test writer”, “GitHub PR commenter”).
2. **One thing per LLM call**
   - Do not mix “generate spec + write code + review tests” in one call; split it.
3. **Explicit tools & docstrings**
   - Tools should have crystal-clear docstrings: inputs, outputs, side effects.
4. **Stable handoffs**
   - When one agent hands off to another, write down a contract: what fields/structure the next agent expects.
5. **Guardrails & governance**
   - Logging, audit trails, and explicit “stop conditions” (e.g., “after 3 failed attempts, escalate to human”).

---

## 4. Agent blueprints for your ecosystem

Some reusable agent archetypes you can plug models into:

- **Canon Keeper**
  - Reads your Claude/GPT/Gemini outputs and compares them against an SDD Canon.
- **Repo Seam Mapper**
  - Scans a repo, identifies seams, and outputs `SEAMS.md`.
- **Contract Enforcer**
  - Refuses to generate code until contracts + tests exist; auto-generates missing pieces.
- **Creative Pipeline Orchestrator**
  - Steps: idea intake → outline → first pass → integrity audit → alt versions → final blend.

Each of these can be implemented with **any model**, as long as the instructions and contracts are precise.

---

## 5. Moneyball patterns for agents

- **“Agents as tools” pattern**
  - Treat complex agents as tools callable by a higher-level coordinator, instead of building massive all-in-one agents.
- **Micro-agents around your existing tools**
  - Simple agents that wrap:
    - `git` operations
    - Suno project scraping
    - ChatGPT / Claude / Gemini APIs
- **Evaluation-first design**
  - Before building the agent, design:
    - Success metrics
    - Logging schema
    - “Review dashboards” for you to quickly inspect what agents did.
- **MCP as your universal tool bus**
  - Expose your favorite tools via MCP so Claude, Copilot agents, and other MCP-aware clients can all share them instead of writing one-off integrations.

---

## 6. Minimal agent spec template

```yaml
name: contract-enforcer
goal: >
  Enforce Seam-Driven Development by ensuring contracts and tests exist
  before any implementation code is written.

scope:
  - Parse existing files for contracts/tests
  - Suggest or generate missing contracts/tests
  - Refuse to generate implementation code

inputs:
  - repo_snapshot
  - file_path

outputs:
  - status: [ok | needs_contracts | needs_tests]
  - suggested_changes: [list of edits]
  - next_actions: [human | another_agent | auto_apply]

tools:
  - repo_reader
  - repo_writer
  - test_runner

stop_conditions:
  - 3 failed attempts
  - Human override


---

## 5. `gemini.md`

```markdown
# Gemini – Working Notes & Best Practices

## 1. Role in the stack

Gemini is your **Google-native reasoning + knowledge + multimodal** workhorse. It’s especially good when:

- Your stuff lives in **Docs / Sheets / Drive / Gmail / Calendar**.
- You need to work across text, images, audio, or video.
- You want to hook into GCP / Vertex AI for scalable infra.

---

## 2. Core strengths (vs Claude/Copilot/Agents)

- **First-class Workspace integration**
  - Can search, read, and write Docs, Sheets, Gmail, etc. directly (depending on product/tier).
- **Prompt guides assume “knowledge work”**
  - Official docs focus on drafting, editing, summarizing, and workflow automation inside Workspace.
- **Multimodal**
  - Strong at pulling structure/insight out of screenshots, PDFs, images, and potentially video/audio depending on the interface.
- **API/Vertex integration**
  - Natural fit if you’re already in GCP or want managed infra.

---

## 3. Prompting best practices

**3.1 General pattern**

- Use **clear, concise instructions** rather than long rambling meta-prompts.
- Provide **context**: link or reference the specific Docs/Sheets, datasets, or text you care about.
- Break complex tasks into **steps or subtasks** and iterate.

**3.2 Example patterns**

1. **Workspace “ops manager”**

```text
You are my operations assistant.

Goal:
- Review the following docs: [link or titles].
- Extract:
  - Decisions made
  - Open questions
  - Action items (with owners and deadlines if mentioned)

Output as a Markdown table with columns:
[Doc, Decision, Open Question, Action Item, Owner, Due Date].


Data + narrative blend

You are a data-informed storyteller.

Given this Google Sheet: [link], and this brief: "[short goal]", do:
1. Identify 3–5 key trends.
2. Draft a 1-page narrative summary aimed at [audience].
3. Propose 3 follow-up analyses I should run next.


Multimodal analysis

You are a forensic note-taker.

From this meeting recording / transcript / screenshot:
- List all commitments made (who, what, when).
- List all risks and unknowns.
- Suggest a 5-bullet follow-up plan.

4. Moneyball patterns for Gemini

Use it as “knowledge librarian”

Give it the job of indexing/extracting from Docs/Sheets rather than as a generic chat model, then feed those outputs to Claude/GPT for deep creative work.

Multimodal QA over your evidence

Screenshots of code, error logs, whiteboard photos, etc., then ask for structured summaries and hypotheses.

Drive/Docs → Contracts

Have Gemini trawl project docs for implicit rules and convert them into explicit SDD contracts and style guides.

Short precise prompts for reasoning-heavy tasks

Especially with newer Gemini versions, keep prompts ultra-clear and not over-decorated; let the model do the reasoning.

5. Overlap with others

With Claude:

Similar prompt fundamentals (clarity, examples, roles, output structure).

Claude often for deep style/long context; Gemini for Google-surface and multimodal ops.

With Copilot:

Gemini can act on project docs and specs; Copilot then implements in code.

6. Starter templates
You are a knowledge extraction specialist.

Context:
- Workspace: [describe your Drive/Docs environment]
- Goal: Create and maintain a single source of truth for [project].

Task:
1. Scan [list of docs] and extract:
   - Constraints
   - Style rules
   - Technical decisions
2. Output a unified "CANON.md" spec.

Format:
- Markdown, with sections: Overview, Constraints, Style, Open Questions.


---

## 6. `copilot.md`

```markdown
# GitHub Copilot – Working Notes & Best Practices

## 1. Role in the stack

Copilot is your **in-IDE and GitHub-native coding assistant** plus a set of higher-level agents. It is strongest when:

- You already have a repo and structure.
- You want fast inline suggestions and automated refactors/tests.
- You’re using GitHub issues, PRs, and CI.

---

## 2. Core strengths (vs Claude/Gemini/Agents)

- **Tight IDE integration**
  - Works in VS Code, JetBrains, etc. with full access to open files and project context.
- **Repo awareness**
  - Looks at your project layout, imports, and code style to suggest in-context completions.
- **GitHub-native agents**
  - Task-level Copilot agents that read issues, open branches, edit files, and help manage PRs.

---

## 3. Best practices for daily dev

1. **Open the right files**
   - Before you prompt Copilot, open the files you want it to use as context.
2. **Top-level comment before code**
   - Write a clear comment or docstring: what function/module should do, pre/post-conditions, edge cases.
3. **Guide via granular steps**
   - Ask for one small function or change at a time, not whole subsystems.
4. **Check its work**
   - Always review suggestions, especially around logic, security, and performance.
5. **Use repo-level instructions**
   - Configure `copilot-instructions.md` and org-wide custom instructions to encode:
     - SDD pipeline rules
     - Testing requirements
     - Language/framework preferences
6. **Choose the right Copilot tool**
   - Inline suggestions vs. chat vs. Copilot Agent/Workspace depending on task size.

---

## 4. `copilot-instructions.md` as a weapon

**What to put in there:**

- Coding standards and naming conventions.
- SDD rules:
  - “Never write implementation code before contracts and tests.”
  - “Always create/extend tests when editing logic.”
- Preferred libraries and patterns.
- Anti-patterns (“no magic timestamps”, “no business logic in controllers”, etc.).

This file becomes your **house style + process brain** for Copilot across the repo.

---

## 5. Moneyball patterns for Copilot

- **Use it to write tests first**
  - Given a contract or function signature, have Copilot propose tests; then you refine; then you or another model implement.
- **Feature migration & refactors**
  - Use Copilot to migrate patterns across files (e.g., rewiring to new seam structure) by seeding one ideal example and then repeating.
- **PR-driven development**
  - Combine GitHub issues + Copilot agents so you phrase work as well-scoped tasks, then let the agent handle boilerplate edits while you review.
- **Automated documentation**
  - Have Copilot infer docstrings and basic usage examples from implementations and tests, then refine with another model.

---

## 6. Example top-level comment patterns

```ts
// GOAL: Implement a pure function that validates a Seam contract object.
// Requirements:
// - Input: ContractConfig
// - Output: { ok: boolean; errors: string[] }
// - Rules:
//   - Required fields: name, description, inputs, outputs.
//   - No field may be null/undefined.
//   - errors[] must contain human-readable messages.
// Constraints:
// - Do NOT hit network or filesystem.
// - Do NOT throw; use errors[] instead.

# Task for Copilot Agent

- Scope: Only update unit tests in `tests/contract-validator.spec.ts`.
- Goal: Cover edge cases described in `docs/SDD_CONTRACT_RULES.md`.
- No new dependencies.
- After updating tests, summarize changes in bullet points.


---

If you’d like, next step I can:

- Add a **shared `README-ai-stack.md`** that ties all four together with SDD-specific examples, *or*
- Design a **“usage matrix”**: which tool/model/agent you call at each SDD stage (Identify → Contracts → Tests → Mocks → Implementation → Audit).
::contentReference[oaicite:16]{index=16}