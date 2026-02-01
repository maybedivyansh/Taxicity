# CAi (formerly Tax-Loss Shadow)

An AI-driven tax optimization dashboard designed for Indian freelancers. This project uses Next.js, TypeScript, and Tailwind CSS.

## Project Overview

- **Name**: tax-loss-shadow
- **Stack**: Next.js + TypeScript + Tailwind
- **Goal**: Real-time tax optimization

## Multi-Device Workflow

This project is developed by 3 agents working in parallel:
- **Agent A**: Data Services (Device 1) - `agent-a-data`
- **Agent B**: Tax Logic (Device 2) - `agent-b-tax`
- **Agent C**: UI Components (Device 3) - `agent-c-ui`

Each agent edits their branch, then merges to `develop`, then `main`.

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/tax-loss-shadow.git
    cd tax-loss-shadow
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Run Tests**
    ```bash
    npm test
    ```

## Structure
- `/src/types`: Shared interfaces.
- `/src/services`: Agent A (Data).
- `/src/lib`: Agent B (Tax Logic).
- `/src/components`: Agent C (UI).
- `/docs`: Documentation and instructions per agent.
