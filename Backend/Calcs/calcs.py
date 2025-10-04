from Backend.Meteor.meteor import Meteor, MeteorInvented, Meteors
from Backend.main import *

def calcs(response):
	jsonData = response.json()
	meteors = []
	for neo in jsonData.get("near_earth_objects", []):
		for meteor_data in neo:
			# Extrae los datos necesarios del meteor_data
			meters_min = meteor_data["estimated_diameter"]["meters"]["estimated_diameter_min"]
			meters_max = meteor_data["estimated_diameter"]["meters"]["estimated_diameter_max"]
			kilometers_min = meteor_data["estimated_diameter"]["kilometers"]["estimated_diameter_min"]
			kilometers_max = meteor_data["estimated_diameter"]["kilometers"]["estimated_diameter_max"]
			# ...extrae los demás campos necesarios...
			meteor = Meteor(
				id=meteor_data["id"],
				name=meteor_data["name"],
				designation=meteor_data.get("designation"),
				nasa_jpl_url=meteor_data.get("nasa_jpl_url"),
				meters_min=meters_min,
				meters_max=meters_max,
				kilometers_min=kilometers_min,
				kilometers_max=kilometers_max,
				is_potentially_hazardous_asteroid=meteor_data.get("is_potentially_hazardous_asteroid"),
				close_approach_data=meteor_data.get("close_approach_data", []),
				orbit_id=meteor_data.get("orbital_data", {}).get("orbit_id"),
				orbit_determination_date=meteor_data.get("orbital_data", {}).get("orbit_determination_date"),
				first_observation_date=meteor_data.get("orbital_data", {}).get("first_observation_date"),
				last_observation_date=meteor_data.get("orbital_data", {}).get("last_observation_date"),
				is_sentry_object=meteor_data.get("is_sentry_object")
			)
			meteors.append(meteor)
	return jsonify({"error": "bad request"}), 400

def calcsInvented(response):
	return jsonify({"error": "bad request"}), 400