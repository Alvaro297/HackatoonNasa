from datetime import datetime
import math

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
		self.orbit_determination_date = datetime.strptime(orbit_determination_date, "%Y-%m-%d %H:%M:%S") if orbit_determination_date else None
		self.first_observation_date = datetime.strptime(first_observation_date, "%Y-%m-%d") if first_observation_date else None
		self.last_observation_date = datetime.strptime(last_observation_date, "%Y-%m-%d") if last_observation_date else None
		#Hasta aqui
		if (is_sentry_object == "false"):
			self.is_sentry_object = False
		else:
			self.is_sentry_object = True
	
	def nearCloseAproach(self, close_approach_data):
		today = datetime.now()
		min_diff = None
		closest = None
    
		for approach_data in close_approach_data:
        # approach_data es un objeto CloseApproachData, no un diccionario
        # Accede con punto, no con corchetes
			date_str = approach_data.close_approach_date
			approach_date = datetime.strptime(date_str, "%Y-%m-%d")
			diff = abs((approach_date - today).total_seconds())
        
			if min_diff is None or diff < min_diff:
				min_diff = diff
				closest = approach_data
		if closest:
			return float(closest.relative_velocity.kilometers_per_second)
		return None

		
	def calcular_energia(self, densidad=3000):
		"""
		Calcula la energía de impacto estimada en megatones de TNT.
		- densidad: kg/m³ (por defecto roca ~3000 kg/m³)
		"""
		if not self.close_approach_data:
			return None  # sin datos de aproximación no se puede calcular

		# Tomamos la velocidad de la primera aproximación
		#velocidad_kms = float(self.close_approach_data[0].relative_velocity.kilometers_per_second)
		velocidad_kms = self.nearCloseAproach(self.close_approach_data)
		velocidad_ms = velocidad_kms * 1000

		# Usamos el diámetro medio
		diametro_m = (self.meters_min + self.meters_max) / 2
		radio = diametro_m / 2

		# Volumen y masa
		volumen = (4/3) * math.pi * (radio ** 3)
		masa = densidad * volumen

		# Energía cinética
		energia_joules = 0.5 * masa * (velocidad_ms ** 2)

		# Conversión a megatones TNT
		energia_megatones = energia_joules / 4.184e15
		return energia_megatones

	def to_dict(self):
		"""
		Devuelve un JSON listo para el frontend con cálculos útiles.
		"""
		if self.close_approach_data:
			cad = self.close_approach_data[0]
			velocity = cad.relative_velocity.kilometers_per_second
			distance_km = cad.miss_distance.kilometers
			date = cad.close_approach_date_full
		else:
			velocity, distance_km, date = None, None, None

		return {
			"id": self.id,
			"name": self.name,
			"size_m": {"min": self.meters_min, "max": self.meters_max},
			"is_hazardous": self.is_potentially_hazardous_asteroid,
			"next_close_approach": date,
			"velocity_km_s": velocity,
			"miss_distance_km": distance_km,
			"estimated_energy_megatons": self.calcular_energia(),
			"url": self.nasa_jpl_url
		}

class MeteorInvented:
	"""
	Clase para los datos inventados por el usuario para simular impactos.
	"""
	def __init__(self, diameter_m=None, velocity_kms=None, impact_angle_deg=None, name="Meteor_Invented",
				 latitude=None, longitude=None, mitigation=None):
		self.name = name or "Meteor_Invented"
		self.diameter_m = float(diameter_m) if diameter_m is not None else 100.0  # tamaño genérico en metros
		self.velocity_kms = float(velocity_kms) if velocity_kms is not None else 20.0  # velocidad genérica km/s
		self.impact_angle_deg = float(impact_angle_deg) if impact_angle_deg is not None else 45.0  # ángulo genérico
		self.latitude = latitude if latitude is not None else 0.0  # latitud genérica
		self.longitude = longitude if longitude is not None else 0.0  # longitud genérica
		self.mitigation = mitigation if mitigation is not None else {"strategy": "none"}  # mitigación genérica
	def calcular_energia(self, densidad=3000):
		"""
		Calcula la energía cinética del impacto (en megatones TNT aprox).
		"""
		r = self.diameter_m / 2
		volumen = (4/3) * math.pi * (r ** 3)  # volumen de esfera
		masa = densidad * volumen  # densidad genérica roca ~3000 kg/m3
		energia_joules = 0.5 * masa * (self.velocity_kms * 1000) ** 2
		# 1 Megatón TNT ≈ 4.184e15 J
		energia_megatones = energia_joules / 4.184e15
		return energia_megatones

	def to_dict(self):
		"""
		Devuelve los cálculos para mostrar en frontend.
		"""
		return {
			"total_meteors": 1,
			"hazardous_count": 0,
			"meteors": [
				{
					"name": self.name,
					"diameter_m": self.diameter_m,
					"velocity_kms": self.velocity_kms,
					"impact_angle_deg": self.impact_angle_deg,
					"latitude": self.latitude,
					"longitude": self.longitude,
					"mitigation": self.mitigation,
					"estimated_energy_megatons": self.calcular_energia()
				}
			]
		}

class Meteors:
	def __init__(self):
		self.lista = []
