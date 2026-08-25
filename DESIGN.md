---
version: alpha
name: "Нотатки+"
description: "Night Notebook workspace for personal notes in Ukrainian."
colors:
  canvas: "#16161D"
  surface: "#22232D"
  paper: "#F4F1EA"
  ink: "#23232B"
  muted: "#686875"
  primary: "#7467E8"
  destructive: "#C5504C"
  focus: "#AAA1FF"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
  sans:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
rounded:
  DEFAULT: "0.75rem"
  sm: "0.375rem"
  lg: "1rem"
spacing:
  page-max: "68rem"
  section-gap: "2rem"
components:
  button: {}
  input: {}
  card: {}
  dialog: {}
---

# Нотатки+ Design System

## Overview

### Creative North Star

Night Notebook: a quiet personal archive with a graphite canvas, warm paper writing surfaces, and a restrained indigo action color.

### Product context and register

- **Audience and primary job:** Ukrainian-speaking individuals capture, find, edit, and safely restore personal notes.
- **Target market(s) and evidence:** Ukraine; product brief and Ukrainian interface copy supplied for this project.
- **Locale(s) and language policy:** Ukrainian only in version one; dates remain browser-local until a locale provider is introduced.
- **Usage scene:** desktop-first personal workspace with functional narrow-mobile layout.
- **Register:** product.
- **Memorable signature:** a small archive index label on workspace headings and note cards.
- **Restraint:** depth comes from the dark canvas and warm writing surfaces; decorative graphics are excluded.
- **Anti-references:** generic SaaS dashboards, faux paper textures, neon gradients, and oversized pill controls.
- **Token ownership/runtime mapping:** this file is implemented by CSS variables in `src/app/globals.css`; shared UI components consume those variables.

## Colors

`canvas` is the application background, `surface` is the dark auth panel, `paper` is the writing surface, `ink` is readable note text, and `primary` is the sole primary action color. `focus` is reserved for keyboard focus and does not depend on color alone.

## Typography

Georgia is restricted to page and note titles. Body and controls use a stable system sans stack. Monospace is used only for technical or date metadata.

## Layout

Pages are centered to `page-max`, with natural document scrolling. Desktop uses a two-column creation/list layout; narrow screens stack the form above the list. Auth screens pair a contextual panel with a focused form and collapse to one card on mobile.

## Elevation & Depth

Panels use a faint border and no permanent shadow. Dialogs use a scrim and a subtle shadow. Sticky navigation remains tonal rather than floating.

## Shapes

Inputs and buttons use `DEFAULT`; cards use `lg`. Danger actions stay outline/ghost until an explicit confirmation surface exists.

## Components

### Foundational visual states

Every control has visible focus, hover, active, disabled, busy, validation-error, loading, empty, and request-error states. Motion is limited to 150ms opacity and color transitions and is disabled for reduced-motion users.

### Buttons and actions

Primary actions use indigo solid styling; neutral actions use an outline; destructive actions use a muted red outline. Busy labels preserve the button width.

### Forms and overlays

Forms use `noValidate`, visible text errors, labels, and `aria-describedby`. Search has an explicit clear action. Product dialogs and toasts will be shared primitives when those flows are added.

## Do's and Don'ts

- **Do:** keep the writing surface quiet so note content remains the visual focus.
- **Do:** use a plain action verb consistently across list and detail screens.
- **Don't:** hide a destructive action inside an unlabeled icon.
- **Don't:** replace an actionable empty state with decorative illustration.
