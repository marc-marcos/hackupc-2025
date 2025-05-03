from flask import Flask, request, jsonify, render_template_string
from datetime import datetime
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes

# Initialize SQLite database
DATABASE = 'data_store.db'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data_store (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                string1 TEXT NOT NULL,
                datetime_obj TEXT NOT NULL,
                string2 TEXT NOT NULL
            )
        ''')
        conn.commit()

# Call the function to initialize the database
init_db()

@app.route('/post', methods=['POST'])
def post_object():
    try:
        obj = request.get_json()
        if not isinstance(obj, list) or len(obj) != 3:
            return jsonify({"error": "Expected a list of [string, datetime, string]"}), 400

        # Validate types
        string1, date_str, string2 = obj

        # Insert into SQLite database
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO data_store (string1, datetime_obj, string2)
                VALUES (?, ?, ?)
            ''', (string1, date_str, string2))
            conn.commit()

        return jsonify({"status": "success", "data": obj}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/get', methods=['GET'])
def get_all_objects():
    try:
        # Fetch all records from the data_store table
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT string1, datetime_obj, string2 FROM data_store')
            rows = cursor.fetchall()

        # Format the data as a list of dictionaries
        data = [
            {
                "string1": row[0],
                "datetime_obj": row[1],  # Stored as a plain string
                "string2": row[2]
            }
            for row in rows
        ]

        return jsonify({
            "status": "success",
            "data_store": data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/flight/update', methods=['POST'])
def post_flight_update():
    try:
        data = request.get_json()
        if not isinstance(data, dict) or 'flight_id' not in data or 'update_text' not in data:
            return jsonify({"error": "Expected a JSON object with 'flight_id' and 'update_text'"}), 400

        flight_id = data['flight_id']
        update_text = data['update_text']
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Store as a simple string

        # Insert the update into the database
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO flight_updates (flight_id, update_text, timestamp)
                VALUES (?, ?, ?)
            ''', (flight_id, update_text, timestamp))
            conn.commit()

        return jsonify({"status": "success", "flight_id": flight_id, "update_text": update_text, "timestamp": timestamp}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/flight/updates/<flight_id>', methods=['GET'])
def get_flight_updates(flight_id):
    try:
        # Fetch all updates for the given flight ID
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT update_text, timestamp FROM flight_updates WHERE flight_id = ?
            ''', (flight_id,))
            rows = cursor.fetchall()

        # Format the data as a list of dictionaries
        updates = [{"update_text": row[0], "timestamp": row[1]} for row in rows]

        return jsonify({"status": "success", "flight_id": flight_id, "updates": updates}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/flight/updates/html/<flight_id>', methods=['GET'])
def display_flight_updates_html(flight_id):
    try:
        # Fetch all updates for the given flight ID
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT update_text, timestamp FROM flight_updates WHERE flight_id = ?
            ''', (flight_id,))
            rows = cursor.fetchall()

        # Generate an HTML page to display the updates
        updates_html = ''.join(
            f"<p><strong>{row[1]}</strong>: {row[0]}</p>" for row in rows
        )
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Flight Updates for {flight_id}</title></head>
        <body>
            <h1>Updates for Flight {flight_id}</h1>
            {updates_html}
        </body>
        </html>
        """
        return render_template_string(html_template)

    except Exception as e:
        return f"<p>Error: {str(e)}</p>", 500