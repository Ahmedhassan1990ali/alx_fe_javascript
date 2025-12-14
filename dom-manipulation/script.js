const quoteDisplay = document.getElementById("quoteDisplay");
const newQuote = document.getElementById("newQuote");

let quotes = [
    {text: "Be yourself; everyone else is already taken.", category: "Wisdom"},
    {text: "So many books, so little time.", category: "Reading"},
    {text: "You only live once, but if you do it right, once is enough.", category: "Life"}
];


function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `
        <p><strong>"${randomQuote.text}"</strong></p>
        <p><em>Category: ${randomQuote.category}</em></p>
    `;
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
    
    // Add form to page
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
        
        // Clear inputs
        textInput.value = '';
        categoryInput.value = '';
        
        // Remove form
        document.querySelector('#addForm').remove();
    } else {
        alert('Please fill both fields');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Show first quote
    showRandomQuote();
    
    // Set up new quote button
    document.getElementById('newQuote').onclick = showRandomQuote;
    
    // Add button to create form
    const addButton = document.createElement('button');
    addButton.textContent = 'Add New Quote';
    addButton.onclick = createAddQuoteForm;
    document.body.appendChild(addButton);
});