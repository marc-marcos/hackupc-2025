fetch('http://127.0.0.1:5000/get')
    .then(response => {
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById("data-table");
        data.data.forEach(item => {
            const row = document.createElement("tr");

            const name = document.createElement("td");
            name.textContent = item.name;

            const points = document.createElement("td");
            points.textContent = `${item.points} p`; 

            row.appendChild(name);
            row.appendChild(points);

            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });