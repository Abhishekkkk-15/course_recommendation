# Course Recommendation
An AI-powered semantic search and recommendation tool that pairs vector embeddings with metadata filtering to suggest learning course's.
## What it does

1. Loads course data from `static/Course_Dummy_Data.csv`.
2. Creates vector embeddings for each course using Mistral embeddings and stores them in memory.
3. When you search something like `"beginner python course under 5000"`:
   - An LLM analyzes your query and figures out the **category**, **level**, **max price**, and a clean **search keyword**.
   - It filters the courses and does a similarity search in the vector store.
   - The LLM writes a personalized recommendation based only on the retrieved courses.
4. Serves a simple, clean frontend (HTML, CSS, JS) on `http://localhost:3000`.

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **AI / LLM**: LangChain (`@langchain/openai`), Groq (`gpt-oss-120b` / ChatOpenAI), Mistral (`mistral-embed`)
- **Validation**: Zod
- **Frontend**: Plain HTML, CSS, JavaScript (no heavy frameworks, uses `marked.js` to render markdown)

---

## Setup Instructions

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Install dependencies
Open terminal in the project folder and run:
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root folder (or copy from `.env.example` if available):

```env
# Mistral API key for embeddings
OPENAI_API_KEY=your_mistral_api_key_here

# Groq API key for chat/structured output
CHAT_API_KEY=your_groq_api_key_here
```

### 4. Run the project
To build TypeScript and start the dev server with nodemon:
```bash
npm run dev
```

The server will start on:
```
http://localhost:3000
```
Open that link in your browser to use the frontend.

---

## Project Structure

```
course_recommendation/
├── assets/                  # Frontend files
│   ├── index.html           # Main UI page
│   ├── style.css            # Styles
│   └── app.js               # Frontend fetch and render logic
├── src/
│   ├── index.ts             # Express server setup and routes
│   ├── llm.ts               # LLM clients, prompt engineering & Zod schemas
│   └── semantic.ts          # CSV loading and MemoryVectorStore search
├── static/
│   └── Course_Dummy_Data.csv# Dummy course catalog
├── package.json
├── tsconfig.json
└── README.md
```

---

## API Documentation

### 1. Search & Recommend Courses
**Endpoint:** `GET /api/query`

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | The student's question or search query |
| `format` | string | No | Optional. Set `format=text` to get raw recommendation text only |

**Example Request:**
```
GET http://localhost:3000/query?q=beginner python under 5000
```

**Example Response (JSON):**
```json
{
  "query": "beginner python under 5000",
  "analysis": {
    "category": "Technology",
    "level": "Beginner",
    "semantic_query": "Python programming",
    "max_price": 5000,
    "show_all": false
  },
  "courses": [
    {
      "id": "111",
      "course_name": "Python for Beginners",
      "category": "Technology",
      "description": "Python for Beginners. Introduction to Python covering fundamentals, functions, data structures and basic projects.",
      "price": 3999,
      "level": "Beginner",
      "status": "Active"
    }
  ],
  "recommendation": "### Recommended Course: Python for Beginners\n- **Category**: Technology\n- **Level**: Beginner\n- **Price**: ₹3,999 (Well within your ₹5,000 budget)\n- **Why it matches**: This course covers all the basics of Python including data structures, functions, and hands-on projects, making it ideal for starting out."
}
```

---

### 2. Get All Catalog Courses
**Endpoint:** `GET /api/courses`

Returns all the courses currently loaded from the CSV dataset.

**Example Request:**
```
GET http://localhost:3000/api/courses
```

**Example Response:**
```json
[
  {
    "id": "101",
    "course_name": "CA Foundation Complete Course",
    "category": "CA",
    "description": "Complete CA Foundation preparation covering Accounts, Law, Economics and Quantitative Aptitude.",
    "price": "9999",
    "level": "Beginner",
    "status": "Active"
  },
  {
    "id": "108",
    "course_name": "Financial Modelling Course",
    "category": "Finance",
    "description": "Financial modelling covering Excel, financial statements, valuation and forecasting.",
    "price": "5999",
    "level": "Intermediate",
    "status": "Active"
  }
]
```

---

## Sample Queries to Try

1. **Budget + Level + Topic:**
   - Query: `I am a beginner and want to learn python programming under 5000`
   - Result: Returns `Python for Beginners` (₹3,999, Beginner, Technology).

2. **Domain specific exam prep:**
   - Query: `CA Foundation full course preparation`
   - Result: Returns `CA Foundation Complete Course` (₹9,999, Beginner, CA).

3. **Finance & Excel:**
   - Query: `Intermediate financial modelling and valuation in Excel`
   - Result: Returns `Financial Modelling Course` (₹5,999) and `Excel for Finance` (₹2,999).

4. **Certifications:**
   - Query: `GST practical training certification`
   - Result: Returns `GST Certification Course` (₹4,999, Beginner, Certification).

5. **Show Everything:**
   - Query: `show all courses`
   - Result: Bypasses filters and lists all 15 catalog courses.
