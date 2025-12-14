const quoteDisplay = document.getElementById("quoteDisplay");
const newQuote = document.getElementById("newQuote");

let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    {text: "Be yourself; everyone else is already taken.", category: "Wisdom"},
    {text: "So many books, so little time.", category: "Reading"},
    {text: "You only live once, but if you do it right, once is enough.", category: "Life"}
];

let currentCategory = localStorage.getItem('selectedCategory') || 'all';


function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category))];
    const select = document.createElement('select');
    select.id = 'categoryFilter';
    select.innerHTML = `
        <option value="all" ${currentCategory === 'all' ? 'selected' : ''}>All Categories</option>
        ${categories.map(cat => 
            `<option value="${cat}" ${currentCategory === cat ? 'selected' : ''}>${cat}</option>`
        ).join('')}
    `;
    select.onchange = function() {
        currentCategory = this.value;
        localStorage.setItem('selectedCategory', currentCategory);
        filterQuotes();
    };
    document.body.insertBefore(select, quoteDisplay.nextSibling);
}

function filterQuotes() {
    const filtered = currentCategory === 'all' 
        ? quotes 
        : quotes.filter(q => q.category === currentCategory);
    
    if (filtered.length === 0) {
        quoteDisplay.innerHTML = `<p>No quotes found for "${currentCategory}"</p>`;
        return;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const randomQuote = filtered[randomIndex];
    quoteDisplay.innerHTML = `
        <p><strong>"${randomQuote.text}"</strong></p>
        <p><em>Category: ${randomQuote.category}</em></p>
        <small>Showing ${filtered.length} quote(s)</small>
    `;
}

function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `
        <p><strong>"${randomQuote.text}"</strong></p>
        <p><em>Category: ${randomQuote.category}</em></p>
    `;
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function createAddQuoteForm() {
    // Remove old form if exists
    const oldForm = document.querySelector('#addForm');
    if (oldForm) oldForm.remove();
    
    // Create form
    const form = document.createElement('div');
    form.id = 'addForm';
    form.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button onclick="addQuote()">Add Quote</button>
    `;
    document.body.appendChild(form);
}

function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();
    
    if (text && category) {
        // Add to array
        quotes.push({text: text, category: category});

        // Save to localStorage
        localStorage.setItem('quotes', JSON.stringify(quotes)); 
        
        // Clear inputs
        textInput.value = '';
        categoryInput.value = '';
        
        // Remove form
        document.querySelector('#addForm').remove();
    } else {
        alert('Please fill both fields');
    }
}

function updateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    
    const categories = getCategories();
    select.innerHTML = `
        <option value="all" ${currentCategory === 'all' ? 'selected' : ''}>All Categories</option>
        ${categories.map(cat => 
            `<option value="${cat}" ${currentCategory === cat ? 'selected' : ''}>${cat}</option>`
        ).join('')}
    `;
}

function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const imported = JSON.parse(e.target.result);
        quotes.push(...imported);
        saveQuotes();
        showRandomQuote();
        alert(`Imported ${imported.length} quotes`);
    };
    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', function() {
    populateCategories();
    filterQuotes();
    
    document.getElementById('newQuote').onclick = showRandomQuote;
    
    const addButton = document.createElement('button');
    addButton.textContent = 'Add New Quote';
    addButton.onclick = createAddQuoteForm;
    document.body.appendChild(addButton);

    });