from datetime import datetime

class RelativeVelocity:
	def __init__(self, kilometers_per_second, kilometers_per_hour, miles_per_hour):
		self.kilometers_per_second = float(kilometers_per_second)
		self.kilometers_per_hour = float(kilometers_per_hour)
		self.miles_per_hour = float(miles_per_hour)

class MissDistance:
	def __init__(self, astronomical, lunar, kilometers, miles):
		self.astronomical = float(astronomical)
		self.lunar = float(lunar)
		self.kilometers = float(kilometers)
		self.miles = float(miles)

class CloseApproachData:
	def __init__(self, close_approach_date, close_approach_date_full, epoch_date_close_approach,
				 relative_velocity, miss_distance, orbiting_body):
		self.close_approach_date = close_approach_date
		self.close_approach_date_full = close_approach_date_full
		self.epoch_date_close_approach = int(epoch_date_close_approach)
		self.relative_velocity = RelativeVelocity(**relative_velocity)
		self.miss_distance = MissDistance(**miss_distance)
		self.orbiting_body = orbiting_body

class Meteor:
	def __init__(self, id, name, designation, nasa_jpl_url,
				 meters_min, meters_max, is_potentially_hazardous_asteroid,
				 close_approach_data, orbit_id, orbit_determination_date, first_observation_date,
				 last_observation_date, is_sentry_object):
		self.id = int(id)
		self.name = name
		self.designation = designation
		self.nasa_jpl_url = nasa_jpl_url
		#Se debe de extraer de estimated_diameter->meters
		#Metodo: hola = data["estimated_diameter"]   hola2 = hola["meters"]   meters_min = hola2["meters_min"]
		self.meters_min = float(meters_min)
		self.meters_max = float(meters_max)
		self.kilometers_min = self.meters_min / 1000
		self.kilometers_max = self.meters_max / 1000
		self.is_potentially_hazardous_asteroid = is_potentially_hazardous_asteroid
		self.close_approach_data = [CloseApproachData(**cad) for cad in close_approach_data]
		#Apartir de aqui todo viene de una clase llamada orbital data
		self.orbit_id = int(orbit_id)
		self.orbit_determination_date = datetime(orbit_determination_date)
		self.first_observation_date = datetime(first_observation_date)
		self.last_observation_date = datetime(last_observation_date)
		#Hasta aqui
		if (is_sentry_object == "false"):
			self.is_sentry_object = False
		else:
			self.is_sentry_object = True

class MeteorInvented:
	"""
	Clase para los datos inventados por el usuario para simular impactos.
	"""
	def __init__(self, name, diameter_m, velocity_kms, impact_angle_deg,
				 latitude=None, longitude=None, mitigation=None):
		self.name = name  # nombre del asteroide inventado
		self.diameter_m = float(diameter_m)  # tamaño en metros
		self.velocity_kms = float(velocity_kms)  # velocidad km/s
		self.impact_angle_deg = float(impact_angle_deg)  # ángulo de entrada
		self.latitude = latitude  # latitud del impacto
		self.longitude = longitude  # longitud del impacto
		self.mitigation = mitigation  # dict con estrategia de mitigación opcional


class Meteors:
	def __init__(self):
		self.lista = []
