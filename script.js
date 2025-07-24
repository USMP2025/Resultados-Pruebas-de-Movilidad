document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.getElementById('categoryFilter');
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    let allPlayersData = []; // To store the parsed CSV data

    // Function to fetch and parse the CSV data
    async function fetchCSVData() {
        // Assuming the CSV file is in the same directory as the HTML file
        const response = await fetch('Para deshboard.xlsx - RESULTADOS.csv');
        const text = await response.text();
        return parseCSV(text);
    }

    // Simple CSV parser
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index].trim();
            });
            data.push(row);
        }
        return data;
    }

    // Function to populate the category filter
    function populateCategoryFilter(data) {
        const categories = new Set(data.map(player => player.CATEGORÍA));
        // Add specific categories as requested by the user, ensuring they are present if not already.
        const staticCategories = ['SELECTIVO', '2008', '2009', '2010', '2011', '2012'];

        // Add static categories first to ensure order and presence
        staticCategories.forEach(cat => {
            if (!categories.has(cat)) {
                categories.add(cat);
            }
        });

        // Convert Set to Array and sort, excluding 'SELECTIVO' from general sort if it was added dynamically
        let sortedCategories = Array.from(categories).sort((a, b) => {
            if (a === 'SELECTIVO') return -1; // Keep SELECTIVO at the top
            if (b === 'SELECTIVO') return 1;
            return a.localeCompare(b);
        });

        // Ensure 'SELECTIVO' is explicitly first if it exists, and remove duplicates that might arise from manual addition + set conversion
        const uniqueSortedCategories = [...new Set(sortedCategories)]; // Final unique sort

        // Clear existing options, except "Todas las Categorías"
        categoryFilter.innerHTML = '<option value="all">Todas las Categorías</option>';

        uniqueSortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Function to render the table rows
    function renderTable(data) {
        resultsTableBody.innerHTML = ''; // Clear existing rows

        data.forEach(player => {
            const row = resultsTableBody.insertRow();
            row.insertCell().textContent = player.JUGADOR;
            row.insertCell().textContent = player.CATEGORÍA;
            row.insertCell().textContent = player.FECHA;

            // Handle THUMBS for various columns
            const thumbColumns = [
                'THOMAS_PSOAS_D', 'THOMAS_PSOAS_I',
                'THOMAS_CUADRICEPS_D', 'THOMAS_CUADRICEPS_I',
                'THOMAS_SARTORIO_D', 'THOMAS_SARTORIO_I',
                'JURDAN_D', 'JURDAN_I'
            ];

            thumbColumns.forEach(colPrefix => {
                // Find the corresponding column that contains the thumb character (e.g., "THOMAS PSOAS DER")
                // We're looking for the column name like "THOMAS PSOAS DER" or "JURDAN DER"
                const displayColName = Object.keys(player).find(key =>
                    key.startsWith(colPrefix) && (key.includes('👍') || key.includes('👎'))
                );

                const cell = row.insertCell();
                if (displayColName && player[displayColName]) {
                    const thumbValue = player[displayColName].trim();
                    if (thumbValue === '👍') {
                        cell.classList.add('thumb-up');
                    } else if (thumbValue === '👎') {
                        cell.classList.add('thumb-down');
                    }
                    // Optionally, you might want to display the numeric value next to the thumb.
                    // If you want the number to be in the cell, you'd need to adjust how the original data is read
                    // or parse the number from the original column (e.g., 'THOMAS_PSOAS_D').
                    // For now, it just adds the class which applies the thumb via CSS ::before
                }
            });
        });
    }


    // Event listener for category filter change
    categoryFilter.addEventListener('change', () => {
        const selectedCategory = categoryFilter.value;
        let filteredData = [];

        if (selectedCategory === 'all') {
            filteredData = allPlayersData;
        } else {
            filteredData = allPlayersData.filter(player => player.CATEGORÍA === selectedCategory);
        }
        renderTable(filteredData);
    });

    // Initial data load and render
    fetchCSVData().then(data => {
        allPlayersData = data;
        populateCategoryFilter(allPlayersData);
        renderTable(allPlayersData); // Render all data initially
    }).catch(error => {
        console.error("Error loading or parsing CSV:", error);
        resultsTableBody.innerHTML = '<tr><td colspan="11" style="text-align:center; color:red;">Error al cargar los datos. Por favor, asegúrese de que el archivo CSV es correcto.</td></tr>';
    });
});