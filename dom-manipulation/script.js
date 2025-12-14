const API_URL = 'https://jsonplaceholder.typicode.com/posts';
let lastSyncId = localStorage.getItem('lastSyncId') || 0;
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

        // Save to Server
        syncQuotes();

        // Update filters
        updateCategoryFilter();
        filterQuotes();
        
        // Clear inputs
        textInput.value = '';
        categoryInput.value = '';
        
        // Remove form
        document.querySelector('#addForm').remove();

        showNotification('Quote saved and synced to server');
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

async function fetchQuotesFromServer() {
    try {
        // Fetch from server
        const response = await fetch(`${API_URL}?_start=${lastSyncId}&_limit=5`);
        const serverPosts = await response.json();
        
        // Convert posts to quotes format
        const serverQuotes = serverPosts.map(post => ({
            text: post.title.substring(0, 50) + (post.body ? '...' : ''),
            category: 'Server'
        }));
        
        // Add new quotes
        const newQuotes = serverQuotes.filter(serverQuote => 
            !quotes.some(localQuote => localQuote.text === serverQuote.text)
        );
        
        if (newQuotes.length > 0) {
            quotes.push(...newQuotes);
            saveQuotes();
            updateCategoryFilter();
            showNotification(`Quotes synced with server!`);
            
            // Update last sync ID
            if (serverPosts.length > 0) {
                lastSyncId = Math.max(...serverPosts.map(p => p.id));
                localStorage.setItem('lastSyncId', lastSyncId);
            }
        }
        
        return newQuotes.length;
    } catch (error) {
        console.error('Sync failed:', error);
        return 0;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = `🔔 ${message}`;
    notification.style.cssText = 'background: #4CAF50; color: white; padding: 10px; margin: 5px; border-radius: 5px;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

async function syncQuotes() {
    try {
        // Save most recent quote to server
        if (quotes.length > 0) {
            const latestQuote = quotes[quotes.length - 1];
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: latestQuote.text,
                    body: latestQuote.category,
                    userId: 1
                })
            });
            const savedData = await response.json();
            console.log('Saved to server:', savedData);
        }
    } catch (error) {
        console.error('Save to server failed:', error);
    }
}

function manualSync() {
    fetchQuotesFromServer().then(count => {
        if (count === 0) {
            showNotification('No new quotes from server');
        }
    });
}

function resolveConflict() {
    fetchQuotesFromServer().then(() => {
        filterQuotes();
        showNotification('Conflict resolved with server data');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    populateCategories();
    filterQuotes();
    
    document.getElementById('newQuote').onclick = showRandomQuote;
    
    const addButton = document.createElement('button');
    addButton.textContent = 'Add New Quote';
    addButton.onclick = createAddQuoteForm;
    document.body.appendChild(addButton);

     const syncButton = document.createElement('button');
    syncButton.textContent = '🔄 Sync Now';
    syncButton.onclick = manualSync;
    document.body.appendChild(syncButton);
    
    // Add conflict resolution button
    const conflictButton = document.createElement('button');
    conflictButton.textContent = '⚠️ Resolve Conflict';
    conflictButton.onclick = resolveConflict;
    document.body.appendChild(conflictButton);
    
    // Auto-sync every 30 seconds
    setInterval(manualSync, 30000);
    
    // Initial sync
    setTimeout(manualSync, 2000);
    });