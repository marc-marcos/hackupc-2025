document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('data-form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const payload = [
        document.getElementById('id').value.trim(),
        document.getElementById('departure').value.trim(),
        document.getElementById('gate').value.trim()
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
      } catch (err) {
        alert('Error sending data.');
      }
    });
  });
  