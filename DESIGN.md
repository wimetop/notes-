---
version: alpha
name: "Нотатки+"
description: "Calm, tactile workspace for personal notes in Ukrainian."
colors:
  ink: "#1F2A24"
  paper: "#F2F3EC"
  panel: "#FFFFFF"
  moss: "#2F6B52"
  clay: "#B75D46"
  mist: "#D9E2D5"
  focus: "#275DDE"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
  sans:
    fontFamily: "Arial, Helvetica, sans-serif"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
rounded:
  DEFAULT: "0.625rem"
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

An annotated field notebook: soft paper surface, practical ink, and one moss-green mark that distinguishes saved work from draft space.

### Product context and register

- **Audience and primary job:** Ukrainian-speaking individuals capture, find, edit, and safely restore personal notes.
- **Target market(s) and evidence:** Ukraine; product brief and Ukrainian interface copy supplied for this project.
- **Locale(s) and language policy:** Ukrainian only in version one; dates remain browser-local until a locale provider is introduced.
- **Usage scene:** desktop-first personal workspace with functional narrow-mobile layout.
- **Register:** product.
- **Memorable signature:** note cards use a narrow moss left rule that carries the notebook metaphor without adding decoration.
- **Restraint:** forms, destructive controls, and error states remain conventional and high-contrast.
- **Anti-references:** dashboard gradients, neon admin panels, and faux paper textures that reduce legibility.
- **Token ownership/runtime mapping:** this file is implemented by CSS variables in `src/app/globals.css`; shared UI components consume those variables.

## Colors

`paper` is the document surface, `panel` is an editable object, `ink` is primary text, and `moss` is the only primary action color. `clay` communicates destructive actions. `focus` is reserved for keyboard focus and does not depend on color alone.

## Typography

Display type is restricted to page titles and note titles. Body and controls use a stable system sans stack. Monospace is used only for technical or date metadata.

## Layout

Pages are centered to `page-max`, with natural document scrolling. Desktop uses a two-column creation/list layout; narrow screens stack the form above the list. Async states reserve the card/form region rather than shifting controls.

## Elevation & Depth

Panels use a faint border and no permanent shadow. Dialogs use a scrim and a subtle shadow. Sticky navigation remains tonal rather than floating.

## Shapes

Inputs and buttons use `DEFAULT`; cards use `lg`. Danger actions stay outline/ghost until an explicit confirmation surface exists.

## Components

### Foundational visual states

Every control has visible focus, hover, active, disabled, busy, validation-error, loading, empty, and request-error states. Motion is limited to 150ms opacity and color transitions and is disabled for reduced-motion users.

### Buttons and actions

Primary actions use moss solid styling; neutral actions use outline; destructive actions use clay outline. Busy labels preserve the button width.

### Forms and overlays

Forms use `noValidate`, visible text errors, labels, and `aria-describedby`. Search has an explicit clear action. Product dialogs and toasts will be shared primitives when those flows are added.

## Do's and Don'ts

- **Do:** keep the writing surface quiet so note content remains the visual focus.
- **Do:** use a plain action verb consistently across list and detail screens.
- **Don't:** hide a destructive action inside an unlabeled icon.
- **Don't:** replace an actionable empty state with decorative illustration.
