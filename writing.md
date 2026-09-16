# Writing for a short working memory

The reader can hold about three things at once and loses them the moment they scroll. Every rule below exists to stop the page from asking for a fourth.

## The contract of every page

1. **Answer first.** The `.answer` line is the whole page in one sentence. Write it before anything else. If you cannot write it, you do not understand the topic yet.
2. **Three facts to keep.** The `.keep` box holds at most three lines under fifteen words each. These are the only things the page asks the reader to carry.
3. **Chapters are self-contained.** A chapter opens with `.from` (the one fact it builds on, restated, never "as we saw above") and closes with `.remember` (one sentence). A reader who lands mid-page loses nothing.
4. **Recap = the remember lines.** The closing `.recap` list is the chapters' remember lines, copied. Nothing new appears at the end.
5. **The ask is one question.** If a decision is needed, `.ask` holds one question, two to four choices, the recommendation marked, and what happens if the reader does nothing.

## Titles and headings

- Sentence case everywhere: "How you ask for visuals", not "How You Ask For Visuals". Capitals are for names.
- The page title names the subject in 2 to 8 words. Chapter headings are sentences a person would say, and they state the chapter's point, not its topic: "The ask took five shapes" beats "Request patterns".
- Derived numbers are fine when they are plain arithmetic on stated facts (20 asks plus 11 earlier asks is 31). Say what was added when the parts matter.

## Sentences

- One idea per sentence. Under twenty words. A verb in every sentence.
- Paragraphs under forty words. Three sentences is plenty. If a paragraph grows, it is two ideas: split it or turn it into a list, a `.steps` ladder, or a diagram.
- Say it the way you would say it out loud to a friend who is smart but tired. "The server forgets who you are after an hour" beats "session tokens expire after 3600 s".
- Active voice, present tense. "Sync writes career columns only" not "career columns will be written by the sync phase".
- Concrete beats abstract. Name the file, the person, the number, the button. Avoid "the system", "various", "appropriate", "leverage".
- No hedging stacks. One qualifier at most per sentence.
- No em dashes and no semicolons. Each one hides a second idea; give it its own sentence. No middle dots between labels ("A · Adopt"); write "A. Adopt" or just "Adopt".
- The answer bar is one sentence under thirty words. If it needs a second clause, the second clause is a keep-box line.

## Jargon

- The first time a technical word is unavoidable, define it in the same sentence or in a `.term` box directly beneath. Wrap the word in `<dfn>`.
- Prefer the plain word for the rest of the page. If the page must use "idempotent", say "safe to run twice" and put "idempotent" in the term box.
- Analogies work when the mapping is exact. Use `.metaphor` for one analogy per chapter at most, and say where the analogy stops.

## Structure words that do the reader's memory work

| Instead of | Write |
|---|---|
| "As mentioned above" | Restate the fact in `.from` |
| "See section 3" | Link the chapter title, and restate the one fact you need from it |
| "There are several considerations" | "Three things matter:" then a three-item list |
| "It is recommended that" | "Do X." or a `.decision` with the option marked recommended |
| "Note that" | Delete it. Or use a `.callout` if it changes what the reader does |
| "In conclusion" | The `.recap` box |

## What goes in a fold

Anything the reader needs only if they want to verify or act: exact commands, file paths, error text, tables of numbers, commit hashes, the reasoning trail. Put it in `details.fold` with a summary that says what is inside ("Show the exact commands", "Why the other two options lost"). The reading path above the fold must make sense with every fold closed.

## Tone

Calm, direct, warm. No exclamation marks. No "simply" or "just" (they shame the reader who does not find it simple). Errors and risks are stated plainly with what to do about them. Never apologize in the page.

## Numbers

A number appears only when it changes what the reader decides. Then it gets a `.tile` with a label saying what it means, or it sits in a fold. Prose carries at most one number per sentence.

## Self-check before shipping

Read only the `.answer`, the `.keep` box, every `.take` caption and every `.remember` line, in order. If that alone tells the story, the page works. If it does not, the prose is carrying weight that belongs in structure.
