# The Balancing Act Between Intuitive UI and Chatbot Agents — Generative UI

*Inspired by [this video](https://youtu.be/f32W5BEzWN0?is=lPv1yNpQoh6k9Esc).*

Chatbots and agents sit at one extreme of the interaction spectrum. Traditional GUIs with buttons, sliders, and dropdown menus sit at the other. Neither is the right answer for everything, and the middle ground is what I'm calling **generative UI**.

## The spectrum

Chat interfaces are great for open-ended tasks where the intent is hard to express through fixed controls. But for anything where you need visual confirmation, spatial reasoning, or structured comparison (booking flights, choosing a sofa, configuring a layout), a wall of text is the wrong medium. Gen Z unanimously agrees: adult purchases happen on a laptop, not through a chatbot on a phone screen.

On the other side, fixed GUIs become nightmares as complexity grows. Anyone who's tried to learn Photoshop knows the pain of navigating millions of dropdowns and sub-dropdowns just to overlay one image on another.

## The historical parallel

Steve Jobs and Steve Wozniak visited Xerox PARC and saw the first graphical user interface. Before that, everything was terminal-based (TUI). The GUI transformed computing and created entire categories of applications.

We're at a similar inflection point. Right now we're in the TUI era of AI, interacting with models through text terminals like Claude Code. The next shift is toward interfaces that are simple by default but can generate custom UI on demand when the task requires something more visual or interactive.

## What generative UI looks like

Instead of a fixed interface that tries to anticipate every use case, the AI generates a purpose-built UI for the specific task at hand. For complex or niche tasks, the chatbot produces interactive components (sliders, visualisations, drag-and-drop layouts) tailored to what you're trying to do.

A personal example: while studying for my D200 exam, I couldn't visualise how the chain rule works in gradient descent. Which nodes get updated, which weights change. I wanted something like a YouTube animation but interactive. Claude generated an HTML file where I could manipulate each piece of the neural network and watch the updates propagate. That's generative UI in action.

Google Search is moving this direction too, generating visual UI elements when a query needs more than a text answer.

## Agents fill the other gap

For tasks that are complex but don't need visual interaction (the Photoshop dropdown problem), agents handle it. They have the knowledge to traverse those menu hierarchies naturally and execute on demand. You describe what you want; the agent navigates the complexity for you.

So the full picture is three layers:
1. **Simple UI** — buttons, sliders, forms for structured everyday tasks
2. **Generative UI** — AI-produced interactive components for visual/spatial tasks
3. **Agentic flows** — fully autonomous execution for complex multi-step operations

## Status

Still very early days. I believe this is the correct direction but I haven't figured out how I'll explore this idea yet. Noted here as a backlog item for the next opportunity.

## Related

- [How I Update the Second Brain](how-i-update-the-second-brain.md) — Claude Code itself is currently a TUI-stage tool
- [Karpathy's LLM Wiki](karpathy-llm-wiki.md) — another pattern where the AI handles complexity behind a simple interface
