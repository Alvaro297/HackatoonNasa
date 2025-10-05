from Meteor.meteor import Meteor, MeteorInvented, Meteors
from flask import jsonify

def allCalcs(meteors):
	result = {
		"total_meteors": len(meteors),
		"hazardous_count": sum(1 for m in meteors if m.is_potentially_hazardous_asteroid),
		"meteors": []
	}
	for meteor in meteors:
		meteor_data = meteor.to_dict()
		result["meteors"].append(meteor_data)

	result["meteors"].sort(
		key=lambda x: x.get("estimated_energy_megatons") or 0,
		reverse=True
	)

	return jsonify(result)

def appendMeteors(asteroids, meteors):
	for meteor_data in asteroids:
		# Extrae los datos necesarios del meteor_data
		meters_min = meteor_data["estimated_diameter"]["meters"]["estimated_diameter_min"]
		meters_max = meteor_data["estimated_diameter"]["meters"]["estimated_diameter_max"]
		print("Holaaaaa\n")
		# ...extrae los demás campos necesarios...
		meteor = Meteor(
		id=meteor_data["id"],
		name=meteor_data["name"],
		designation=meteor_data.get("designation"),
		nasa_jpl_url=meteor_data.get("nasa_jpl_url"),
		meters_min=meters_min,
		meters_max=meters_max,
		is_potentially_hazardous_asteroid=meteor_data.get("is_potentially_hazardous_asteroid"),
		close_approach_data=meteor_data.get("close_approach_data", []),
		orbit_id=meteor_data.get("orbital_data", {}).get("orbit_id"),
		orbit_determination_date=meteor_data.get("orbital_data", {}).get("orbit_determination_date"),
		first_observation_date=meteor_data.get("orbital_data", {}).get("first_observation_date"),
		last_observation_date=meteor_data.get("orbital_data", {}).get("last_observation_date"),
		is_sentry_object=meteor_data.get("is_sentry_object")
		)
		meteors.append(meteor)

def calcs(response, isId = False):
	meteors = []
	if isId:
		# response es un objeto único, conviértelo en lista de 1 elemento
		appendMeteors([response], meteors)
	else:
		# response tiene estructura {"near_earth_objects": {"2025-10-05": [...]}}
		for date, asteroids in response.get("near_earth_objects", {}).items():
			appendMeteors(asteroids, meteors)
	if meteors:
		return allCalcs(meteors)
	else:
		return jsonify({"error": "bad request"}), 400

def calcsInvented(response):
    try:
        # Filtrar solo valores que NO son None
        params = {
            key: value 
            for key, value in response.items() 
            if value is not None and key in [
                "diameter_m", "velocity_kms", "impact_angle_deg", 
                "name", "latitude", "longitude", "mitigation"
            ]
        }
        # Pasar solo los que existen
        meteor_invented = MeteorInvented(**params)
        
        return jsonify(meteor_invented.to_dict())
        
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 400