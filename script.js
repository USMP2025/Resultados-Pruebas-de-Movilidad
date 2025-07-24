document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.getElementById('categoryFilter');
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    let allPlayersData = []; // To store the parsed CSV data

    // Function to fetch and parse the CSV data
    async function fetchCSVData() {
        // ¡IMPORTANTE! Nombre del archivo CSV actualizado aquí:
        const response = await fetch('Resultados_Dashboard.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - No se pudo cargar el archivo CSV. Verifique el nombre del archivo y la ruta.`);
        }
        const text = await response.text();
        return parseCSV(text);
    }

    // Simple CSV parser
    function parseCSV(text) {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(',').map(header => header.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        }
        return data;
    }

    // Function to populate the category filter
    function populateCategoryFilter(data) {
        const categories = new Set(data.map(player => player.CATEGORÍA));
        const staticCategories = ['SELECTIVO', '2008', '2009', '2010', '2011', '2012'];

        staticCategories.forEach(cat => {
            if (!categories.has(cat)) {
                categories.add(cat);
            }
        });

        let sortedCategories = Array.from(categories).sort((a, b) => {
            if (a === 'SELECTIVO') return -1;
            if (b === 'SELECTIVO') return 1;
            return a.localeCompare(b);
        });

        const uniqueSortedCategories = [...new Set(sortedCategories)];

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
        resultsTableBody.innerHTML = '';

        if (data.length === 0) {
            resultsTableBody.innerHTML = '<tr><td colspan="11" style="text-align:center; color:#555;">No hay datos para esta categoría.</td></tr>';
            return;
        }

        data.forEach(player => {
            const row = resultsTableBody.insertRow();
            row.insertCell().textContent = player.JUGADOR || '';
            row.insertCell().textContent = player.CATEGORÍA || '';
            row.insertCell().textContent = player.FECHA || '';

            const columnsToRender = [
                { numCol: 'THOMAS_PSOAS_D', thumbCol: 'THOMAS PSOAS DER' },
                { numCol: 'THOMAS_PSOAS_I', thumbCol: 'THOMAS PSOAS IZQ' },
                { numCol: 'THOMAS_CUADRICEPS_D', thumbCol: 'THOMAS CUADRICEPS DER' },
                { numCol: 'THOMAS_CUADRICEPS_I', thumbCol: 'THOMAS CUADRICEPS IZQ' },
                { numCol: 'THOMAS_SARTORIO_D', thumbCol: 'THOMAS SARTORIO DER' },
                { numCol: 'THOMAS_SARTORIO_I', thumbCol: 'THOMAS SARTORIO IZQ' },
                { numCol: 'JURDAN_D', thumbCol: 'JURDAN DER' },
                { numCol: 'JURDAN_I', thumbCol: 'JURDAN IZQ' }
            ];

            columnsToRender.forEach(colPair => {
                const cell = row.insertCell();
                const numericValue = (player[colPair.numCol] || '').trim();
                const thumbValue = (player[colPair.thumbCol] || '').trim();

                cell.textContent = numericValue;

                if (thumbValue === '👍') {
                    cell.classList.add('thumb-up');
                } else if (thumbValue === '👎') {
                    cell.classList.add('thumb-down');
                }
            });
        });
    }

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

    fetchCSVData().then(data => {
        allPlayersData = data;
        populateCategoryFilter(allPlayersData);
        renderTable(allPlayersData);
    }).catch(error => {
        console.error("Error al cargar o procesar el CSV:", error);
        resultsTableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:red;">Error al cargar los datos: ${error.message}. Por favor, verifique el nombre del archivo CSV y su contenido.</td></tr>`;
    });
});
