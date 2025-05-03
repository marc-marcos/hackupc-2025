# Documentation

## API

- `/api/getFlights` <- Devuelve todos los vuelos con su número de vuelo, su puerta de embarque y su tiempo estimado.
- `/api/postFlight` <- Inserta un nuevo vuelo a la base de datos, si ya existe se actualiza con esta nueva información (esto hay que implementarlo para que no repitan TODO). Espera: `[codigoVuelo, tiempoEmbarque, puertaEmbarque]`.
- `/api/postUpdate` <- Postea una actualización de un vuelo. Espera: `{"flight_id" : "some_string", "update_text" : "some_string", "submitter_name" : "some_string"}`
- `/api/getUpdates/<flight_id>` <- Recibe las actualizaciones de ese vuelo.
- `/api/ranking` Dependiendo del método:
    - **GET**: Obtiene el ranking de jugadores y sus respectivos puntos.
    - **POST**: Postea un nuevo jugador al ranking, si ya existe se actualiza su puntaución (TODO). Espera: `{"name" : "some_string", "points": 123}`
    - **DELETE**: Borra el ranking.
- `/api/deleteFlights` <- Borrar todos los vuelos.

## Frontend rendering

- `/html/index` <- Devuelve la página `index` para renderizarla.
- `/html/juego` <- Devuelve la página `juego` para renderizarla.
- `/html/personal` <- Devuelve la página `personal` para renderizarla.
- `/html/ranking` <- Devuelve la página `ranking` para renderizarla.
- `/html/vuelo` <- Devuelve la página `vuelo` para renderizarla.