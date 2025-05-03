function escanear() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const message = document.getElementById('message');
    const startScanButton = document.getElementById('startScan');
    let stream;

    video.style.display = 'block';
    startScanButton.textContent = 'Escaneando...';
    message.textContent = "Iniciando cámara...";
  
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
  
    // IMPORTANTE: los datos/string que devuelve el QR es code.data
    function scanQR() {
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
  
  // Ejecutar automáticamente al cargar
  window.addEventListener('load', escanear);
  