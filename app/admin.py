
from django.contrib import admin
from .models import User, Building, Apartment, RoomStatus, Person, Reservation, ReserveStatus, LogData

admin.site.register(User)
admin.site.register(Building)
admin.site.register(Apartment)
admin.site.register(RoomStatus)
admin.site.register(Person)
admin.site.register(Reservation)
admin.site.register(ReserveStatus)
admin.site.register(LogData)