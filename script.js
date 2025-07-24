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
                row[header.trim()] = values[index] ? values[index].trim() : ''; // Handle potential missing values
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

    // Function to render the table rows (CORREGIDA)
    function renderTable(data) {
        resultsTableBody.innerHTML = ''; // Clear existing rows

        data.forEach(player => {
            const row = resultsTableBody.insertRow();
            row.insertCell().textContent = player.JUGADOR;
            row.insertCell().textContent = player.CATEGORÍA;
            row.insertCell().textContent = player.FECHA;

            // Define the pairs of (numeric_column, thumb_column_display_name)
            // The order here must match the <th> order in index.html
            const columnsToRender = [
                { numCol: 'THOMAS_PSOAS_D', thumbCol: 'THOMAS PSOAS DER' },
                { numCol: 'THOMAS_PSOAS_I', thumbCol: 'THOMAS PSOAS IZQ' },
                { numCol: 'THOMAS_CUADRICEPS_D', thumbCol: 'THOMAS CUADRICEPS DER' },
                { numCol: 'THOMAS_CUADRICEPS_I', thumbCol: 'THOMAS CUADRICEPS IZQ' },
                { numCol: 'THOMAS_SARTORIO_D', thumbCol: 'THOMAS SARTORIO DER' },
                { numCol: 'THOMAS_SARTORIO_I', thumbCol: 'THOMAS SARTORIO IZQ' },
                { numCol: 'JURDAN_D', thumbCol: 'JURDAN DER' }, // Asume que "JURDAN D" en tu CSV se refiere a "JURDAN DER" para el pulgar
                { numCol: 'JURDAN_I', thumbCol: 'JURDAN IZQ' }  // Asume que "JURDAN I" en tu CSV se refiere a "JURDAN IZQ" para el pulgar
            ];

            columnsToRender.forEach(colPair => {
                const cell = row.insertCell();
                const numericValue = player[colPair.numCol] || ''; // Get numeric value, default to empty string if not found
                const thumbValue = player[colPair.thumbCol] ? player[colPair.thumbCol].trim() : ''; // Get thumb value

                // Display numeric value
                cell.textContent = numericValue;

                // Add thumb class if a thumb value exists
                if (thumbValue === '👍') {
                    cell.classList.add('thumb-up');
                } else if (thumbValue === '👎') {
                    cell.classList.add('thumb-down');
                }
                // The CSS ::before content will add the actual emoji before the text content
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
