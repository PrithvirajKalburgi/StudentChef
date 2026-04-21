## Overview
This project is a web application designed to help students cook simple, affordable, and nutritious meals using the ingredients they already have at home, whilst also aiming to reduce food wastage. 

Students often face tight budgets and limited groceries. This app solves that by allowing users to input available ingredients and receive AI-generated meal suggestions, complete with cooking instructions and estimated 
nutritional information.

## Features
* Input available ingredients (pantry/fridge) 🥕
* AI-generated recipe suggestions 🤖
* Step-by-step cooking instructions 📋
* Basic nutritional estimates (protein, carbs, fats) 🥗
* Focus on quick and budget-friendly meals ⏱️
* Beginner-friendly recipes 💡

## How the app works (currently)

```mermaid
flowchart TD
    A["User Inputs Ingredients"] --> B["Frontend (React + Vite)"]
    B --> C["Construct Prompt with Ingredients"]
    C --> D["Gemini API Request"]
    D --> E["Gemini 3 Flash Model Processing"]
    E --> F["Generated Recipes + Instructions + Nutrition"]
    F --> G["Display Results to User"]
```

# Explanation
1. The user enters available ingredients along with quantity into the application and then chooses if they want recipes with 100% ingredient match or 1-2 ingredients missing
2. Frontend processes the input and constructs a structured prompt
3. A request is sent to the Gemini API
4. Gemini's LLM model (Gemini Flash 3) generates:
   * Recipe Suggestions
   * Step-by-step instructions
   * Estimated nutritional information
5. Results are then returned and displayed to the user

## Limitations
* Relies on external AI API (rate limits apply)
* Nutritional information is approximate, not accurate

## Future improvements
* Add a caching layer to reduce API usage and improve performance
* Integrate structured recipe/nutrition APIs for higher accuracy
* Backend layer to securely handle API keys
* Personalised meal recommendations

## Run Locally

**Prerequisites:**  Node.js

1.  Install dependencies:
   `npm install`
2. Create [.env] file in the root directory
3. Set the `GEMINI_API_KEY` in [.env] file to your Gemini API key
4. Run the app:
   `npm run dev`

## Screenshots of App

# Light mode:
<img width="1913" height="954" alt="Screenshot 2026-04-21 154813" src="https://github.com/user-attachments/assets/b6dd2797-86b4-4b00-86e2-3f661e21a7e3" />

# Dark mode: 
<img width="1919" height="953" alt="Screenshot 2026-04-21 154830" src="https://github.com/user-attachments/assets/0aed76a4-08f1-430e-ab9b-577a8d5eb5c1" />

# Suggested Meals with 100% ingredient match: 
<img width="1606" height="804" alt="Screenshot 2026-04-21 155126" src="https://github.com/user-attachments/assets/a14bc3fe-4433-4d4a-8707-684148245c25" />
<img width="1650" height="832" alt="Screenshot 2026-04-21 155239" src="https://github.com/user-attachments/assets/f686c422-5527-48fd-bda4-2ceecc8e0c2c" />

# Suggested Meals with 1-2 ingredients missing:
<img width="1604" height="803" alt="Screenshot 2026-04-21 155340" src="https://github.com/user-attachments/assets/d5cade30-2ec7-4887-84bd-e6748ee02ad7" />
<img width="1661" height="837" alt="Screenshot 2026-04-21 155453" src="https://github.com/user-attachments/assets/a699d85a-bc0c-468e-b948-f1195836028d" />








