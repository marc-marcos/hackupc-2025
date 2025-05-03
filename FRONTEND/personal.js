document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('data-form');
    const deleteForm = document.getElementById('delete-form');
  
    // Submit flight data
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
        form.reset();
      } catch (err) {
        alert('Error sending data.');
      }
    });
  
    // Delete all flight data
    deleteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      if (!confirm('Are you sure you want to delete all data?')) return;
  
      try {
        const response = await fetch('http://127.0.0.1:5000/delete', {
          method: 'DELETE'
        });
  
        if (!response.ok) throw new Error('Delete failed');
  
        alert('All data deleted.');
      } catch (err) {
        alert('Error deleting data.');
      }
    });
  });
  