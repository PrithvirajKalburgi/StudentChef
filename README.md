## Overview
This project is a web application designed to help students cook simple, affordable, and nutritious meals using the ingredients they already have. 

Students often face tight budgets and limited groceries. This app solves that by allowing users to input available ingredients and receive AI-generated meal suggestions, complete with cooking instructions and estimated 
nutritional information.

## Features
* Input available ingredients (pantry/fridge) 🥕
* AI-generated recipe suggestions 🤖
* Step-by-step cooking instructions 📋
* Basic nutritional estimates (protein, carbs, fats) 🥗
* Focus on quick and budget-friendly meals ⏱️
* Beginner-friendly recipes 💡

## How it works

```mermaid
flowchart TD 
   A[User Inputs Ingredients] --> B[Frontend React + Vite] 
   B --> C[Construct Prompt with Ingredients] 
   C --> D[Gemini API Request] D --> E[Gemini 3 Flash Model Processing] 
   E --> F[Generated Recipes + Instructions + Nutrition] 
   F --> G[Frontend Displays Results to User]
```

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
