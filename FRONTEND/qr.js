function escanear(username) {
  //si no se ha escrito un nombre de usuario, que no se pueda activar la camara
  if (!username || username.trim() === '') {
    const message = document.getElementById('message');
    message.textContent = "Por favor, ingresa un nombre de usuario antes de escanear.";
    return; 
  }
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const message = document.getElementById('message');
  const startScanButton = document.getElementById('startScan');
  let stream;
  let scanning = false;

  // si ya estamos escaneando, no hacer nada :)
  if (scanning) {
    return;
  }

  // resetear el estado
  video.style.display = 'block';
  startScanButton.textContent = 'Escaneando...';
  message.textContent = "Iniciando cámara...";
  scanning = true;

  // solicitar acceso a la cámara
  navigator.mediaDevices.getUserMedia({ 
    video: { 
      facingMode: "environment",
      width: { ideal: 1280 },
      height: { ideal: 720 }
    } 
  })
  .then(s => {
    stream = s;
    video.srcObject = stream;
    
    return video.play();
  })
  .then(() => {
    message.textContent = "Cámara activada. Apunta a un código QR.";
    scanQR();
  })
  .catch(err => {
    console.error("Error al acceder a la cámara:", err);
    message.textContent = "Error al acceder a la cámara: " + err.message;
    video.style.display = 'none';
    startScanButton.textContent = 'Intentar de nuevo';
    scanning = false;
    
    if (err.name === 'NotAllowedError') {
      message.textContent = "Permiso de cámara denegado. Por favor habilita los permisos.";
    } else if (err.name === 'NotFoundError') {
      message.textContent = "No se encontró cámara trasera. Usando cámara frontal...";
      // intentar con cámara frontal
      // TODO: camara trasera en el movil/ poder cambiar?
      setTimeout(() => escanear(username), 1000);
    }
  });

  async function scanQR() {
    if (!scanning) return;
    
    try {
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          message.textContent = "QR detectado! Procesando...";
          stopCamera();
          

          try {
            // Primero hacemos la petición GET con el contenido del QR
            const qrContent = code.data;
            const getResponse = await fetch(`http://127.0.0.1:5000/api/qr/${qrContent}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            });

            
            if (!getResponse.ok) {
              throw new Error(`HTTP error en GET! status: ${getResponse.status}`);
            }

            // Procesamos la respuesta GET
            const getData = await getResponse.json();
            const stringValue = getData.qr_object.qr_string; // Valor string de la respuesta
            const integerValue = getData.qr_object.qr_integer; // Valor integer de la respuesta
            console.log("AQUI")
            console.log(username)
          
            message.textContent = `Datos obtenidos: ${stringValue}. Enviando información...`;

            // Ahora hacemos la petición POST con el integer recibido
            const postResponse = await fetch('http://127.0.0.1:5000/api/ranking', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                //id: username,
                name: username,
                points: integerValue
              }),
            });

            if (!postResponse.ok) {
              throw new Error(`HTTP error en POST! status: ${postResponse.status}`);
            }
            
            const postResult = await postResponse.json();
            message.textContent = `¡Datos registrados para ${username}! ${postResult.message || ''}`;          } catch (err) {
            console.error("Error al enviar datos:", err);
            message.textContent = "Error al registrar el QR. Intenta nuevamente.";
          }
          
          startScanButton.textContent = 'Escanear otro QR';
          scanning = false;
          return;
        }
      }
      requestAnimationFrame(scanQR);
    } catch (err) {
      console.error("Error en scanQR:", err);
      message.textContent = "Error al escanear. Intenta nuevamente.";
      stopCamera();
      scanning = false;
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    video.style.display = 'none';
    scanning = false;
  }
}