from django.db import models

from django.db import models

class User(models.Model):
    userID = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(unique=True)

class Building(models.Model):
    buildingID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300)
    picture = models.ImageField(upload_to='building_pics/', blank=True, null=True)

class RoomStatus(models.Model):
    RESERVABLE = 1
    RESERVED = 2
    MAINTENANCE = 3
    STATUS_CHOICES = [
        (RESERVABLE, 'reservable'),
        (RESERVED, 'reserved'),
        (MAINTENANCE, 'maintenance'),
    ]
    roomstatusID = models.IntegerField(choices=STATUS_CHOICES, primary_key=True)

class Person(models.Model):
    personID = models.AutoField(primary_key=True)
    fname = models.CharField(max_length=100)
    lname = models.CharField(max_length=100)
    birthdate = models.DateField()
    martialstatus = models.CharField(max_length=50)
    phonenumber = models.CharField(max_length=20)
    email = models.EmailField()
    nationalid = models.CharField(max_length=50, unique=True)

class Apartment(models.Model):
    apartmentID = models.AutoField(primary_key=True)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='apartments')
    number = models.IntegerField()
    floor = models.IntegerField()
    rooms = models.IntegerField()
    kitchen = models.IntegerField()
    bathroom = models.IntegerField()
    livingroom = models.IntegerField()
    roomstatus = models.ForeignKey(RoomStatus, on_delete=models.SET_NULL, null=True)
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True, blank=True, related_name='apartments')

class ReserveStatus(models.Model):
    ACTIVE = 1
    INACTIVE = 2
    STATUS_CHOICES = [
        (ACTIVE, 'active'),
        (INACTIVE, 'inactive'),
    ]
    reservestatusID = models.IntegerField(choices=STATUS_CHOICES, primary_key=True)

class Reservation(models.Model):
    reservatioID = models.AutoField(primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE)
    startdate = models.DateField()
    finaldate = models.DateField()
    reservestatus = models.ForeignKey(ReserveStatus, on_delete=models.SET_NULL, null=True)

#still, I haven't decided about including logdata.
class LogData(models.Model): 
    logdataID = models.AutoField(primary_key=True)
    action = models.CharField(max_length=255)
    user_identifier = models.CharField(max_length=150)
    timestamp = models.DateTimeField(auto_now_add=True)
