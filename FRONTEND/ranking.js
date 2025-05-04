fetch('http://127.0.0.1:5000/api/ranking')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (!data.points || !Array.isArray(data.points)) {
            throw new Error("Formato de datos inválido: se esperaba un array en 'points'");
        }

        const tableBody = document.getElementById("data-table");
        tableBody.innerHTML = ""; // vaciamos la tabla antes de llenarla

        // se ordena en el back, no problem
        data.points.forEach(item => {
            const existingRow = Array.from(tableBody.rows).find(row => row.cells[0].textContent === item.name);

            if (existingRow) {  
            // si el usuario ya está en la tabla, sumamos los puntos
            const currentPoints = parseInt(existingRow.cells[1].textContent.replace(' p', ''), 10);
            const newPoints = currentPoints + item.points;
            existingRow.cells[1].textContent = `${newPoints} p`;
            } else {
            // si el usuario no está en la tabla, lo agregamos
            const row = document.createElement("tr");
                    
            const nameCell = document.createElement("td");
            nameCell.textContent = item.name;

            const pointsCell = document.createElement("td");
            pointsCell.textContent = `${item.points} p`;

            row.appendChild(nameCell);
            row.appendChild(pointsCell);
            tableBody.appendChild(row);
            }
        });
    })
    .catch(error => {
        console.error("Error al cargar el ranking:", error);
        
        const tableBody = document.getElementById("data-table");
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="error-message">
                    No se pudo cargar el ranking: ${error.message}
                </td>
            </tr>
        `;
    });