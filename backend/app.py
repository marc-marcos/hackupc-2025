from flask import Flask, request, jsonify, render_template_string
from datetime import datetime
import sqlite3

app = Flask(__name__)

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
        datetime_obj = datetime.fromisoformat(date_str)  # ISO 8601 format

        # Insert into SQLite database
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO data_store (string1, datetime_obj, string2)
                VALUES (?, ?, ?)
            ''', (string1, datetime_obj.isoformat(), string2))
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
        data = [{"string1": row[0], "datetime_obj": row[1], "string2": row[2]} for row in rows]

        return jsonify({"status": "success", "data": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)