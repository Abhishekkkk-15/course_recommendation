// Minimal Vanilla JS Application for Course Recommendations

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-btn");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const btnSpinner = submitBtn.querySelector(".btn-spinner");
const statusBar = document.getElementById("status-bar");

const recommendationSection = document.getElementById("recommendation-section");
const recommendationContent = document.getElementById("recommendation-content");

const coursesSection = document.getElementById("courses-section");
const coursesTitle = document.getElementById("courses-title");
const coursesCount = document.getElementById("courses-count");
const coursesGrid = document.getElementById("courses-grid");

const chips = document.querySelectorAll(".chip");

let allCourses = [];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchInitialCatalog();
  setupEventListeners();
});

function setupEventListeners() {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
    }
  });

  searchInput.addEventListener("input", () => {
    clearBtn.hidden = searchInput.value.trim().length === 0;
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.hidden = true;
    searchInput.focus();
    resetToFullCatalog();
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const q = chip.getAttribute("data-query");
      searchInput.value = q;
      clearBtn.hidden = false;
      performSearch(q);
    });
  });
}

function showLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.hidden = isLoading;
  btnSpinner.hidden = !isLoading;
}

function showStatus(message, type = "info") {
  if (!message) {
    statusBar.hidden = true;
    statusBar.textContent = "";
    statusBar.className = "status-bar";
    return;
  }
  statusBar.hidden = false;
  statusBar.className = `status-bar ${type}`;
  statusBar.textContent = message;
}

// Fetch all courses on initial page load
async function fetchInitialCatalog() {
  try {
    const res = await fetch("/api/courses");
    if (!res.ok) throw new Error("Could not load courses.");
    allCourses = await res.json();
    renderCourses(allCourses, "Available Catalog Courses");
  } catch (err) {
    console.warn("Failed to load initial catalog, will retry on query:", err);
    coursesCount.textContent = "";
  }
}

// Perform course recommendation search
async function performSearch(query) {
  showLoading(true);
  showStatus("");

  try {
    const res = await fetch(`/query?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    displayResults(data);
  } catch (err) {
    console.error("Search error:", err);
    showStatus(`Search failed: ${err.message}`, "error");
  } finally {
    showLoading(false);
  }
}

function displayResults(data) {
  const { courses, recommendation } = data;

  // 1. Render Advisor Recommendation with Markdown
  if (recommendation && recommendation.trim()) {
    recommendationSection.hidden = false;
    recommendationContent.innerHTML = parseMarkdown(recommendation);
  } else {
    recommendationSection.hidden = true;
  }

  // 2. Render Matched Courses
  renderCourses(courses || [], "Recommended Matches");
}

// Markdown Parser Helper with fallback
function parseMarkdown(markdownText) {
  if (!markdownText) return "";

  // 1. Use marked.js if available
  if (typeof window.marked !== "undefined" && typeof window.marked.parse === "function") {
    try {
      window.marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return window.marked.parse(markdownText);
    } catch (e) {
      console.warn("marked.parse error, using fallback parser:", e);
    }
  }

  // 2. Fallback lightweight parser
  return fallbackMarkdownParser(markdownText);
}

function fallbackMarkdownParser(text) {
  let html = escapeHtml(text);

  // Headers
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Unordered list items
  html = html.replace(/^\s*[-*•]\s+(.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>(\n|(?=<li>)))/g, "<ul>$1</ul>");

  // Paragraphs / line breaks
  html = html.replace(/\n\n+/g, "</p><p>");
  html = html.replace(/\n/g, "<br />");
  html = `<p>${html}</p>`;
  
  // Cleanup empty p tags around block elements
  html = html.replace(/<p><(h[1-4]|ul|ol|li|blockquote)>/g, "<$1>");
  html = html.replace(/<\/(h[1-4]|ul|ol|li|blockquote)><\/p>/g, "</$1>");

  return html;
}

function renderCourses(courses, title = "Available Catalog Courses") {
  coursesTitle.textContent = title;
  coursesCount.textContent = `${courses.length} course${courses.length === 1 ? "" : "s"}`;
  coursesGrid.innerHTML = "";

  if (!courses || courses.length === 0) {
    coursesGrid.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">No matching courses found</h3>
        <p class="empty-state-text">Try broadening your search term or clearing budget constraints.</p>
        <button type="button" class="reset-btn" onclick="resetToFullCatalog()">View All Courses</button>
      </div>
    `;
    return;
  }

  courses.forEach((course) => {
    const card = document.createElement("article");
    card.className = "course-card";

    const priceFormatted = course.price !== undefined
      ? `\u20B9${Number(course.price).toLocaleString("en-IN")}`
      : "N/A";

    const statusClass = (course.status || "active").toLowerCase();

    card.innerHTML = `
      <div class="course-header">
        <h3 class="course-title">${escapeHtml(course.course_name || "Untitled Course")}</h3>
        <span class="course-price">${priceFormatted}</span>
      </div>
      <div class="course-badges">
        <span class="badge badge-category">${escapeHtml(course.category || "General")}</span>
        <span class="badge badge-level">${escapeHtml(course.level || "All Levels")}</span>
      </div>
      <p class="course-description">${escapeHtml(course.description || "No description provided.")}</p>
      <div class="course-footer">
        <span class="course-id">#${escapeHtml(String(course.id || ""))}</span>
        <span class="course-status ${statusClass}">${escapeHtml(course.status || "Active")}</span>
      </div>
    `;

    coursesGrid.appendChild(card);
  });
}

function resetToFullCatalog() {
  searchInput.value = "";
  clearBtn.hidden = true;
  recommendationSection.hidden = true;
  showStatus("");
  if (allCourses.length > 0) {
    renderCourses(allCourses, "Available Catalog Courses");
  } else {
    fetchInitialCatalog();
  }
}

// Global helper for reset button
window.resetToFullCatalog = resetToFullCatalog;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
