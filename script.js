document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.getElementById('categoryFilter');
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    let allPlayersData = []; // To store the parsed CSV data

    // Function to fetch and parse the CSV data
    async function fetchCSVData() {
        // Asegúrate de que este nombre de archivo coincida EXACTAMENTE con el de tu CSV en GitHub
        const response = await fetch('Para deshboard.xlsx - RESULTADOS.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Could not load CSV file. Check filename and path.`);
        }
        const text = await response.text();
        return parseCSV(text);
    }

    // Simple CSV parser (MEJORADO)
    function parseCSV(text) {
        // Separa por líneas, manejando posibles retornos de carro de Windows (\r\n)
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(',').map(header => header.trim()); // Trim headers too
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                // Asegúrate de que values[index] exista antes de llamar a .trim()
                row[header] = values[index] ? values[index].trim() : '';
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

    // Function to render the table rows (VERSION FINAL CORREGIDA)
    function renderTable(data) {
        resultsTableBody.innerHTML = ''; // Clear existing rows

        data.forEach(player => {
            const row = resultsTableBody.insertRow();
            row.insertCell().textContent = player.JUGADOR; // Esta línea es clave para cargar el nombre del jugador
            row.insertCell().textContent = player.CATEGORÍA;
            row.insertCell().textContent = player.FECHA;

            // Definimos los pares de columnas: (columna_numerica, columna_pulgar) del CSV.
            // El orden de estos objetos debe coincidir con el orden de las columnas <th> en index.html.
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
                // Obtenemos el valor numérico, si no existe, será una cadena vacía
                const numericValue = player[colPair.numCol] || '';
                // Obtenemos el valor del pulgar, si no existe o es vacío, será una cadena vacía
                const thumbValue = (player[colPair.thumbCol] || '').trim();

                // Mostramos el valor numérico en la celda
                cell.textContent = numericValue;

                // Agregamos la clase del pulgar si encontramos un pulgar válido
                if (thumbValue === '👍') {
                    cell.classList.add('thumb-up');
                } else if (thumbValue === '👎') {
                    cell.classList.add('thumb-down');
                }
                // El CSS ::before se encargará de añadir el emoji antes del texto
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
            // Filtra los datos basados en la categoría seleccionada
            filteredData = allPlayersData.filter(player => player.CATEGORÍA === selectedCategory);
        }
        renderTable(filteredData); // Llama a la función para re-renderizar la tabla con los datos filtrados
    });

    // Initial data load and render (Carga inicial y manejo de errores)
    fetchCSVData().then(data => {
        allPlayersData = data; // Almacena todos los datos cargados globalmente
        populateCategoryFilter(allPlayersData); // Rellena el filtro de categorías
        renderTable(allPlayersData); // Renderiza la tabla con todos los datos inicialmente
    }).catch(error => {
        console.error("Error al cargar o procesar el CSV:", error);
        // Muestra un mensaje de error en la tabla si falla la carga del CSV
        resultsTableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:red;">Error al cargar los datos: ${error.message}. Por favor, verifique el nombre del archivo CSV y su contenido.</td></tr>`;
    });
});
