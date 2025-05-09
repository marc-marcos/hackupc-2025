from flask import Flask, render_template, request, jsonify, render_template_string
from datetime import datetime
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS flight_updates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                flight_id TEXT NOT NULL,
                update_text TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                submitter_name TEXT NOT NULL
            )
        ''')
        conn.commit()

# Add a new table for storing names and points
def init_points_table():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS points_table (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                points INTEGER NOT NULL
            )
        ''')
        conn.commit()

# Add a new table for storing QR objects
def init_qr_table():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS qr_table (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                qr_string TEXT NOT NULL,
                qr_integer INTEGER NOT NULL
            )
        ''')
        conn.commit()

# Call the function to initialize the database
init_db()

# Initialize the points table
init_points_table()

# Initialize the QR table
init_qr_table()

###############################
#       API METHODS
###############################

@app.route('/api/postFlight', methods=['POST'])
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

@app.route('/api/getFlights', methods=['GET'])
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

@app.route('/api/postUpdate', methods=['POST'])
def post_flight_update():
    try:
        data = request.get_json()
        if not isinstance(data, dict) or 'flight_id' not in data or 'update_text' not in data or 'submitter_name' not in data:
            return jsonify({"error": "Expected a JSON object with 'flight_id', 'update_text', and 'submitter_name'"}), 400

        flight_id = data['flight_id']
        update_text = data['update_text']
        submitter_name = data['submitter_name']
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Store as a simple string

        # Insert the update into the database
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO flight_updates (flight_id, update_text, timestamp, submitter_name)
                VALUES (?, ?, ?, ?)
            ''', (flight_id, update_text, timestamp, submitter_name))
            conn.commit()

        return jsonify({"status": "success", "flight_id": flight_id, "update_text": update_text, "submitter_name": submitter_name, "timestamp": timestamp}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/getUpdates/<flight_id>', methods=['GET'])
def get_flight_updates(flight_id):
    print("Can i print?")

    try:
        # Fetch all updates for the given flight ID
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT update_text, timestamp, submitter_name FROM flight_updates WHERE flight_id = ?
            ''', (flight_id,))
            rows = cursor.fetchall()

        # Format the data as a list of dictionaries
        updates = [
            {"update_text": row[0], "timestamp": row[1], "submitter_name": row[2]}
            for row in rows
        ]

        return jsonify({"status": "success", "flight_id": flight_id, "updates": updates}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route('/api/deleteFlights', methods=['DELETE'])
def delete_all_data():
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM data_store')
            conn.commit()
        return jsonify({"status": "success", "message": "All data deleted."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/ranking', methods=['GET'])
def get_all_points():
    try:
        # Fetch all records from the points_table, ordered by points in descending order
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT name, points FROM points_table ORDER BY points DESC')
            rows = cursor.fetchall()

        # Format the data as a list of dictionaries
        data = [{"name": row[0], "points": row[1]} for row in rows]

        return jsonify({"status": "success", "points": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/ranking', methods=['POST'])
def add_points():
    try:
        data = request.get_json()
        if not isinstance(data, dict) or 'name' not in data or 'points' not in data:
            return jsonify({"error": "Expected a JSON object with 'name' and 'points'"}), 400

        name = data['name']
        points = data['points']

        # Insert the new entry into the points_table
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO points_table (name, points)
                VALUES (?, ?)
            ''', (name, points))
            conn.commit()

        return jsonify({"status": "success", "name": name, "points": points}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/ranking', methods=['DELETE'])
def delete_all_points():
    try:
        # Delete all records from the points_table
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM points_table')
            conn.commit()

        return jsonify({"status": "success", "message": "All points deleted."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/qr', methods=['GET'])
def get_all_qr():
    try:
        # Fetch all records from the qr_table
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT qr_string, qr_integer FROM qr_table')
            rows = cursor.fetchall()

        # Format the data as a list of dictionaries
        data = [{"qr_string": row[0], "qr_integer": row[1]} for row in rows]

        return jsonify({"status": "success", "qr_objects": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/qr', methods=['POST'])
def add_qr():
    try:
        data = request.get_json()
        if not isinstance(data, dict) or 'qr_string' not in data or 'qr_integer' not in data:
            return jsonify({"error": "Expected a JSON object with 'qr_string' and 'qr_integer'"}), 400

        qr_string = data['qr_string']
        qr_integer = data['qr_integer']

        # Insert the new QR object into the qr_table
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO qr_table (qr_string, qr_integer)
                VALUES (?, ?)
            ''', (qr_string, qr_integer))
            conn.commit()

        return jsonify({"status": "success", "qr_string": qr_string, "qr_integer": qr_integer}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/qr/<qr_string>', methods=['GET'])
def get_qr_by_string(qr_string):
    try:
        # Fetch the QR object that matches the given qr_string
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT qr_string, qr_integer FROM qr_table WHERE qr_string = ?', (qr_string,))
            row = cursor.fetchone()

        # If no matching QR object is found, return a 404 error
        if row is None:
            return jsonify({"error": f"No QR object found with qr_string: {qr_string}"}), 404

        # Format the data as a dictionary
        qr_object = {"qr_string": row[0], "qr_integer": row[1]}

        return jsonify({"status": "success", "qr_object": qr_object}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


###############################
#   HTML RENDERING METHODS
###############################

@app.route('/', methods=['GET'])
def index():
    return render_template("index.html")

@app.route('/ranking', methods=['GET'])
def ranking():
    return render_template("ranking.html")

@app.route('/juego', methods=['GET'])
def juego():
    return render_template("juego.html")

@app.route('/personal', methods=['GET'])
def personal():
    return render_template("personal.html")

@app.route('/vuelo/<vuelo_num>', methods=['GET'])
def vuelo(vuelo_num):
    return render_template("vuelo.html", flight_id=vuelo_num)

@app.route('/map', methods=['GET'])
def mapa():
    return render_template("map.html")


if __name__ == '__main__':
    app.run(debug=True)