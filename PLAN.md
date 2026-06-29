# STEM Competition Planner — PLAN.md

## 1. App Purpose

STEM Competition Planner is a web app for managing students, competitions, activities, teams, timelines, and scheduling conflicts.

The main purpose is to prevent students from being scheduled into overlapping activities when they join multiple competitions.

## 2. Core Concept

This is a multi-competition planner.

Scratch and Robotics are only default examples. The app must allow the user to add new competitions anytime, such as Drone, EZBOT, LEGO, Coding, Innovation Competition, Science Fair, and other future competitions.

## 3. Main Rule

Do not hardcode Scratch and Robotics.

Correct model:

* A competition is dynamic.
* A student can join many competitions.
* An activity belongs to one competition.
* A team belongs to one competition.
* Students are assigned to activities through a join table.
* Conflict detection compares all student activities across all competitions.

## 4. Main Modules

The app will contain these modules:

1. Dashboard
2. Competition Settings
3. Student List
4. Activity Master
5. Activity Participants
6. Student Timeline
7. Timeline Overview
8. Conflict Detection
9. Team Arrangement
10. Reports
11. Settings

## 5. MVP Priority

Build the app in this order:

### MVP 1

* Project setup
* App layout
* Sidebar navigation
* Placeholder pages
* Competition Settings
* Student List

### MVP 2

* Activity Master
* Assign students to activities
* Auto-detect multi-competition students

### MVP 3

* Conflict Detection Engine
* Conflict Detection Page
* Student Timeline

### MVP 4

* Dashboard
* Reports
* Export features

## 6. Anti-Spaghetti Rules

* Do not put all code inside page files.
* Keep UI components separate from business logic.
* Keep conflict detection logic inside `features/conflicts`.
* Keep Supabase queries inside feature modules or data access files.
* Use TypeScript types.
* Use Zod validation for forms.
* Use reusable table and badge components.
* Avoid duplicated logic.
* Avoid hardcoded competition names.
* Avoid storing student lists as comma-separated text.

## 7. Main Success Criteria

The app is successful if it can answer:

Which students are joining multiple competitions, and do they have overlapping activities?
