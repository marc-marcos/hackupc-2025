document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('data-form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const payload = {
        name: document.getElementById('id').value.trim(),
        email: document.getElementById('departure').value.trim(),
        message: document.getElementById('gate').value.trim(),
      };
  
      try {
        const response = await fetch('http://192.168.1.42/api', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) throw new Error('Failed to send');
  
        alert('Data sent successfully!');
      } catch (err) {
        alert('Error sending data.');
      }
    });
  });
  