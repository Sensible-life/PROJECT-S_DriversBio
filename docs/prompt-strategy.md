# Prompt Strategy

## Prompt roles

Separate prompts by task instead of relying on one large general prompt.

- `chunking`: break sources into study concepts
- `quiz_generation`: generate safe, concise spoken questions
- `answer_evaluation`: judge correctness, missing points, false claims
- `gap_fill`: complete a user's partial explanation
- `truth_check`: compare explanation against source-backed reference

## Output rules

- Prefer JSON output for machine processing.
- Keep spoken feedback under a short sentence or two.
- Tie evaluations back to source concepts whenever possible.
- Mark uncertainty explicitly instead of inventing certainty.

## Guardrails

- Avoid overly long tutoring responses while driving.
- Avoid asking the user to look at the screen during a live session.
- If the answer is partly correct, separate `correct`, `missing`, and `wrong`.

