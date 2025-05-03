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

  // Si ya estamos escaneando, no hacer nada
  if (scanning) {
    return;
  }

  // Resetear el estado
  video.style.display = 'block';
  startScanButton.textContent = 'Escaneando...';
  message.textContent = "Iniciando cámara...";
  scanning = true;

  // Solicitar acceso a la cámara
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
      // Intentar con cámara frontal
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

          const checkResponse = await fetch(`http://127.0.0.1:5000/api/checkUser/${username}`);
          if (!checkResponse.ok) {
            throw new Error(`HTTP error! status: ${checkResponse.status}`);
          }

          const userExists = await checkResponse.json();

          if (userExists.exists) { // si el usuario y aexiste, se hace un update
            // Si el usuario ya existe, hacer un update
            const updateResponse = await fetch('http://127.0.0.1:5000/api/updateFlight', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: username,
                name: code.data,
                points: code.data
              }),
            });

            if (!updateResponse.ok) {
              throw new Error(`HTTP error! status: ${updateResponse.status}`);
            }

            const updateResult = await updateResponse.json();
            message.textContent = `QR actualizado para ${username}! ${updateResult.message || ''}`;
          } 
          else { // si no existe el user, se hace un post
            try {
              const response = await fetch('http://127.0.0.1:5000/api/postFlight', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  // ! REPASAR QUE VAMOS A PONER EN LOS QR
                  id: username,
                  name: code.data,
                  points: code.data
                }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();
              message.textContent = `QR registrado para ${username}! ${result.message || ''}`;
            } catch (err) {
              console.error("Error al enviar datos:", err);
              message.textContent = "Error al registrar el QR. Intenta nuevamente.";
            }
            
            startScanButton.textContent = 'Escanear otro QR';
            scanning = false;
            return;
          }
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