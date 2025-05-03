document.addEventListener('DOMContentLoaded', () => {
    // Get form references using the updated IDs
    const flightForm = document.getElementById('flight-form');
    const commentForm = document.getElementById('comment-form');
    const deleteForm = document.getElementById('delete-form');
    const flightSelect = document.getElementById('flight-select');
    
    // Function to fetch and populate flight options
    const loadFlightOptions = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/get');
            
            if (!response.ok) throw new Error('Failed to fetch flights');
            
            const data = await response.json();
            
            // Clear the select options except the first one
            flightSelect.innerHTML = '<option value="">Select a flight</option>';
            
            // Add flight options to the select dropdown based on the API structure
            data.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.string1; // Flight ID based on your API structure
                option.textContent = item.string1; // Display just the flight ID
                flightSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Error loading flights:', err);
            // Add fallback option if flights can't be loaded
            flightSelect.innerHTML = '<option value="">Unable to load flights</option>';
        }
    };
    
    // Load flight options when page loads
    loadFlightOptions();
    
    // Submit flight data
    flightForm.addEventListener('submit', async (e) => {
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
            
            alert('Flight data sent successfully!');
            flightForm.reset();
            
            // Reload flight options after adding a new flight
            loadFlightOptions();
        } catch (err) {
            alert('Error sending flight data.');
            console.error(err);
        }
    });
    
    // Submit comment to flight
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const flightId = flightSelect.value;
        const comment = document.getElementById('comment').value.trim();
        
        if (!flightId) {
            alert('Please select a flight.');
            return;
        }
        
        // Format payload as an array to match the existing API pattern
        const payload = [
            flightId,  // Flight ID
            comment    // Comment text
        ];
        
        try {
            const response = await fetch('http://127.0.0.1:5000/flight/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                //TO DO: add name of the comentarist
                body: JSON.stringify({
                    flight_id: flightId,
                    update_text: comment,
                    submitter_name: "Vueling",
                }),
            });
            
            if (!response.ok) throw new Error('Failed to send comment');
            
            alert('Comment submitted successfully!');
            commentForm.reset();
        } catch (err) {
            alert('Error submitting comment.');
            console.error(err);
        }
    });
    
    // Delete all flight data
    deleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!confirm('Are you sure you want to delete all data from the ranking?')) return;
        
        try {
            const response = await fetch('http://127.0.0.1:5000/points', {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Delete failed');
            
            alert('All data deleted.');
            
            // Clear flight options after deletion
            flightSelect.innerHTML = '<option value="">Select a flight</option>';
        } catch (err) {
            alert('Error deleting data.');
            console.error(err);
        }
    });
});