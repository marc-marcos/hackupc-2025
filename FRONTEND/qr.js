function escanear(username) {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const message = document.getElementById('message');
  const startScanButton = document.getElementById('startScan');
  let stream;

  // Si ya estamos escaneando, no hacer nada
  if (startScanButton.textContent === 'Escaneando...') {
      return;
  }

  video.style.display = 'block';
  startScanButton.textContent = 'Escaneando...';
  message.textContent = `Iniciando cámara... Valor recibido: ${inputValue}`;

  // solicitar acceso a la cámara
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      video.play();
      // empezamos a escanear
      requestAnimationFrame(scanQR);
      message.textContent = "Cámara activada. Apunta a un código QR.";
    })
    .catch(err => {
      message.textContent = "Error al acceder a la cámara: " + err;
      video.style.display = 'none';
      startScanButton.textContent = 'Intentar de nuevo';
    });

  async function scanQR() {
      // verificar que se tengan los datos suficientes
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // ajustamos tamaños
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // obtener los datos de la imagen del canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      // si se encuentra un código QR, mostrar el contenido
      if (code) {
        message.textContent = "QR detectado: " + code.data;
        stopCamera();
        // aqui hay que enviar al back el usernme y el code.data para ir sumandolo en el backend
        const payload = [                        
          username,
          code.data
        ];
        try {
          const response = await fetch('http://127.0.0.1:5000/post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
    
          if (!response.ok) throw new Error('Failed to send');
    
          alert('Data sent successfully!');
          form.reset();  // This clears all input fields
        } 
        catch (err) {
          alert('Error sending data.');
        }
        startScanButton.textContent = 'Escanear otro QR';
        return;
      }
    }
    requestAnimationFrame(scanQR);
  }

  function stopCamera() {
      const video = document.getElementById('video');
      const startScanButton = document.getElementById('startScan');
      
      if (video.srcObject) {
          const stream = video.srcObject;
          const tracks = stream.getTracks();
          
          tracks.forEach(track => track.stop());
          video.srcObject = null;
          video.style.display = 'none';
          startScanButton.textContent = 'Iniciar escaneo';
      }
  }
}