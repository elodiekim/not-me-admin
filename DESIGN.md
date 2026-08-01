# DESIGN.md

# NotMe Design System

Version: 1.0

---

# Design Philosophy

NotMe should feel:

- Friendly
- Calm
- Trustworthy
- Simple
- Slightly playful

Users often open the app during uncomfortable situations (cockroaches, spiders, etc.), so the interface should reduce stress rather than create excitement.

Design should always prioritize clarity over decoration.

---

# Brand Personality

NotMe is:

- Friendly
- Helpful
- Casual
- Human
- Approachable

NotMe is NOT:

- Corporate
- Luxury
- Overly cute
- Gamified
- Complex

---

# Design Principles

Every interface should:

- Have one primary action
- Be easy to understand
- Reduce cognitive load
- Use generous whitespace
- Keep interactions predictable

When in doubt, choose the simpler design.

---

# Product Design Direction

## Consumer App

The consumer app should feel:

- Warm
- Friendly
- Relaxed
- Reassuring

The experience should reduce anxiety during unexpected household problems.

---

## Admin Dashboard

The Admin Dashboard should feel:

- Professional
- Functional
- Fast
- Data-focused

It is an operational tool, not a marketing website.

---

# Visual Style

Overall style:

- Minimal
- Modern
- Rounded
- Clean
- Bright

Avoid:

- Heavy gradients
- Glassmorphism
- Decorative illustrations
- Excessive shadows
- Visual clutter

---

# Color System

## Primary

Used for:

- Primary buttons
- Active navigation
- Important actions

---

## Secondary

Used for:

- Secondary buttons
- Supporting UI

---

## Background

Use bright neutral backgrounds.

Cards should remain visually distinct while keeping strong contrast.

---

## Status Colors

Use consistent colors across both mobile app and admin dashboard.

| Status    | Color  |
| --------- | ------ |
| Searching | Yellow |
| Accepted  | Blue   |
| Arrived   | Purple |
| Completed | Green  |
| Cancelled | Red    |

Never change these colors between screens.

---

# Typography

Typography should be:

- Clean
- Modern
- Highly readable

Hierarchy:

- Heading
- Title
- Body
- Caption

Avoid decorative fonts.

---

# Iconography

Icons should be:

- Rounded
- Simple
- Consistent
- Easy to recognize

Prefer outline or lightly filled icons.

---

# Illustrations

Illustrations belong primarily to the consumer app.

The mascot cat may appear in:

- Empty states
- Success screens
- Marketing assets

The Admin Dashboard should not use illustrations.

---

# Components

## Buttons

### Primary

Used once per screen whenever possible.

---

### Secondary

Used for optional actions.

---

### Text Button

Used for navigation and lightweight actions.

---

## Cards

Cards are the primary layout container.

Cards should:

- Use comfortable padding
- Have subtle borders or shadows
- Avoid unnecessary decoration

---

## Tables

Tables are the primary data presentation component for the Admin Dashboard.

Use tables instead of cards whenever displaying collections of operational data.

---

## Inputs

Inputs should:

- Have clear labels
- Minimize typing
- Support validation gracefully

---

## Bottom Sheets

Preferred over modal pages in the mobile app.

Should focus on a single task.

Not used in the Admin Dashboard.

---

# Layout

## Consumer App

- Mobile-first
- Comfortable spacing
- Large touch targets
- Card-based layout

---

## Admin Dashboard

Desktop-first.

Recommended layout:

- Left Sidebar Navigation
- Top Header
- KPI Cards
- Data Tables
- Detail Panels

Prioritize scanning efficiency over visual flair.

---

# Motion

Animation should support usability.

Examples:

- Navigation transitions
- Loading indicators
- Success feedback
- Button interaction

Avoid unnecessary animation.

---

# Empty States

Every empty state should explain:

- Why nothing is displayed
- What the user can do next

Use friendly language.

---

# Loading States

Prefer skeleton loaders over spinners.

Avoid blank pages.

---

# Feedback

Every important action should provide immediate feedback.

Examples:

- Request Created
- Hero Accepted
- Mission Completed
- Mission Cancelled

---

# Accessibility

Support:

- High contrast
- Readable typography
- Large touch targets
- Keyboard navigation (Admin Dashboard)

Never rely on color alone to communicate status.

---

# Responsive Design

## Consumer App

- Mobile-first
- Tablet supported

---

## Admin Dashboard

- Desktop-first
- Tablet acceptable
- Mobile support not required

---

# Design Goals

The user should never wonder:

- Where am I?
- What should I do next?

Every screen should answer both questions immediately.

---

# Final Statement

Design should always support the product—not compete with it.

The consumer app should feel friendly and reassuring.

The Admin Dashboard should feel like a lightweight startup operations tool focused on speed, clarity, and maintainability.
