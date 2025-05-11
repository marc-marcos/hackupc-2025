## Inspiration
We took our inspiration from the blackout we suffered in Spain last Monday.

## What it does
It provides all passengers inside the airport with access to a local webpage designed to be minimalist and energy-efficient, sharing the most critical flight information and ensuring communication remains possible even during outages or emergencies. This platform is hosted in a Raspberry Pi, which is maintained thanks to the new Vueling's mascot: **The Vueling's Goat!**

The webpage also includes a small challenge to lift passengers' spirits: a game where users search the airport for QR codes featuring different goat icons. A live ranking is maintained, and the top 3 players win a final prize.

## How we built it
The frontend was built with HTML, CSS, and JavaScript, and is designed to work entirely offline. The platform is hosted on a Raspberry Pi, which acts as a local Wi-Fi hotspot using tools like hostapd, allowing users to connect without internet access. It runs with low power consumption.
The backend, built with Python and Flask, handles the various services offered by the web platform. For the challenge, we generated QR codes featuring images of the mascot.

## Challenges we ran into
One of the main challenges we faced was managing QR codes locally without internet access. Since the system had to work offline and on a local network, we couldn’t rely on external APIs or cloud services. We had to develop our own method and it has been a real challenge.

Another challenge was reducing power consumption as much as possible while maintaining a useful, understandable, and engaging webpage. To achieve this, we removed all unnecessary visual elements and minimized the parts of the challenge that required active mobile phone usage.

## Accomplishments that we're proud of
What we are most proud of is the use case idea: Vueling's Goat. We believe it has been a fun and engaging concept for users. Additionally, using the Raspberry Pi was a great choice, as it consumes little power and simplifies the system.

## What we learned
Through this project, we learned the challenges and benefits of using Raspberry Pi as hardware for hosting a local web platform. It allowed us to create an independent, offline system while keeping power consumption low, which was essential for our use case.
We also gained valuable experience in building a minimalist, energy-efficient website, focusing on reducing unnecessary features and optimizing performance. This project taught us how to balance functionality with resource constraints, ensuring the platform remained usable and engaging despite limited resources.

## What's next for Vueling Goat Blackout
Moving forward, we plan to expand the functionality of the platform by adding real-time flight updates and integrating with airport systems to provide even more accurate and up-to-date information. We also want to improve the QR challenge by adding more interactive features, such as rewards for players and location-based tasks.
Additionally, we aim to scale the solution to work in other airports, ensuring the system remains efficient and easy to deploy in different environments. With further optimization, we could also explore more advanced features, such as integration with mobile apps or the ability to share data with passengers via Bluetooth for even more accessibility.
