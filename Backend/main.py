from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import requests
from Calcs.calcs import calcsInvented, calcs
from Meteor.meteor import Meteor, MeteorInvented, Meteors


app = Flask(__name__)

def jsonStartDate(data):
	# Espera fechas en formato 'YYYY-MM-DD'
	start_date = data["start_date"]
	end_date = data.get("end_date")
	if not end_date:
		# Si no hay end_date, suma 7 días
		dt = datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=7)
		end_date = dt.strftime("%Y-%m-%d")
	stringAPI = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={start_date}&end_date={end_date}&api_key={data['api_key']}"
	response = requests.get(stringAPI)
	if response.status_code == 200:
		return calcs(response)
	else:
		return {"error": f"Wrong solicitud {response.status_code}"}

def jsonIdData(data):
	id = str(data["id"])
	stringAPI = f"https://api.nasa.gov/neo/rest/v1/neo/{id}?api_key={data['api_key']}"
	response = requests.get(stringAPI)
	if response.status_code == 200:
		return calcs(response, True)
	else:
		return {"error": f"Wrong solicitud {response.status_code}"}

def jsonNoData(data):
	stringAPI = f"https://api.nasa.gov/neo/rest/v1/neo/browse?api_key={data['api_key']}"
	response = requests.get(stringAPI)
	if response.status_code == 200:
		return calcs(response)
	else:
		return {"error": f"Wrong solicitud {response.status_code}"}

def jsonInvented(data):
	return calcsInvented(data)

@app.route('/api/data', methods=['POST'])
def receive_data():
	data = request.get_json()
	if 'start_date' in data:
		response = jsonStartDate(data)
	elif 'id' in data:
		response = jsonIdData(data)
	elif "api_key" in data and len(data) == 1:
		response = jsonNoData(data)
	elif "invented" in data:
		response = jsonInvented(data)
	else:
		return jsonify({"error": "bad request"}), 400
	return jsonify(response)

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5001)