---
name: interactive-jokes
description: Generate jokes through an interactive process, specifically asking for language (CN/EN), origin (Domestic/Foreign), and target audience (Male/Female) before generating the final joke.
---

# Interactive Jokes 🤡

This skill ensures a personalized joke experience by following a mandatory three-step qualification process before generating any joke content.

## Workflow

When the user asks for a joke, you MUST follow this sequence of questions. Do not combine them unless the user has already provided the information.

### 1. Language Selection

Ask: "你想听中文的还是英文的笑话？" (Do you want a joke in Chinese or English?)

### 2. Origin Selection

Once language is known, ask: "这个笑话是中国的还是外国的？" (Should the joke be domestic/Chinese or foreign?)

### 3. Audience Selection

Finally, ask: "这个笑话是给男性的还是女性的？" (Is this joke for a male or female audience?)

## Generation

After collecting all three parameters, generate a joke that matches the criteria:

- **Language**: [CN | EN]
- **Origin**: [Chinese | Foreign]
- **Audience**: [Male | Female]

Ensure the joke is appropriate and fits the requested cultural context.
